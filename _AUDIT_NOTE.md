# Audit Apply Notes — AIHomeInteriorStagingRealEstate

## Source
`/Users/erolakarsu/projects/_AUDIT/reports/batch_04.md` section 22.

This is one of the most AI-dense projects in the batch (30 existing AI endpoints across staging, color, listings, ROI, photography, social, etc.). Audit listed only 2 missing endpoints.

## Original Recommendations (AI Counterparts)
- `/competitor-analysis`
- `/buyer-persona-targeting`

## Implemented (this pass)
Both endpoints appended to `server/routes/ai.js`, following the existing pattern (auth + aiRateLimiter, `callOpenRouter`, optional `logAiSuggestion` persistence):

- `POST /api/ai/competitor-analysis` — comparable-listing competitive analysis (pricing recommendation, staging gaps, differentiation, marketing angle, risk).
- `POST /api/ai/buyer-persona-targeting` — top-3 personas with persona-specific staging, photography, listing copy, and marketing channel guidance.

Syntax: `node --check` passes.

## Backlog
- Non-AI: vendor/contractor marketplace, project portfolio/case studies, before/after photo tracking, payments/invoicing, white-label.
- Custom: agentic staging orchestration, 3D virtual staging with AR (out-of-scope without graphics SDKs), MLS comp integration (NEEDS-CREDS), buyer psychology modeling (deeper persona stack), time-to-sale prediction (needs historical sale dataset), commission optimization.

## Categorization
- MECHANICAL: 2 endpoints (done — exhausts the audit's missing list).
- NEEDS-CREDS: MLS / comp data sources.
- TOO-RISKY mechanically: 3D/AR generation pipeline.

## Apply pass 3 (frontend)

**Action: LEFT-AS-IS** — `client/src/App.jsx` already routes `ai/competitor-analysis` and `ai/buyer-persona-targeting` to `<AIFeaturePage>`, and `client/src/pages/aiFormConfigs.js` contains form configs for both. The generic AIFeaturePage handles JWT auth, POSTs to `/ai/<feature>`, and renders markdown results (with 429 handling). Apply pass 2 wiring was complete. Idempotent.

## Apply pass 4 (mechanical backlog)

**Action: LEFT-AS-IS.** Apply pass 2 already exhausted the audit's missing-AI list (`/competitor-analysis`, `/buyer-persona-targeting`). 32 endpoints in `server/routes/ai.js` cover the full mechanical surface.

Backlog all non-mechanical:
- MLS / comparable-listing data feeds — NEEDS-CREDS (per-MLS subscription + API token).
- 3D virtual staging + AR — TOO-RISKY (graphics SDK / WebGL pipeline; no LLM-only path).
- Vendor / contractor marketplace, project portfolio, payments / invoicing, white-label — NEEDS-PRODUCT-DECISION (tenancy + payments scope).
- Time-to-sale prediction, commission optimisation, deeper buyer-psychology stack — NEEDS-DATA (historical sales dataset; not a one-shot LLM call).

Idempotent.
