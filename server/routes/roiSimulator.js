const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { callOpenRouter } = require('../openrouter');
const router = express.Router();

// POST /api/ai/roi-simulator
// Combines market_analytics + staging_projects history to predict staging ROI
router.post('/roi-simulator', auth, aiRateLimiter, async (req, res) => {
  try {
    const { property_id, proposed_budget, style, timeline_days } = req.body;

    if (!property_id) {
      return res.status(400).json({ error: 'property_id is required' });
    }

    // Fetch property
    const propResult = await pool.query('SELECT * FROM properties WHERE id = $1', [property_id]);
    if (propResult.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
    const property = propResult.rows[0];

    // Fetch recent market analytics
    const analyticsResult = await pool.query(
      'SELECT * FROM market_analytics ORDER BY analysis_date DESC LIMIT 10'
    );
    const analytics = analyticsResult.rows;

    // Fetch historical staging projects to compute avg ROI
    const projectsResult = await pool.query(
      `SELECT sp.*, p.price, p.sqft, p.property_type
       FROM staging_projects sp
       JOIN properties p ON sp.property_id = p.id
       WHERE sp.status = 'completed'
       ORDER BY sp.updated_at DESC LIMIT 20`
    );
    const completedProjects = projectsResult.rows;

    // Fetch current rooms for the property
    const roomsResult = await pool.query('SELECT * FROM rooms WHERE property_id = $1', [property_id]);
    const rooms = roomsResult.rows;

    const avgStagingBudget = completedProjects.length > 0
      ? (completedProjects.reduce((s, p) => s + parseFloat(p.budget || 0), 0) / completedProjects.length).toFixed(0)
      : 'no data';

    const marketSummary = analytics.slice(0, 5).map(a =>
      `Region: ${a.region || 'N/A'}, Avg Days on Market: ${a.avg_days_on_market || 'N/A'}, Staging ROI: ${a.staging_roi_percent || 'N/A'}%, Avg Price/sqft: $${a.avg_price_per_sqft || 'N/A'}`
    ).join('\n');

    const historicalSummary = completedProjects.slice(0, 10).map(p =>
      `Budget: $${p.budget || 0}, Style: ${p.style || 'N/A'}, Property Type: ${p.property_type || 'N/A'}, List Price: $${p.price || 0}`
    ).join('\n');

    const prompt = `As a real estate staging ROI expert, analyze this property and provide a data-driven ROI prediction.

PROPERTY:
- Type: ${property.property_type}
- List Price: $${property.price?.toLocaleString() || 'TBD'}
- Square Feet: ${property.sqft || 'Unknown'}
- Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}
- Location: ${property.city || 'N/A'}, ${property.state || ''}
- Rooms to Stage: ${rooms.length} rooms

PROPOSED STAGING:
- Budget: $${proposed_budget || '8000'}
- Style: ${style || 'Contemporary'}
- Timeline: ${timeline_days || 14} days

MARKET ANALYTICS (recent data):
${marketSummary || 'No market data available'}

HISTORICAL STAGED PROPERTIES (completed projects):
${historicalSummary || 'No historical data available'}
Average staging budget across ${completedProjects.length} completed projects: $${avgStagingBudget}

Based on this real data, return ONLY valid JSON:
{
  "predicted_sale_price_increase": number,
  "predicted_sale_price_increase_percent": number,
  "days_on_market_reduction": number,
  "estimated_roi_percent": number,
  "break_even_days": number,
  "confidence_level": "low"|"medium"|"high",
  "budget_recommendation": string,
  "risk_factors": string[],
  "market_context": string,
  "recommendation": "proceed"|"increase_budget"|"reduce_scope"|"skip_staging"
}`;

    const result = await callOpenRouter(prompt, 'You are an expert real estate staging ROI analyst. Always return valid JSON only, no markdown.');

    let structured = null;
    try {
      const cleaned = result.content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      structured = JSON.parse(cleaned);
    } catch {
      try {
        const match = result.content.match(/\{[\s\S]*\}/);
        if (match) structured = JSON.parse(match[0]);
      } catch {}
    }

    // Log to ai_staging_suggestions
    if (structured) {
      await pool.query(
        `INSERT INTO ai_staging_suggestions (room_id, suggestion_type, suggestion, estimated_cost, impact_level, ai_model)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          null,
          'roi_simulator',
          `ROI prediction for property ${property_id}: ${structured.estimated_roi_percent}% ROI, price increase $${structured.predicted_sale_price_increase}`,
          proposed_budget || 8000,
          'high',
          'anthropic/claude-3-5-sonnet-20241022'
        ]
      ).catch(() => {});
    }

    res.json({
      success: true,
      property,
      proposedBudget: proposed_budget,
      roiPrediction: structured,
      rawResponse: result.content,
      dataPoints: {
        marketAnalyticsUsed: analytics.length,
        historicalProjectsUsed: completedProjects.length,
        roomsToStage: rooms.length,
      },
      model: result.model,
    });
  } catch (err) {
    console.error('ROI Simulator error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
