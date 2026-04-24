import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DetailPage({ resource, title }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setLoading(true);
    api.get(`/${resource}/${id}`)
      .then(r => { setItem(r.data); setFormData(r.data); })
      .catch(() => navigate(`/${resource}`))
      .finally(() => setLoading(false));
  }, [resource, id]);

  const handleSave = async () => {
    try {
      const res = await api.put(`/${resource}/${id}`, formData);
      setItem(res.data);
      setEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving');
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this ${title}?`)) return;
    try {
      await api.delete(`/${resource}/${id}`);
      navigate(`/${resource}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /> Loading...</div>;
  if (!item) return <p>Not found</p>;

  const excludeFields = ['created_at'];
  const fields = Object.entries(item).filter(([k]) => !excludeFields.includes(k));

  const formatValue = (key, val) => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (key === 'price' || key === 'amount' || key === 'total' || key === 'tax' || key === 'budget' ||
        key === 'purchase_price' || key === 'rental_price_daily' || key === 'cost' ||
        key === 'avg_staging_cost' || key === 'estimated_cost') {
      return `$${Number(val).toLocaleString()}`;
    }
    if (key.includes('date') && val) {
      return new Date(val).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    if ((key.includes('color') && typeof val === 'string' && val.startsWith('#'))) {
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: val, border: '2px solid #e5e7eb', display: 'inline-block' }} />
          {val}
        </span>
      );
    }
    return String(val);
  };

  const getInputType = (key) => {
    if (key.includes('date')) return 'date';
    if (key.includes('price') || key.includes('cost') || key.includes('amount') || key.includes('total') ||
        key.includes('tax') || key.includes('budget') || key === 'sqft' || key === 'bedrooms' ||
        key === 'bathrooms' || key === 'width' || key === 'length' || key === 'popularity' ||
        key === 'impact_score' || key === 'rating' || key === 'duration_minutes' || key === 'year' ||
        key.includes('_id')) return 'number';
    if (key.includes('color') && typeof item[key] === 'string' && item[key]?.startsWith('#')) return 'color';
    if (key === 'description' || key === 'notes' || key === 'suggestion' || key === 'key_elements' ||
        key === 'before_description' || key === 'after_description' || key === 'listing_description' ||
        key === 'key_features' || key === 'ai_description' || key === 'task') return 'textarea';
    return 'text';
  };

  return (
    <div>
      <div className="detail-header">
        <button className="btn-back" onClick={() => navigate(`/${resource}`)}>← Back</button>
        <h1>{title} #{id}</h1>
      </div>

      <div className="card">
        {editing ? (
          <>
            <div className="detail-grid">
              {fields.map(([key, val]) => (
                <div className="detail-field" key={key}>
                  <div className="field-label">{key.replace(/_/g, ' ')}</div>
                  {key === 'id' ? (
                    <div className="field-value">{val}</div>
                  ) : getInputType(key) === 'textarea' ? (
                    <textarea style={{ width: '100%', padding: '8px', border: '2px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit', minHeight: 80 }}
                      value={formData[key] || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                  ) : (
                    <input type={getInputType(key)}
                      style={{ width: '100%', padding: '8px', border: '2px solid var(--border)', borderRadius: '8px' }}
                      value={formData[key] || ''}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              <button className="btn btn-outline" onClick={() => { setEditing(false); setFormData(item); }}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div className="detail-grid">
              {fields.map(([key, val]) => (
                <div className="detail-field" key={key}>
                  <div className="field-label">{key.replace(/_/g, ' ')}</div>
                  <div className="field-value">
                    {['status', 'priority', 'condition', 'current_condition', 'impact_level'].includes(key) && val ? (
                      <span className={`badge badge-${String(val).toLowerCase().replace(/\s+/g, '_')}`}>{String(val)}</span>
                    ) : formatValue(key, val)}
                  </div>
                </div>
              ))}
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
