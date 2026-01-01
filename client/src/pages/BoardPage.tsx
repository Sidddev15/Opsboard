import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/http';
import type { BoardRequest, BoardResponse } from '../types/api';
import { useAuth } from '../state/auth';
import { EDITOR_EMAILS } from '../lib/config';
import { hhmm, urgencyStyle } from '../lib/format';
import RequestDrawer from '../components/RequestDrawer';
import AddRequestModal from '../components/AddRequestModal';

export default function BoardPage() {
  const [showAdd, setShowAdd] = useState(false);
  const { token, user, logout } = useAuth();
  const [items, setItems] = useState<BoardRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canEdit = useMemo(() => {
    if (!user) return false;
    return EDITOR_EMAILS.includes(user.email);
  }, [user]);

  async function load() {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch<BoardResponse>('/board', { token });
      setItems(data.requests);
    } catch (e: any) {
      setErr(e?.message || 'FAILED_TO_LOAD_BOARD');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // live enough for v0
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="col" style={{ gap: 4 }}>
          <div className="h1">OpsBoard v0</div>
          <div className="small">
            Logged in as <b>{user?.name}</b> •{' '}
            {canEdit ? 'Coordinator' : 'Read-only'}
          </div>
        </div>
        <div className="row">
          <button className="btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div className="sep" />

      {err && (
        <div className="card" style={{ borderColor: 'rgba(255,0,0,0.4)' }}>
          {err}
        </div>
      )}

      <div className="card">
        <div className="h2">Live Board</div>
        <div className="small muted" style={{ marginTop: 4 }}>
          Active requests only (not DONE). Sorted by urgency + time.
        </div>

        <div className="sep" />

        <table className="table">
          <thead>
            <tr>
              <th>Urgency</th>
              <th>Type</th>
              <th>Description</th>
              <th>Owner</th>
              <th>Status</th>
              <th>⏱</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Nothing active. Good.
                </td>
              </tr>
            )}

            {items.map((r) => (
              <tr
                key={r.id}
                style={{
                  ...urgencyStyle(r.urgency as any, r.status),
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button, select, option, input')) return;
                  setSelectedId(r.id);
                }}
              >
                <td>
                  <span className="badge">
                    {r.urgency === 'NOW'
                      ? '🔴 NOW'
                      : r.urgency === 'TODAY'
                      ? '🟠 TODAY'
                      : '⚪ LOW'}
                  </span>
                </td>
                <td className="small">{r.type}</td>
                <td>{r.description}</td>
                <td>{r.owner?.name}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td className="small" title={r.createdAt}>
                  {hhmm(r.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!canEdit && (
        <div className="small muted" style={{ marginTop: 12 }}>
          Read-only mode: you can view everything here. Nothing is hidden.
        </div>
      )}

      {selectedId && (
        <RequestDrawer
          requestId={selectedId}
          onClose={() => setSelectedId(null)}
          canEdit={canEdit}
          onUpdated={load}
        />
      )}

      {showAdd && (
        <AddRequestModal onClose={() => setShowAdd(false)} onCreated={load} />
      )}

      {canEdit && (
        <div className="fab">
          <button className="btn primary" onClick={() => setShowAdd(true)}>
            + ADD REQUEST
          </button>
        </div>
      )}
    </div>
  );
}
