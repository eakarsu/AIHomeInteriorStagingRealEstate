import { useRef, useState } from 'react';
import api from '../services/api';

const demoCredentials = {
  email: import.meta.env.VITE_DEMO_EMAIL || 'demo@staging.com',
  password: import.meta.env.VITE_DEMO_PASSWORD || '',
};

export default function Login({ onLogin }) {
  const demoLoginLock = useRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: (demoLoginCredentials?.email ?? email), password: (demoLoginCredentials?.password ?? password) });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏠</div>
        <h1>AI Home Staging</h1>
        <p className="subtitle">Interior Staging Platform for Real Estate</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required />
          </div>
          <button
            type="button"
            onClick={async (event) => {
              if (demoLoginLock.current) return;
              demoLoginLock.current = true;
              setDemoLoginBusy(true);
              setEmail(demoCredentials.email);
              setPassword(demoCredentials.password);
              try {
                if (!demoCredentials.password) {
                  setError('Demo login is unavailable until VITE_DEMO_PASSWORD is configured.');
                  return;
                }
                await handleSubmit(event, demoCredentials);
              } finally {
                demoLoginLock.current = false;
                setDemoLoginBusy(false);
              }
            }}
            disabled={demoLoginBusy || !demoCredentials.password}
            aria-label="Log in as Demo"
            title={demoCredentials.password ? 'Log in with the configured demo account' : 'Configure VITE_DEMO_PASSWORD to enable demo login'}
            style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
          >
            Log In as Demo
          </button>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        {error && <p className="login-error">{error}</p>}
      </div>
    </div>
  );
}
