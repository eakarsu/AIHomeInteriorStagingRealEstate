const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const crud = require('./routes/crud');
const furniturePlannerRoute = require('./routes/furniturePlanner');
const listingCopyRoute = require('./routes/listingCopy');
const roiSimulatorRoute = require('./routes/roiSimulator');

// === Batch 04 Gaps & Frontend Mounts ===
const route_gap_no_competitor_mls_comp_analysis_endpoint = require('./routes/gap-no-competitor-mls-comp-analysis-endpoint');
const route_gap_no_buyer_persona_targeting_endpoint = require('./routes/gap-no-buyer-persona-targeting-endpoint');
const route_gap_no_automated_photo_enhancement_pipeline_ = require('./routes/gap-no-automated-photo-enhancement-pipeline-');
const route_gap_no_vendorcontractor_marketplace = require('./routes/gap-no-vendorcontractor-marketplace');
const route_gap_no_project_portfolio_case_studies = require('./routes/gap-no-project-portfolio-case-studies');
const route_gap_no_beforeafter_photo_gallery = require('./routes/gap-no-beforeafter-photo-gallery');
const route_gap_no_payment_invoicing_integration = require('./routes/gap-no-payment-invoicing-integration');
const route_gap_no_agent_company_white_label = require('./routes/gap-no-agent-company-white-label');
const route_gap_no_notifications_0_references = require('./routes/gap-no-notifications-0-references');
const route_gap_no_audit_log_0_references = require('./routes/gap-no-audit-log-0-references');
const route_gap_no_webhook_surface = require('./routes/gap-no-webhook-surface');
const route_gap_no_file_upload_module = require('./routes/gap-no-file-upload-module');
const route_gap_no_mls_integration = require('./routes/gap-no-mls-integration');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

// New AI endpoints
app.use('/api/ai', furniturePlannerRoute);
app.use('/api/ai', listingCopyRoute);
app.use('/api/ai', roiSimulatorRoute);

// CRUD routes
app.use('/api/properties', crud.properties);
app.use('/api/rooms', crud.rooms);
app.use('/api/staging-projects', crud.stagingProjects);
app.use('/api/furniture', crud.furnitureInventory);
app.use('/api/clients', crud.clients);
app.use('/api/appointments', crud.appointments);
app.use('/api/invoices', crud.invoices);
app.use('/api/color-palettes', crud.colorPalettes);
app.use('/api/design-styles', crud.designStyles);
app.use('/api/before-after', crud.beforeAfterGallery);
app.use('/api/market-analytics', crud.marketAnalytics);
app.use('/api/vendors', crud.vendorDirectory);
app.use('/api/checklists', crud.stagingChecklists);
app.use('/api/ai-suggestions', crud.aiStagingSuggestions);
app.use('/api/listings', crud.propertyListings);
app.use('/api/mls-comps', require('./routes/mlsCompAnalyzer'));
app.use('/api/time-to-sale', require('./routes/timeToSalePredictor'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/gap-no-competitor-mls-comp-analysis-endpoint', route_gap_no_competitor_mls_comp_analysis_endpoint);
app.use('/api/gap-no-buyer-persona-targeting-endpoint', route_gap_no_buyer_persona_targeting_endpoint);
app.use('/api/gap-no-automated-photo-enhancement-pipeline-', route_gap_no_automated_photo_enhancement_pipeline_);
app.use('/api/gap-no-vendorcontractor-marketplace', route_gap_no_vendorcontractor_marketplace);
app.use('/api/gap-no-project-portfolio-case-studies', route_gap_no_project_portfolio_case_studies);
app.use('/api/gap-no-beforeafter-photo-gallery', route_gap_no_beforeafter_photo_gallery);
app.use('/api/gap-no-payment-invoicing-integration', route_gap_no_payment_invoicing_integration);
app.use('/api/gap-no-agent-company-white-label', route_gap_no_agent_company_white_label);
app.use('/api/gap-no-notifications-0-references', route_gap_no_notifications_0_references);
app.use('/api/gap-no-audit-log-0-references', route_gap_no_audit_log_0_references);
app.use('/api/gap-no-webhook-surface', route_gap_no_webhook_surface);
app.use('/api/gap-no-file-upload-module', route_gap_no_file_upload_module);
app.use('/api/gap-no-mls-integration', route_gap_no_mls_integration);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
