// Time-to-sale prediction tied to staging investment level.
// Audit: batch_04.md / AIHomeInteriorStagingRealEstate / Custom Feature Suggestions #5
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { callOpenRouter } = require('../openrouter');
const pool = require('../db');

const router = express.Router();
router.use(authMiddleware);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// POST /api/time-to-sale/predict
// Body: { property_id?, list_price_usd, staging_budget_usd, market_temp?, season? }
router.post('/predict', async (req, res) => {
  try {
    const { property_id, list_price_usd, staging_budget_usd = 0, market_temp = 'neutral', season } = req.body || {};
    if (!list_price_usd) return res.status(400).json({ error: 'list_price_usd required' });

    let property = null;
    try {
      const r = await pool.query(`SELECT * FROM property_listings WHERE id = $1`, [property_id || 0]);
      property = r.rows[0] || null;
    } catch (_) {}

    const prompt = `You are a real-estate time-on-market predictor. Given list price and staging investment,
estimate days-on-market across three scenarios (low staging, medium, high). Return STRICT JSON only.

Property: ${JSON.stringify(property || { property_id, list_price_usd })}
List price USD: ${list_price_usd}
Current staging budget USD: ${staging_budget_usd}
Market temperature: ${market_temp} (cold|neutral|hot|red_hot)
Season: ${season || 'unspecified'}

Return JSON:
{
  "summary": "...",
  "scenarios": [
    { "label": "low_staging", "staging_usd": 0, "predicted_dom_days": 0, "predicted_sale_price_usd": 0, "net_after_staging_usd": 0 },
    { "label": "medium_staging", "staging_usd": 0, "predicted_dom_days": 0, "predicted_sale_price_usd": 0, "net_after_staging_usd": 0 },
    { "label": "high_staging", "staging_usd": 0, "predicted_dom_days": 0, "predicted_sale_price_usd": 0, "net_after_staging_usd": 0 }
  ],
  "recommended_scenario": "low_staging|medium_staging|high_staging",
  "key_risks": ["..."],
  "sensitivity_factors": ["..."],
  "disclaimer": "Predictive; not appraisal. Verify with comparable sales."
}`;

    const raw = await callOpenRouter(prompt);
    res.json({ list_price_usd, staging_budget_usd, prediction: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, address, list_price, status, created_at FROM property_listings ORDER BY created_at DESC LIMIT 30`
    ).catch(() => ({ rows: [] }));
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
