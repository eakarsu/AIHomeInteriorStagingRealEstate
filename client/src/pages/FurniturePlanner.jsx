import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function FurniturePlanner() {
  const [rooms, setRooms] = useState([]);
  const [roomId, setRoomId] = useState('');
  const [stylePreference, setStylePreference] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [addingToProject, setAddingToProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    api.get('/rooms', { params: { limit: 100 } })
      .then(res => setRooms(res.data.data || []))
      .catch(() => setRooms([]));
    api.get('/staging-projects', { params: { limit: 100 } })
      .then(res => setProjects(res.data.data || []))
      .catch(() => setProjects([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/ai/furniture-plan', {
        room_id: parseInt(roomId),
        style_preference: stylePreference,
        budget_max: parseFloat(budgetMax) || 500
      });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 429
        ? 'AI rate limit reached. Please wait before making more analysis requests.'
        : (err.response?.data?.error || 'Failed to generate furniture plan'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddToProject = async () => {
    if (!selectedProjectId || !result?.plan?.selected_items) return;
    setAddingToProject(true);
    try {
      // Log each selected item as an AI suggestion linked to the room and project
      for (const item of result.plan.selected_items) {
        await api.post('/ai-suggestions', {
          room_id: parseInt(roomId),
          suggestion_type: 'furniture_plan',
          suggestion: `${item.name}: ${item.placement_suggestion}`,
          estimated_cost: item.rental_price_daily,
          impact_level: 'high',
          ai_model: 'anthropic/claude-3-5-sonnet-20241022'
        }).catch(() => {});
      }
      alert(`Furniture plan added to project successfully!`);
    } catch (err) {
      alert('Failed to add items to project');
    } finally {
      setAddingToProject(false);
    }
  };

  const plan = result?.plan;

  return (
    <div>
      <div className="page-header">
        <h1>AI Furniture Planner</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
        Select a room and preferences, and AI will choose the best furniture from your inventory.
      </p>

      <div className="card" style={{ marginBottom: 24 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Room *</label>
            <select value={roomId} onChange={e => setRoomId(e.target.value)} required>
              <option value="">Select a room...</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.room_type}) - {r.width}x{r.length} ft
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Style Preference</label>
            <select value={stylePreference} onChange={e => setStylePreference(e.target.value)}>
              <option value="">Modern Transitional</option>
              <option value="Contemporary">Contemporary</option>
              <option value="Scandinavian">Scandinavian</option>
              <option value="Farmhouse">Farmhouse</option>
              <option value="Luxury">Luxury</option>
              <option value="Coastal">Coastal</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Bohemian">Bohemian</option>
            </select>
          </div>
          <div className="form-group">
            <label>Daily Budget Maximum ($)</label>
            <input
              type="number"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              placeholder="500"
              min="0"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading || !roomId}>
            {loading ? 'Generating Plan...' : 'Generate Furniture Plan'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <div className="loading-spinner">
            <div className="spinner" />
            AI is selecting furniture... This may take a few seconds.
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ marginTop: 20, background: '#fff5f5', borderColor: '#fed7d7' }}>
          <p style={{ color: '#c53030' }}>{error}</p>
        </div>
      )}

      {result && plan && (
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginBottom: 16 }}>Furniture Plan for {result.room?.name}</h3>

          {/* Selected Items */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ marginBottom: 12, color: 'var(--accent)' }}>Selected Items</h4>
            <div style={{ display: 'grid', gap: 12 }}>
              {plan.selected_items?.map((item, i) => (
                <div key={i} style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16
                }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{item.placement_suggestion}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>
                    ${item.rental_price_daily}/day
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Cost */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg)',
            borderRadius: 8,
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: '1.1rem'
          }}>
            <span>Total Daily Cost</span>
            <span style={{ color: 'var(--accent)' }}>${plan.total_daily_cost}/day</span>
          </div>

          {/* Arrangement Notes */}
          {plan.arrangement_notes && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 8 }}>Arrangement Notes</h4>
              <p style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>{plan.arrangement_notes}</p>
            </div>
          )}

          {/* Add to Project */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.9rem', minWidth: 200 }}
            >
              <option value="">Select staging project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.title} ({p.style})</option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              onClick={handleAddToProject}
              disabled={addingToProject || !selectedProjectId}
            >
              {addingToProject ? 'Adding...' : 'Add to Project'}
            </button>
          </div>
        </div>
      )}

      {result && !plan && result.rawResponse && (
        <div className="ai-result" style={{ marginTop: 20 }}>
          <h3>AI Response</h3>
          <div className="ai-result-content">
            <ReactMarkdown>{result.rawResponse}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
