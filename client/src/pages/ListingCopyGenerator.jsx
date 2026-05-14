import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ListingCopyGenerator() {
  const [properties, setProperties] = useState([]);
  const [propertyId, setPropertyId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/properties', { params: { limit: 100 } })
      .then(res => setProperties(res.data.data || []))
      .catch(() => setProperties([]));
  }, []);

  const handleGenerate = async () => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    try {
      const res = await api.post('/ai/generate-listing-copy', { property_id: parseInt(propertyId) });
      setResult(res.data);
      if (res.data.savedListing) setSaved(true);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 429
        ? 'AI rate limit reached. Please wait before making more analysis requests.'
        : (err.response?.data?.error || 'Failed to generate listing copy'));
    } finally {
      setLoading(false);
    }
  };

  const listing = result?.listing;

  return (
    <div>
      <div className="page-header">
        <h1>AI Listing Copy Generator</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
        Select a property to generate AI-powered listing copy using its rooms and staging data.
      </p>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 250, marginBottom: 0 }}>
            <label>Select Property</label>
            <select value={propertyId} onChange={e => setPropertyId(e.target.value)}>
              <option value="">Choose a property...</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} - {p.city}, {p.state} (${Number(p.price || 0).toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !propertyId}
            style={{ marginTop: 22 }}
          >
            {loading ? 'Generating...' : 'Generate Listing Copy'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card" style={{ marginTop: 20, textAlign: 'center' }}>
          <div className="loading-spinner">
            <div className="spinner" />
            AI is crafting your listing copy... This may take a few seconds.
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ marginTop: 20, background: '#fff5f5', borderColor: '#fed7d7' }}>
          <p style={{ color: '#c53030' }}>{error}</p>
        </div>
      )}

      {result && listing && (
        <div className="card" style={{ marginTop: 20 }}>
          {saved && (
            <div style={{
              padding: '10px 16px',
              background: '#f0fff4',
              borderRadius: 8,
              marginBottom: 20,
              border: '1px solid #9ae6b4',
              color: '#276749',
              fontWeight: 600
            }}>
              Listing saved to database successfully!
            </div>
          )}

          {/* Headline */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Headline
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>{listing.headline}</h2>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Property Description
            </div>
            <p style={{ lineHeight: 1.7, color: 'var(--text)' }}>{listing.description}</p>
          </div>

          {/* Key Features */}
          {listing.key_features?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Key Features
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                {listing.key_features.map((feature, i) => (
                  <li key={i} style={{
                    padding: '8px 12px',
                    background: 'var(--bg)',
                    borderRadius: 8,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8
                  }}>
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Buyer */}
          {listing.target_buyer_persona && (
            <div style={{
              padding: '14px 16px',
              background: '#ebf8ff',
              borderRadius: 8,
              border: '1px solid #bee3f8',
              marginBottom: 20
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2b6cb0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Buyer Persona
              </div>
              <p style={{ color: '#2c5282', margin: 0 }}>{listing.target_buyer_persona}</p>
            </div>
          )}

          {/* Save as Listing button */}
          {!saved && (
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await api.post('/listings', {
                    property_id: parseInt(propertyId),
                    listing_title: listing.headline,
                    listing_description: listing.description,
                    key_features: Array.isArray(listing.key_features) ? listing.key_features.join('\n') : listing.key_features,
                    target_audience: listing.target_buyer_persona,
                    ai_generated: true,
                    platform: 'Zillow'
                  });
                  setSaved(true);
                } catch {
                  alert('Failed to save listing');
                }
              }}
            >
              Save as Listing
            </button>
          )}
        </div>
      )}
    </div>
  );
}
