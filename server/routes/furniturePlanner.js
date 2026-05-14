const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../openrouter');
const router = express.Router();

// POST /api/ai/furniture-plan
router.post('/furniture-plan', auth, aiRateLimiter, async (req, res) => {
  try {
    const { room_id, style_preference, budget_max } = req.body;

    if (!room_id) {
      return res.status(400).json({ error: 'room_id is required' });
    }

    // Fetch room details
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [room_id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    const room = roomResult.rows[0];

    // Fetch all available furniture inventory
    const furnitureResult = await pool.query(
      'SELECT id, name, category, style, color, rental_price_daily, dimensions FROM furniture_inventory WHERE available = true ORDER BY rental_price_daily ASC'
    );
    const furniture = furnitureResult.rows;

    if (furniture.length === 0) {
      return res.status(400).json({ error: 'No furniture available in inventory' });
    }

    const furnitureList = furniture.map(f =>
      `ID:${f.id} | ${f.name} | ${f.category} | ${f.style} | ${f.color} | $${f.rental_price_daily}/day | ${f.dimensions || 'N/A'}`
    ).join('\n');

    const prompt = `As a professional home stager, select furniture from this inventory to furnish a room.

Room Details:
- Name: ${room.name}
- Type: ${room.room_type}
- Dimensions: ${room.width || '?'}ft x ${room.length || '?'}ft
- Current Condition: ${room.current_condition || 'Unknown'}
- Notes: ${room.notes || 'None'}

Style Preference: ${style_preference || 'Modern Transitional'}
Daily Budget Maximum: $${budget_max || 500}

Available Furniture Inventory (ID | Name | Category | Style | Color | Daily Price | Dimensions):
${furnitureList}

Select the best combination of items from this inventory that:
1. Fits the room type and dimensions
2. Matches the style preference
3. Stays within the daily budget
4. Creates a cohesive, staged look

Return ONLY valid JSON (no markdown) in this exact format:
{
  "selected_items": [
    {"id": number, "name": string, "rental_price_daily": number, "placement_suggestion": string}
  ],
  "total_daily_cost": number,
  "arrangement_notes": string
}`;

    const result = await callOpenRouter(prompt);

    if (result.error) {
      return res.status(500).json({ error: result.content });
    }

    // Parse structured JSON from AI response
    let structured = null;
    try {
      const cleaned = result.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      structured = JSON.parse(cleaned);
    } catch {
      structured = null;
    }

    // Log to ai_staging_suggestions
    if (structured?.selected_items) {
      const suggestion = `Furniture plan for room ${room.name}: ${structured.selected_items.map(i => i.name).join(', ')}. Total: $${structured.total_daily_cost}/day`;
      await pool.query(
        `INSERT INTO ai_staging_suggestions (room_id, suggestion_type, suggestion, estimated_cost, impact_level, ai_model)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [room_id, 'furniture_plan', suggestion, structured.total_daily_cost, 'high', 'anthropic/claude-3-5-sonnet-20241022']
      ).catch(err => console.error('Failed to log AI suggestion:', err));
    }

    res.json({
      success: true,
      room,
      plan: structured,
      rawResponse: result.content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    console.error('Furniture planner error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
