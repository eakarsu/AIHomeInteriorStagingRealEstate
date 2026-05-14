import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { section: 'Dashboard' },
  { path: '/', label: 'Dashboard', icon: '📊' },

  { section: 'Property Management' },
  { path: '/properties', label: 'Properties', icon: '🏠' },
  { path: '/rooms', label: 'Rooms', icon: '🚪' },
  { path: '/staging-projects', label: 'Staging Projects', icon: '🎨' },

  { section: 'Business' },
  { path: '/clients', label: 'Clients', icon: '👥' },
  { path: '/appointments', label: 'Appointments', icon: '📅' },
  { path: '/invoices', label: 'Invoices', icon: '💰' },

  { section: 'Design & Inventory' },
  { path: '/furniture', label: 'Furniture', icon: '🛋️' },
  { path: '/color-palettes', label: 'Color Palettes', icon: '🎨' },
  { path: '/design-styles', label: 'Design Styles', icon: '✨' },

  { section: 'Staging Tools' },
  { path: '/before-after', label: 'Before & After', icon: '📸' },
  { path: '/checklists', label: 'Checklists', icon: '✅' },
  { path: '/vendors', label: 'Vendors', icon: '🏪' },
  { path: '/market-analytics', label: 'Market Analytics', icon: '📈' },
  { path: '/listings', label: 'Listings', icon: '📋' },

  { section: 'AI - Staging' },
  { path: '/ai/furniture-planner', label: 'AI Furniture Planner', icon: '🪑' },
  { path: '/ai/property-analyzer', label: 'AI Property Analyzer', icon: '🏠' },
  { path: '/ai/room-optimizer', label: 'AI Room Optimizer', icon: '🚪' },
  { path: '/ai/staging-suggestions', label: 'AI Room Staging', icon: '🤖' },
  { path: '/ai/furniture-placement', label: 'AI Furniture Layout', icon: '🪑' },
  { path: '/ai/curb-appeal', label: 'AI Curb Appeal', icon: '🌳' },

  { section: 'AI - Design & Style' },
  { path: '/ai/style-recommender', label: 'AI Style Guide', icon: '💎' },
  { path: '/ai/color-palette', label: 'AI Color Palette', icon: '🌈' },
  { path: '/ai/lighting-design', label: 'AI Lighting Design', icon: '💡' },
  { path: '/ai/furniture-recommender', label: 'AI Furniture Picks', icon: '🛋️' },
  { path: '/ai/seasonal-staging', label: 'AI Seasonal Staging', icon: '🍂' },
  { path: '/ai/trend-forecaster', label: 'AI Trend Forecast', icon: '🔮' },

  { section: 'AI - Business & Clients' },
  { path: '/ai/client-proposal', label: 'AI Client Proposal', icon: '📄' },
  { path: '/ai/appointment-planner', label: 'AI Appt Planner', icon: '📅' },
  { path: '/ai/pricing-calculator', label: 'AI Pricing/Invoice', icon: '💵' },
  { path: '/ai/roi-calculator', label: 'AI ROI Calculator', icon: '📊' },
  { path: '/ai/vendor-matcher', label: 'AI Vendor Matcher', icon: '🤝' },

  { section: 'AI - Listing' },
  { path: '/ai/listing-copy', label: 'AI Listing Copy (DB)', icon: '🏡' },
  { path: '/ai/roi-simulator', label: 'AI ROI Simulator (DB)', icon: '📊' },

  { section: 'AI - Marketing & Sales' },
  { path: '/ai/listing-generator', label: 'AI Listing Writer', icon: '📝' },
  { path: '/ai/before-after', label: 'AI Before/After', icon: '🔄' },
  { path: '/ai/social-media', label: 'AI Social Media', icon: '📱' },
  { path: '/ai/photo-staging', label: 'AI Photo Staging', icon: '📷' },
  { path: '/ai/open-house-optimizer', label: 'AI Open House', icon: '🏡' },

  { section: 'AI - Analysis & Planning' },
  { path: '/ai/market-analysis', label: 'AI Market Analysis', icon: '📈' },
  { path: '/ai/budget-estimator', label: 'AI Budget Estimator', icon: '🧮' },
  { path: '/ai/valuation-impact', label: 'AI Valuation Impact', icon: '💰' },
  { path: '/ai/neighborhood-strategy', label: 'AI Neighborhood', icon: '🏘️' },
  { path: '/ai/project-planner', label: 'AI Project Planner', icon: '📋' },
  { path: '/ai/checklist-generator', label: 'AI Checklist Gen', icon: '✅' },
  { path: '/ai/decluttering-guide', label: 'AI Declutter Guide', icon: '🧹' },
  { path: '/ai/renovation-advisor', label: 'AI Renovation', icon: '🔨' },
  { path: '/ai/virtual-staging', label: 'AI Virtual Staging', icon: '🖥️' },
  { path: '/ai/competitor-analysis', label: 'AI Competitor Analysis', icon: '⚔️' },
  { path: '/ai/buyer-persona-targeting', label: 'AI Buyer Persona', icon: '🎯' },
];

export default function Layout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>🏠 AI Home <span className="brand-accent">Staging</span></h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item, i) =>
            item.section ? (
              <div key={i} className="sidebar-section">{item.section}</div>
            ) : (
              <div key={i} className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            )
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user.name[0]}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={onLogout}>Sign Out</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
