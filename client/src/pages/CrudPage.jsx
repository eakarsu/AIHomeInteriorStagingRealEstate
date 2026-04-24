import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const fieldConfigs = {
  properties: {
    columns: ['title', 'city', 'state', 'price', 'bedrooms', 'bathrooms', 'sqft', 'property_type', 'status'],
    form: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true },
      { name: 'city', label: 'City', type: 'text', required: true },
      { name: 'state', label: 'State', type: 'text', required: true },
      { name: 'zip', label: 'ZIP', type: 'text', required: true },
      { name: 'price', label: 'Price', type: 'number' },
      { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
      { name: 'bathrooms', label: 'Bathrooms', type: 'number' },
      { name: 'sqft', label: 'Sq Ft', type: 'number' },
      { name: 'property_type', label: 'Property Type', type: 'select', options: ['Single Family', 'Condo', 'Townhouse', 'Penthouse', 'Loft', 'Cabin', 'Cottage', 'Studio'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'staging', 'sold', 'archived'] },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    format: { price: v => v ? `$${Number(v).toLocaleString()}` : '-', sqft: v => v ? `${Number(v).toLocaleString()} sqft` : '-' }
  },
  rooms: {
    columns: ['name', 'room_type', 'width', 'length', 'current_condition', 'property_id'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number', required: true },
      { name: 'name', label: 'Room Name', type: 'text', required: true },
      { name: 'room_type', label: 'Room Type', type: 'select', required: true, options: ['living_room', 'bedroom', 'kitchen', 'dining_room', 'bathroom', 'bonus_room', 'office', 'garage'] },
      { name: 'width', label: 'Width (ft)', type: 'number' },
      { name: 'length', label: 'Length (ft)', type: 'number' },
      { name: 'current_condition', label: 'Condition', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'staging-projects': {
    columns: ['title', 'style', 'budget', 'status', 'start_date', 'end_date'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number', required: true },
      { name: 'title', label: 'Project Title', type: 'text', required: true },
      { name: 'style', label: 'Style', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['planning', 'in_progress', 'completed', 'on_hold'] },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    format: { budget: v => v ? `$${Number(v).toLocaleString()}` : '-' }
  },
  furniture: {
    columns: ['name', 'category', 'style', 'color', 'condition', 'rental_price_daily', 'available'],
    form: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['Seating', 'Tables', 'Bedroom', 'Lighting', 'Textiles', 'Storage', 'Decor', 'Accent', 'Outdoor', 'Bathroom'] },
      { name: 'style', label: 'Style', type: 'text' },
      { name: 'color', label: 'Color', type: 'text' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['excellent', 'good', 'fair', 'poor'] },
      { name: 'purchase_price', label: 'Purchase Price', type: 'number' },
      { name: 'rental_price_daily', label: 'Daily Rental', type: 'number' },
      { name: 'available', label: 'Available', type: 'select', options: ['true', 'false'] },
      { name: 'dimensions', label: 'Dimensions', type: 'text' },
    ],
    format: { rental_price_daily: v => v ? `$${v}/day` : '-', available: v => v ? 'Yes' : 'No' }
  },
  clients: {
    columns: ['name', 'email', 'phone', 'company', 'client_type', 'total_projects'],
    form: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'client_type', label: 'Type', type: 'select', options: ['Real Estate Agent', 'Interior Designer', 'Investor', 'Developer', 'Staging Company', 'Homeowner'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  appointments: {
    columns: ['title', 'appointment_date', 'duration_minutes', 'status', 'location'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'client_id', label: 'Client ID', type: 'number' },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'appointment_date', label: 'Date & Time', type: 'datetime-local', required: true },
      { name: 'duration_minutes', label: 'Duration (min)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'confirmed', 'completed', 'cancelled'] },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    format: { appointment_date: v => v ? new Date(v).toLocaleString() : '-', duration_minutes: v => v ? `${v} min` : '-' }
  },
  invoices: {
    columns: ['invoice_number', 'amount', 'tax', 'total', 'status', 'due_date'],
    form: [
      { name: 'client_id', label: 'Client ID', type: 'number' },
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'invoice_number', label: 'Invoice #', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'tax', label: 'Tax', type: 'number' },
      { name: 'total', label: 'Total', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'pending', 'paid', 'overdue'] },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'paid_date', label: 'Paid Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    format: { amount: v => v ? `$${Number(v).toLocaleString()}` : '-', tax: v => v ? `$${Number(v).toLocaleString()}` : '-', total: v => v ? `$${Number(v).toLocaleString()}` : '-' }
  },
  'color-palettes': {
    columns: ['name', 'room_type', 'style', 'primary_color', 'secondary_color', 'accent_color'],
    form: [
      { name: 'name', label: 'Palette Name', type: 'text', required: true },
      { name: 'room_type', label: 'Room Type', type: 'text' },
      { name: 'style', label: 'Style', type: 'text' },
      { name: 'primary_color', label: 'Primary Color', type: 'color' },
      { name: 'secondary_color', label: 'Secondary Color', type: 'color' },
      { name: 'accent_color', label: 'Accent Color', type: 'color' },
      { name: 'neutral_color', label: 'Neutral Color', type: 'color' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
    format: {
      primary_color: v => v ? `<swatch>${v}</swatch>` : '-',
      secondary_color: v => v ? `<swatch>${v}</swatch>` : '-',
      accent_color: v => v ? `<swatch>${v}</swatch>` : '-',
    }
  },
  'design-styles': {
    columns: ['name', 'best_for', 'price_range', 'popularity'],
    form: [
      { name: 'name', label: 'Style Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'key_elements', label: 'Key Elements', type: 'textarea' },
      { name: 'best_for', label: 'Best For', type: 'text' },
      { name: 'price_range', label: 'Price Range', type: 'text' },
      { name: 'popularity', label: 'Popularity Score', type: 'number' },
    ]
  },
  'before-after': {
    columns: ['room_name', 'staging_style', 'cost', 'impact_score', 'property_id'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'room_name', label: 'Room Name', type: 'text', required: true },
      { name: 'before_description', label: 'Before Description', type: 'textarea' },
      { name: 'after_description', label: 'After Description', type: 'textarea' },
      { name: 'staging_style', label: 'Staging Style', type: 'text' },
      { name: 'cost', label: 'Cost', type: 'number' },
      { name: 'impact_score', label: 'Impact Score (1-100)', type: 'number' },
    ],
    format: { cost: v => v ? `$${Number(v).toLocaleString()}` : '-', impact_score: v => v ? `${v}/100` : '-' }
  },
  'market-analytics': {
    columns: ['region', 'property_type', 'avg_staging_cost', 'avg_roi_percentage', 'avg_days_on_market', 'quarter', 'year'],
    form: [
      { name: 'region', label: 'Region', type: 'text', required: true },
      { name: 'property_type', label: 'Property Type', type: 'text' },
      { name: 'avg_staging_cost', label: 'Avg Staging Cost', type: 'number' },
      { name: 'avg_roi_percentage', label: 'Avg ROI %', type: 'number' },
      { name: 'avg_days_on_market', label: 'Avg Days on Market', type: 'number' },
      { name: 'staged_vs_unstaged_price_diff', label: 'Price Diff %', type: 'number' },
      { name: 'quarter', label: 'Quarter', type: 'text' },
      { name: 'year', label: 'Year', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    format: { avg_staging_cost: v => v ? `$${Number(v).toLocaleString()}` : '-', avg_roi_percentage: v => v ? `${v}%` : '-' }
  },
  vendors: {
    columns: ['name', 'category', 'email', 'phone', 'rating', 'price_range', 'service_area'],
    form: [
      { name: 'name', label: 'Vendor Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', required: true, options: ['Furniture Rental', 'Floral Design', 'Photography', 'Cleaning', 'Painting/Wallpaper', 'Textiles', 'Plants/Greenery', 'Repairs/Maintenance', 'Virtual Staging', 'Sensory', 'Moving/Logistics', 'Art/Decor', 'Technology', 'Landscaping', 'Accessories/Decor'] },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'website', label: 'Website', type: 'text' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'price_range', label: 'Price Range', type: 'select', options: ['$', '$$', '$$$', '$$$$', '$$$$$'] },
      { name: 'service_area', label: 'Service Area', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  checklists: {
    columns: ['title', 'room', 'task', 'priority', 'status', 'assigned_to', 'due_date'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'title', label: 'Checklist Title', type: 'text', required: true },
      { name: 'room', label: 'Room', type: 'text' },
      { name: 'task', label: 'Task', type: 'textarea', required: true },
      { name: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]
  },
  'ai-suggestions': {
    columns: ['suggestion_type', 'suggestion', 'estimated_cost', 'impact_level', 'room_id'],
    form: [
      { name: 'room_id', label: 'Room ID', type: 'number' },
      { name: 'suggestion_type', label: 'Suggestion Type', type: 'text', required: true },
      { name: 'suggestion', label: 'Suggestion', type: 'textarea', required: true },
      { name: 'estimated_cost', label: 'Estimated Cost', type: 'number' },
      { name: 'impact_level', label: 'Impact Level', type: 'select', options: ['high', 'medium', 'low'] },
      { name: 'ai_model', label: 'AI Model', type: 'text' },
    ],
    format: { estimated_cost: v => v ? `$${Number(v).toLocaleString()}` : '-' }
  },
  listings: {
    columns: ['listing_title', 'target_audience', 'ai_generated', 'platform', 'property_id'],
    form: [
      { name: 'property_id', label: 'Property ID', type: 'number' },
      { name: 'listing_title', label: 'Listing Title', type: 'text', required: true },
      { name: 'listing_description', label: 'Description', type: 'textarea' },
      { name: 'key_features', label: 'Key Features', type: 'textarea' },
      { name: 'target_audience', label: 'Target Audience', type: 'text' },
      { name: 'ai_generated', label: 'AI Generated', type: 'select', options: ['true', 'false'] },
      { name: 'platform', label: 'Platform', type: 'select', options: ['Zillow', 'Redfin', 'Realtor.com', 'StreetEasy', 'Compass', 'Sothebys', 'Other'] },
    ],
    format: { ai_generated: v => v ? 'Yes' : 'No' }
  },
};

export default function CrudPage({ resource, title }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const config = fieldConfigs[resource] || { columns: ['id'], form: [] };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${resource}`, { params: { search: search || undefined } });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [resource, search]);

  const handleNew = () => {
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item, e) => {
    e.stopPropagation();
    setEditItem(item);
    const fd = {};
    config.form.forEach(f => {
      let val = item[f.name];
      if (f.type === 'date' && val) val = val.split('T')[0];
      if (f.type === 'datetime-local' && val) val = new Date(val).toISOString().slice(0, 16);
      fd[f.name] = val ?? '';
    });
    setFormData(fd);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/${resource}/${editItem.id}`, formData);
      } else {
        await api.post(`/${resource}`, formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving');
    }
  };

  const handleDelete = async (item, e) => {
    e.stopPropagation();
    if (!confirm(`Delete this ${title.replace(/s$/, '')}?`)) return;
    try {
      await api.delete(`/${resource}/${item.id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting');
    }
  };

  const formatValue = (col, val) => {
    if (config.format && config.format[col]) {
      const formatted = config.format[col](val);
      if (typeof formatted === 'string' && formatted.startsWith('<swatch>')) {
        const color = formatted.replace(/<\/?swatch>/g, '');
        return <><span className="color-swatch" style={{ background: color }} />{color}</>;
      }
      return formatted;
    }
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  };

  const getBadgeClass = (col, val) => {
    if (!val) return '';
    if (['status', 'priority', 'condition', 'current_condition', 'impact_level'].includes(col)) {
      return `badge badge-${String(val).toLowerCase().replace(/\s+/g, '_')}`;
    }
    return '';
  };

  return (
    <div>
      <div className="page-header">
        <h1>{title} <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>({total})</span></h1>
        <button className="btn btn-primary" onClick={handleNew}>+ New {title.replace(/s$/, '').replace(/ie$/, 'y')}</button>
      </div>

      <div className="search-bar">
        <input placeholder={`Search ${title.toLowerCase()}...`} value={search}
          onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-spinner"><div className="spinner" /> Loading...</div>
        ) : data.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: 40 }}>No {title.toLowerCase()} found. Click "New" to add one.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  {config.columns.map(col => (
                    <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} onClick={() => navigate(`/${resource}/${item.id}`)}>
                    <td>{item.id}</td>
                    {config.columns.map(col => (
                      <td key={col}>
                        {getBadgeClass(col, item[col]) ? (
                          <span className={getBadgeClass(col, item[col])}>{String(item[col])}</span>
                        ) : formatValue(col, item[col])}
                      </td>
                    ))}
                    <td onClick={(e) => e.stopPropagation()}>
                      <button className="btn btn-outline btn-sm" onClick={(e) => handleEdit(item, e)} style={{ marginRight: 6 }}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={(e) => handleDelete(item, e)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editItem ? 'Edit' : 'New'} {title.replace(/s$/, '').replace(/ie$/, 'y')}</h2>
            <form onSubmit={handleSave}>
              {config.form.map(field => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}{field.required && ' *'}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={formData[field.name] || ''} required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />
                  ) : field.type === 'select' ? (
                    <select value={formData[field.name] || ''} required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}>
                      <option value="">Select...</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={field.type} value={formData[field.name] || ''} required={field.required}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
