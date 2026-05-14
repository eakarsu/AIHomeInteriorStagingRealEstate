const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../openrouter');
const router = express.Router();

// POST /api/ai/generate-listing-copy
router.post('/generate-listing-copy', auth, aiRateLimiter, async (req, res) => {
  try {
    const { property_id } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: 'property_id is required' });
    }

    // Fetch property details
    const propResult = await pool.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    const property = propResult.rows[0];

    // Fetch rooms
    const roomsResult = await pool.query('SELECT * FROM rooms WHERE property_id = $1', [property_id]);
    const rooms = roomsResult.rows;

    // Fetch staging projects
    const projectsResult = await pool.query('SELECT * FROM staging_projects WHERE property_id = $1', [property_id]);
    const projects = projectsResult.rows;

    const roomList = rooms.map(r =>
      `- ${r.name} (${r.room_type}): ${r.width || '?'}x${r.length || '?'} ft, condition: ${r.current_condition || 'unknown'}`
    ).join('\n');

    const projectList = projects.map(p =>
      `- ${p.title}: ${p.style} style, budget $${p.budget || 0}, status: ${p.status}`
    ).join('\n');

    const prompt = `As a luxury real estate copywriter, create compelling listing copy for this property.

Property Details:
- Title: ${property.title}
- Address: ${property.address}, ${property.city}, ${property.state} ${property.zip}
- Type: ${property.property_type}
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Square Footage: ${property.sqft} sqft
- List Price: $${property.price?.toLocaleString() || 'TBD'}
- Status: ${property.status}
- Description: ${property.description || 'N/A'}

Rooms:
${roomList || 'No rooms on file'}

Staging Projects:
${projectList || 'No staging projects on file'}

Generate professional listing copy. Return ONLY valid JSON (no markdown) in this format:
{
  "headline": string (under 80 chars),
  "description": string (200-250 words),
  "key_features": [string] (8 bullet points),
  "target_buyer_persona": string (2-3 sentences)
}`;

    const result = await callOpenRouter(prompt);

    if (result.error) {
      return res.status(500).json({ error: result.content });
    }

    // Parse structured JSON
    let structured = null;
    try {
      const cleaned = result.content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      structured = JSON.parse(cleaned);
    } catch {
      structured = null;
    }

    // Save to property_listings table
    let savedListing = null;
    if (structured) {
      const headline = structured.headline || '';
      const description = structured.description || result.content;
      const keyFeatures = Array.isArray(structured.key_features)
        ? structured.key_features.join('\n')
        : (structured.key_features || '');
      const targetAudience = structured.target_buyer_persona || '';

      const insertResult = await pool.query(
        `INSERT INTO property_listings (property_id, listing_title, listing_description, key_features, target_audience, ai_generated)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [property_id, headline, description, keyFeatures, targetAudience, true]
      );
      savedListing = insertResult.rows[0];
    }

    res.json({
      success: true,
      property,
      listing: structured,
      savedListing,
      rawResponse: result.content,
      model: result.model,
      usage: result.usage
    });
  } catch (err) {
    console.error('Listing copy generator error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
