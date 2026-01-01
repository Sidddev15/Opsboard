import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, HttpError } from '../lib/http';
import type { LoginResponse } from '../types/api';
import { useAuth } from '../state/auth';

export default function LoginPage() {
  const nav = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('siddharth@opsboard.local');
  const [password, setPassword] = useState('Password@123');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setAuth(data.token, data.user);
      nav('/', { replace: true });
    } catch (e) {
      if (e instanceof HttpError) setErr(e.body?.error || 'LOGIN_FAILED');
      else setErr('LOGIN_FAILED');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 520, paddingTop: 70 }}>
      <div className="card">
        <div className="h1">OpsBoard v0</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Login. No drama.
        </div>

        <div className="sep" />

        <form className="col" onSubmit={onSubmit}>
          <label className="col" style={{ gap: 6 }}>
            <div className="small">Email</div>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="col" style={{ gap: 6 }}>
            <div className="small">Password</div>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {err && (
            <div className="badge" style={{ borderColor: 'rgba(255,0,0,0.4)' }}>
              {err}
            </div>
          )}

          <button className="btn primary" disabled={loading}>
            {loading ? 'Logging in…' : 'Login'}
          </button>

          <div className="small">
            Default seed: <span className="kbd">Password@123</span>
          </div>
        </form>
      </div>
    </div>
  );
}
