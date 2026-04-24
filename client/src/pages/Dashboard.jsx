import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const dataCards = [
  { path: '/properties', icon: '🏠', title: 'Properties', desc: 'Manage property listings, details, and staging status' },
  { path: '/rooms', icon: '🚪', title: 'Rooms', desc: 'Track rooms within properties for targeted staging' },
  { path: '/staging-projects', icon: '🎨', title: 'Staging Projects', desc: 'Plan and manage staging projects from start to finish' },
  { path: '/clients', icon: '👥', title: 'Clients', desc: 'Manage real estate agent and client relationships' },
  { path: '/appointments', icon: '📅', title: 'Appointments', desc: 'Schedule consultations, walk-throughs, and photo shoots' },
  { path: '/invoices', icon: '💰', title: 'Invoices', desc: 'Track billing, payments, and revenue from staging projects' },
  { path: '/furniture', icon: '🛋️', title: 'Furniture Inventory', desc: 'Manage staging furniture, availability, and rental pricing' },
  { path: '/color-palettes', icon: '🎨', title: 'Color Palettes', desc: 'Browse and create color schemes for different room types' },
  { path: '/design-styles', icon: '✨', title: 'Design Styles', desc: 'Explore interior design styles and their applications' },
  { path: '/before-after', icon: '📸', title: 'Before & After Gallery', desc: 'Showcase staging transformations with impact scores' },
  { path: '/checklists', icon: '✅', title: 'Staging Checklists', desc: 'Track staging tasks, assignments, and deadlines' },
  { path: '/vendors', icon: '🏪', title: 'Vendor Directory', desc: 'Find furniture rental, photography, and service vendors' },
  { path: '/market-analytics', icon: '📈', title: 'Market Analytics', desc: 'ROI data and staging market trends by region' },
  { path: '/listings', icon: '📋', title: 'Property Listings', desc: 'Manage property listing descriptions and platforms' },
];

const aiCards = [
  // Property & Rooms
  { path: '/ai/property-analyzer', icon: '🏠', title: 'AI Property Analyzer', desc: 'Comprehensive property analysis with staging strategy and buyer targeting', section: 'Property & Rooms' },
  { path: '/ai/room-optimizer', icon: '🚪', title: 'AI Room Optimizer', desc: 'Spatial design optimization to make any room feel larger and better', section: 'Property & Rooms' },
  { path: '/ai/staging-suggestions', icon: '🤖', title: 'AI Room Staging', desc: 'Get AI-powered staging suggestions for any room type', section: 'Property & Rooms' },
  { path: '/ai/furniture-placement', icon: '🪑', title: 'AI Furniture Layout', desc: 'Optimal furniture placement suggestions from AI', section: 'Property & Rooms' },
  { path: '/ai/curb-appeal', icon: '🌳', title: 'AI Curb Appeal', desc: 'Exterior staging for stunning first impressions', section: 'Property & Rooms' },
  // Design & Style
  { path: '/ai/style-recommender', icon: '💎', title: 'AI Style Guide', desc: 'AI recommends the best design style for your property', section: 'Design & Style' },
  { path: '/ai/color-palette', icon: '🌈', title: 'AI Color Palette', desc: 'Generate professional color palettes with AI analysis', section: 'Design & Style' },
  { path: '/ai/lighting-design', icon: '💡', title: 'AI Lighting Design', desc: 'Professional lighting plans for every room and mood', section: 'Design & Style' },
  { path: '/ai/furniture-recommender', icon: '🛋️', title: 'AI Furniture Picks', desc: 'AI furniture selection and sourcing recommendations', section: 'Design & Style' },
  { path: '/ai/seasonal-staging', icon: '🍂', title: 'AI Seasonal Staging', desc: 'Season-specific staging strategies for year-round appeal', section: 'Design & Style' },
  { path: '/ai/trend-forecaster', icon: '🔮', title: 'AI Trend Forecast', desc: 'AI staging and design trend predictions', section: 'Design & Style' },
  // Business & Clients
  { path: '/ai/client-proposal', icon: '📄', title: 'AI Client Proposal', desc: 'Generate professional staging proposals to win clients', section: 'Business & Clients' },
  { path: '/ai/appointment-planner', icon: '📅', title: 'AI Appt Planner', desc: 'AI-powered consultation planning for effectiveness', section: 'Business & Clients' },
  { path: '/ai/pricing-calculator', icon: '💵', title: 'AI Pricing/Invoice', desc: 'AI pricing strategy and invoice generation', section: 'Business & Clients' },
  { path: '/ai/roi-calculator', icon: '📊', title: 'AI ROI Calculator', desc: 'Calculate precise financial return on staging investments', section: 'Business & Clients' },
  { path: '/ai/vendor-matcher', icon: '🤝', title: 'AI Vendor Matcher', desc: 'AI vendor selection and coordination strategy', section: 'Business & Clients' },
  // Marketing & Sales
  { path: '/ai/listing-generator', icon: '📝', title: 'AI Listing Writer', desc: 'Create compelling property descriptions with AI', section: 'Marketing & Sales' },
  { path: '/ai/before-after', icon: '🔄', title: 'AI Before/After', desc: 'Generate transformation narratives and marketing copy', section: 'Marketing & Sales' },
  { path: '/ai/social-media', icon: '📱', title: 'AI Social Media', desc: 'AI social media content creation for staging marketing', section: 'Marketing & Sales' },
  { path: '/ai/photo-staging', icon: '📷', title: 'AI Photo Staging', desc: 'Photography preparation and styling for listing photos', section: 'Marketing & Sales' },
  { path: '/ai/open-house-optimizer', icon: '🏡', title: 'AI Open House', desc: 'Open house experience design for max buyer engagement', section: 'Marketing & Sales' },
  // Analysis & Planning
  { path: '/ai/market-analysis', icon: '📈', title: 'AI Market Analysis', desc: 'AI-powered market trends and staging ROI predictions', section: 'Analysis & Planning' },
  { path: '/ai/budget-estimator', icon: '🧮', title: 'AI Budget Estimator', desc: 'Get detailed staging budget estimates with ROI analysis', section: 'Analysis & Planning' },
  { path: '/ai/valuation-impact', icon: '💰', title: 'AI Valuation Impact', desc: 'Analyze how staging impacts property value', section: 'Analysis & Planning' },
  { path: '/ai/neighborhood-strategy', icon: '🏘️', title: 'AI Neighborhood', desc: 'Neighborhood-specific staging and marketing strategy', section: 'Analysis & Planning' },
  { path: '/ai/project-planner', icon: '📋', title: 'AI Project Planner', desc: 'Complete AI project management plan for staging', section: 'Analysis & Planning' },
  { path: '/ai/checklist-generator', icon: '✅', title: 'AI Checklist Gen', desc: 'Auto-generate day-by-day staging checklists', section: 'Analysis & Planning' },
  { path: '/ai/decluttering-guide', icon: '🧹', title: 'AI Declutter Guide', desc: 'AI decluttering and pre-staging preparation', section: 'Analysis & Planning' },
  { path: '/ai/renovation-advisor', icon: '🔨', title: 'AI Renovation', desc: 'Pre-sale renovation recommendations for max ROI', section: 'Analysis & Planning' },
  { path: '/ai/virtual-staging', icon: '🖥️', title: 'AI Virtual Staging', desc: 'Virtual staging plans and tool recommendations', section: 'Analysis & Planning' },
];

