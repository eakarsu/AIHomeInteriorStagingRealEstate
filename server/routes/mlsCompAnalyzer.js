// MLS integration with comp-based staging/pricing recommendations.
// Audit: batch_04.md / AIHomeInteriorStagingRealEstate / Custom Feature Suggestions #3
// TODO: configure credentials MLS_API_KEY, RETS_USERNAME, RETS_PASSWORD
const express = require('express');
const authMiddleware = require('../middleware/auth');
const { callOpenRouter } = require('../openrouter');
const pool = require('../db');

const router = express.Router();
router.use(authMiddleware);

function parseJSON(t) { try { const m = t.match(/\{[\s\S]*\}/); if (m) return JSON.parse(m[0]); } catch (_) {} return { notes: t }; }

// Stub fetcher — replace with live MLS/RETS or third-party API.
async function fetchComps(zip, beds, baths, sqft) {
  const configured = !!process.env.MLS_API_KEY;
  // TODO: configure credentials and replace with real fetch.
  return {
    configured,
    sample_comps: configured ? [] : [
      { address: 'STUB 123 Main St', sold_price: 0, dom: 0, sqft, beds, baths, sold_date: null }
    ],
    note: configured ? 'Live MLS data fetch not yet wired.' : 'Set MLS_API_KEY for live comps.'
  };
}

// POST /api/mls-comps/analyze
// Body: { property_id?, zip, beds, baths, sqft, list_price_usd?, staging_budget_usd? }
router.post('/analyze', async (req, res) => {
  try {
    const { property_id, zip, beds, baths, sqft, list_price_usd, staging_budget_usd } = req.body || {};
    if (!zip || !beds || !sqft) return res.status(400).json({ error: 'zip, beds, sqft required' });

    const comps = await fetchComps(zip, beds, baths, sqft);

    const prompt = `You are a comp-based staging + pricing analyst. Given subject property and comparable
sales, recommend list price, staging investment, and 3 staging emphasis areas. Return STRICT JSON only.

Subject: ${JSON.stringify({ property_id, zip, beds, baths, sqft, list_price_usd, staging_budget_usd })}
Comp snapshot: ${JSON.stringify(comps)}

Return JSON:
{
  "summary": "...",
  "recommended_list_price_usd": 0,
  "price_rationale": "string",
  "expected_dom_days": 0,
  "staging_investment_usd": 0,
  "staging_emphasis_areas": ["..."],
  "comp_summary": [{ "address": "string", "sold_price": 0, "adjustments": ["..."] }],
  "credentials_status": { "mls_api": ${comps.configured} },
  "disclaimer": "AI-assisted comps; verify with licensed appraiser/agent."
}`;

    const raw = await callOpenRouter(prompt);
    res.json({ subject: { property_id, zip, beds, baths, sqft }, comps, analysis: parseJSON(raw) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status', (_req, res) => {
  res.json({ mls_api: !!process.env.MLS_API_KEY, rets: !!process.env.RETS_USERNAME });
});

module.exports = router;
