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
const { validateRuntime } = require('./governance/runtime');
const governanceRouter = require('./governance/router');

validateRuntime();

// === Batch 04 Gaps & Frontend Mounts ===
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
app.use('/api/governed-staging-deliverables', governanceRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