const aiSections = ['Property & Rooms', 'Design & Style', 'Business & Clients', 'Marketing & Sales', 'Analysis & Planning'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card" onClick={() => navigate('/properties')}>
          <div className="stat-icon">🏠</div>
          <div className="stat-value">{stats?.properties?.total || 0}</div>
          <div className="stat-label">Properties</div>
          <div className="stat-sub">{stats?.properties?.active || 0} active, {stats?.properties?.staging || 0} staging</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/staging-projects')}>
          <div className="stat-icon">🎨</div>
          <div className="stat-value">{stats?.projects?.total || 0}</div>
          <div className="stat-label">Staging Projects</div>
          <div className="stat-sub">{stats?.projects?.in_progress || 0} in progress</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/clients')}>
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.clients?.total || 0}</div>
          <div className="stat-label">Clients</div>
          <div className="stat-sub">{stats?.clients?.total_project_count || 0} total projects</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/invoices')}>
          <div className="stat-icon">💰</div>
          <div className="stat-value">${stats?.invoices?.revenue ? Number(stats.invoices.revenue).toLocaleString() : '0'}</div>
          <div className="stat-label">Revenue</div>
          <div className="stat-sub">${stats?.invoices?.pending ? Number(stats.invoices.pending).toLocaleString() : '0'} pending</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/furniture')}>
          <div className="stat-icon">🛋️</div>
          <div className="stat-value">{stats?.furniture?.total || 0}</div>
          <div className="stat-label">Furniture Items</div>
          <div className="stat-sub">{stats?.furniture?.available || 0} available</div>
        </div>
        <div className="stat-card" onClick={() => navigate('/appointments')}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats?.appointments?.total || 0}</div>
          <div className="stat-label">Appointments</div>
          <div className="stat-sub">{stats?.appointments?.upcoming || 0} upcoming</div>
        </div>
      </div>

      <h2 style={{ marginBottom: 16, fontSize: '1.3rem' }}>Data Management ({dataCards.length})</h2>
      <div className="feature-grid">
        {dataCards.map((card) => (
          <div key={card.path} className="feature-card" onClick={() => navigate(card.path)}>
            <span className="data-badge">Data</span>
            <div className="feature-icon">{card.icon}</div>
            <h3>{card.title}</h3>
            <p>{card.desc}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 8, fontSize: '1.3rem' }}>AI-Powered Features ({aiCards.length})</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: 20, fontSize: '0.9rem' }}>
          Every feature has an AI counterpart. Click any card to use the AI tool.
        </p>
      </div>

      {aiSections.map(section => (
        <div key={section} style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--secondary)', marginBottom: 12, paddingLeft: 4, borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
            {section}
          </h3>
          <div className="feature-grid">
            {aiCards.filter(c => c.section === section).map((card) => (
              <div key={card.path} className="feature-card" onClick={() => navigate(card.path)}>
                <span className="ai-badge">AI Powered</span>
                <div className="feature-icon">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
