import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import CrudPage from './pages/CrudPage';
import DetailPage from './pages/DetailPage';
import AIFeaturePage from './pages/AIFeaturePage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (saved && token) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<CrudPage resource="properties" title="Properties" />} />
          <Route path="properties/:id" element={<DetailPage resource="properties" title="Property" />} />
          <Route path="rooms" element={<CrudPage resource="rooms" title="Rooms" />} />
          <Route path="rooms/:id" element={<DetailPage resource="rooms" title="Room" />} />
          <Route path="staging-projects" element={<CrudPage resource="staging-projects" title="Staging Projects" />} />
          <Route path="staging-projects/:id" element={<DetailPage resource="staging-projects" title="Staging Project" />} />
          <Route path="furniture" element={<CrudPage resource="furniture" title="Furniture Inventory" />} />
          <Route path="furniture/:id" element={<DetailPage resource="furniture" title="Furniture" />} />
          <Route path="clients" element={<CrudPage resource="clients" title="Clients" />} />
          <Route path="clients/:id" element={<DetailPage resource="clients" title="Client" />} />
          <Route path="appointments" element={<CrudPage resource="appointments" title="Appointments" />} />
          <Route path="appointments/:id" element={<DetailPage resource="appointments" title="Appointment" />} />
          <Route path="invoices" element={<CrudPage resource="invoices" title="Invoices" />} />
          <Route path="invoices/:id" element={<DetailPage resource="invoices" title="Invoice" />} />
          <Route path="color-palettes" element={<CrudPage resource="color-palettes" title="Color Palettes" />} />
          <Route path="color-palettes/:id" element={<DetailPage resource="color-palettes" title="Color Palette" />} />
          <Route path="design-styles" element={<CrudPage resource="design-styles" title="Design Styles" />} />
          <Route path="design-styles/:id" element={<DetailPage resource="design-styles" title="Design Style" />} />
          <Route path="before-after" element={<CrudPage resource="before-after" title="Before & After Gallery" />} />
          <Route path="before-after/:id" element={<DetailPage resource="before-after" title="Before & After" />} />
          <Route path="market-analytics" element={<CrudPage resource="market-analytics" title="Market Analytics" />} />
          <Route path="market-analytics/:id" element={<DetailPage resource="market-analytics" title="Market Analytics" />} />
          <Route path="vendors" element={<CrudPage resource="vendors" title="Vendor Directory" />} />
          <Route path="vendors/:id" element={<DetailPage resource="vendors" title="Vendor" />} />
          <Route path="checklists" element={<CrudPage resource="checklists" title="Staging Checklists" />} />
          <Route path="checklists/:id" element={<DetailPage resource="checklists" title="Checklist Item" />} />
          <Route path="ai-suggestions" element={<CrudPage resource="ai-suggestions" title="AI Suggestions" />} />
          <Route path="ai-suggestions/:id" element={<DetailPage resource="ai-suggestions" title="AI Suggestion" />} />
          <Route path="listings" element={<CrudPage resource="listings" title="Property Listings" />} />
          <Route path="listings/:id" element={<DetailPage resource="listings" title="Listing" />} />
          {/* AI - Property & Rooms */}
          <Route path="ai/property-analyzer" element={<AIFeaturePage feature="property-analyzer" title="AI Property Analyzer" />} />
          <Route path="ai/room-optimizer" element={<AIFeaturePage feature="room-optimizer" title="AI Room Optimizer" />} />
          <Route path="ai/staging-suggestions" element={<AIFeaturePage feature="staging-suggestions" title="AI Room Staging" />} />
          <Route path="ai/furniture-placement" element={<AIFeaturePage feature="furniture-placement" title="AI Furniture Placement" />} />
          <Route path="ai/curb-appeal" element={<AIFeaturePage feature="curb-appeal" title="AI Curb Appeal" />} />
          {/* AI - Design & Style */}
          <Route path="ai/style-recommender" element={<AIFeaturePage feature="style-recommender" title="AI Style Recommender" />} />
          <Route path="ai/color-palette" element={<AIFeaturePage feature="color-palette" title="AI Color Palette" />} />
          <Route path="ai/lighting-design" element={<AIFeaturePage feature="lighting-design" title="AI Lighting Design" />} />
          <Route path="ai/furniture-recommender" element={<AIFeaturePage feature="furniture-recommender" title="AI Furniture Recommender" />} />
          <Route path="ai/seasonal-staging" element={<AIFeaturePage feature="seasonal-staging" title="AI Seasonal Staging" />} />
          <Route path="ai/trend-forecaster" element={<AIFeaturePage feature="trend-forecaster" title="AI Trend Forecaster" />} />
          {/* AI - Business & Clients */}
          <Route path="ai/client-proposal" element={<AIFeaturePage feature="client-proposal" title="AI Client Proposal" />} />
          <Route path="ai/appointment-planner" element={<AIFeaturePage feature="appointment-planner" title="AI Appointment Planner" />} />
          <Route path="ai/pricing-calculator" element={<AIFeaturePage feature="pricing-calculator" title="AI Pricing Calculator" />} />
          <Route path="ai/roi-calculator" element={<AIFeaturePage feature="roi-calculator" title="AI ROI Calculator" />} />
          <Route path="ai/vendor-matcher" element={<AIFeaturePage feature="vendor-matcher" title="AI Vendor Matcher" />} />
          {/* AI - Marketing & Sales */}
          <Route path="ai/listing-generator" element={<AIFeaturePage feature="listing-generator" title="AI Listing Generator" />} />
          <Route path="ai/before-after" element={<AIFeaturePage feature="before-after" title="AI Before/After" />} />
          <Route path="ai/social-media" element={<AIFeaturePage feature="social-media" title="AI Social Media" />} />
          <Route path="ai/photo-staging" element={<AIFeaturePage feature="photo-staging" title="AI Photo Staging" />} />
          <Route path="ai/open-house-optimizer" element={<AIFeaturePage feature="open-house-optimizer" title="AI Open House" />} />
          {/* AI - Analysis & Planning */}
          <Route path="ai/market-analysis" element={<AIFeaturePage feature="market-analysis" title="AI Market Analysis" />} />
          <Route path="ai/budget-estimator" element={<AIFeaturePage feature="budget-estimator" title="AI Budget Estimator" />} />
          <Route path="ai/valuation-impact" element={<AIFeaturePage feature="valuation-impact" title="AI Valuation Impact" />} />
          <Route path="ai/neighborhood-strategy" element={<AIFeaturePage feature="neighborhood-strategy" title="AI Neighborhood Strategy" />} />
          <Route path="ai/project-planner" element={<AIFeaturePage feature="project-planner" title="AI Project Planner" />} />
          <Route path="ai/checklist-generator" element={<AIFeaturePage feature="checklist-generator" title="AI Checklist Generator" />} />
          <Route path="ai/decluttering-guide" element={<AIFeaturePage feature="decluttering-guide" title="AI Decluttering Guide" />} />
          <Route path="ai/renovation-advisor" element={<AIFeaturePage feature="renovation-advisor" title="AI Renovation Advisor" />} />
          <Route path="ai/virtual-staging" element={<AIFeaturePage feature="virtual-staging" title="AI Virtual Staging" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
