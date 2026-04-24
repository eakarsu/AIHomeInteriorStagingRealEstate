const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const dashboardRoutes = require('./routes/dashboard');
const crud = require('./routes/crud');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
