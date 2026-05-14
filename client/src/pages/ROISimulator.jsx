import { useState, useEffect } from 'react';
import api from '../services/api';

const riskColors = {
  proceed: { bg: '#d1fae5', border: '#4ade80', text: '#166534', label: 'Proceed with Staging' },
  increase_budget: { bg: '#dbeafe', border: '#60a5fa', text: '#1e40af', label: 'Increase Budget' },
  reduce_scope: { bg: '#fef9c3', border: '#facc15', text: '#854d0e', label: 'Reduce Scope' },
  skip_staging: { bg: '#fee2e2', border: '#f87171', text: '#991b1b', label: 'Skip Staging' },
};

function StatCard({ label, value, subtext, color }) {
  return (
    <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
      <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: color || '#0F172A' }}>{value}</div>
      {subtext && <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{subtext}</div>}
    </div>
  );
}

export default function ROISimulator() {
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({ property_id: '', proposed_budget: '', style: 'Contemporary', timeline_days: 14 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/properties', { params: { limit: 100 } })
      .then(res => setProperties(res.data.data || []))
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!form.property_id || !form.proposed_budget) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/ai/roi-simulator', {
        property_id: parseInt(form.property_id),
        proposed_budget: parseFloat(form.proposed_budget),
        style: form.style,
        timeline_days: parseInt(form.timeline_days) || 14,
      });
      setResult(res.data);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 429
        ? 'AI rate limit reached. Max 20 requests/hour. Please try again later.'
        : (err.response?.data?.error || 'Failed to run ROI simulation'));
    } finally {
      setLoading(false);
    }
  };

  const roi = result?.roiPrediction;
  const rec = roi?.recommendation;
  const recStyle = riskColors[rec] || riskColors.proceed;

  const inputStyle = {
    width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 14,
    boxSizing: 'border-box', outline: 'none', background: '#FFFFFF',
  };

  return (
    <div style={{ padding: '32px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Staging ROI Simulator</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
          AI combines your market analytics and staging history to predict sale-price uplift and days-on-market reduction.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 28, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', color: '#0F172A' }}>Configure Simulation</h3>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Property</label>
            <select value={form.property_id} onChange={(e) => setForm({ ...form, property_id: e.target.value })} style={inputStyle}>
              <option value="">Select a property...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title || p.address} — ${parseInt(p.price || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Proposed Staging Budget ($)</label>
            <input
              type="number"
              value={form.proposed_budget}
              onChange={(e) => setForm({ ...form, proposed_budget: e.target.value })}
              placeholder="e.g. 8000"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Staging Style</label>
            <select value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} style={inputStyle}>
              {['Contemporary', 'Transitional', 'Modern', 'Traditional', 'Farmhouse', 'Luxury', 'Minimalist', 'Coastal'].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Staging Duration (days)</label>
            <input
              type="number"
              value={form.timeline_days}
              onChange={(e) => setForm({ ...form, timeline_days: e.target.value })}
              placeholder="14"
              min="1"
              max="180"
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #FECACA', color: '#DC2626', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading || !form.property_id || !form.proposed_budget}
            style={{
              width: '100%', padding: '12px', borderRadius: 8, border: 'none', cursor: loading || !form.property_id || !form.proposed_budget ? 'not-allowed' : 'pointer',
              background: loading ? '#94A3B8' : '#6366F1', color: '#FFFFFF', fontSize: 15, fontWeight: 700,
            }}
          >
            {loading ? '🤖 Simulating...' : '🤖 Run ROI Simulation'}
          </button>

          {result?.dataPoints && (
            <div style={{ marginTop: 16, padding: 12, background: '#F0F9FF', borderRadius: 8, fontSize: 12, color: '#0369A1' }}>
              Analysis used: {result.dataPoints.marketAnalyticsUsed} market data points,{' '}
              {result.dataPoints.historicalProjectsUsed} historical projects,{' '}
              {result.dataPoints.roomsToStage} rooms to stage.
            </div>
          )}
        </div>

        {/* Results */}
        {roi ? (
          <div style={{ display: 'grid', gap: 20 }}>
            {/* Recommendation Banner */}
            <div style={{ padding: '20px 24px', borderRadius: 12, background: recStyle.bg, border: `2px solid ${recStyle.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: recStyle.text, fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>AI Recommendation</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: recStyle.text }}>{recStyle.label}</div>
                </div>
                <div style={{ padding: '8px 16px', background: recStyle.border, borderRadius: 20, color: '#fff', fontWeight: 700, fontSize: 14 }}>
                  {roi.confidence_level?.toUpperCase() || 'MEDIUM'} CONFIDENCE
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <StatCard
                label="Estimated ROI"
                value={`${roi.estimated_roi_percent?.toFixed(1) || '—'}%`}
                color="#6366F1"
              />
              <StatCard
                label="Price Increase"
                value={`$${(roi.predicted_sale_price_increase || 0).toLocaleString()}`}
                subtext={`(+${roi.predicted_sale_price_increase_percent?.toFixed(1) || '0'}%)`}
                color="#10B981"
              />
              <StatCard
                label="DOM Reduction"
                value={`${roi.days_on_market_reduction || '—'} days`}
                color="#F59E0B"
              />
            </div>

            {/* Risk & Budget */}
            {roi.budget_recommendation && (
              <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Budget Analysis</h4>
                <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6 }}>{roi.budget_recommendation}</p>
                {roi.break_even_days !== undefined && (
                  <div style={{ marginTop: 12, fontSize: 13, color: '#64748B' }}>
                    Break-even: approximately <strong>{roi.break_even_days} days</strong> on market
                  </div>
                )}
              </div>
            )}

            {/* Market Context */}
            {roi.market_context && (
              <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Market Context</h4>
                <p style={{ fontSize: 14, color: '#475569', margin: 0, lineHeight: 1.6 }}>{roi.market_context}</p>
              </div>
            )}

            {/* Risk Factors */}
            {roi.risk_factors?.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 20 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px', color: '#DC2626' }}>Risk Factors</h4>
                <ul style={{ paddingLeft: 18, margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.8 }}>
                  {roi.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
          </div>
        ) : !loading ? (
          <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: 12, border: '2px dashed #E2E8F0' }}>
            <div style={{ textAlign: 'center', color: '#94A3B8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Configure your simulation and click Run</p>
              <p style={{ margin: '8px 0 0', fontSize: 13 }}>AI will combine market analytics and historical staging data</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
