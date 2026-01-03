import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/http';
import type { BoardRequest, BoardResponse } from '../types/api';
import { useAuth } from '../state/auth';
import { EDITOR_EMAILS } from '../lib/config';
import { hhmm, urgencyStyle } from '../lib/format';
import RequestDrawer from '../components/RequestDrawer';
import AddRequestModal from '../components/AddRequestModal';

const isMobile = window.innerWidth < 768;

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

      {loading && <div className="small">Loading…</div>}

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

        {!isMobile ? (
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
                    Nothing active.
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
                    const t = e.target as HTMLElement;
                    if (t.closest('button,select,input')) return;
                    setSelectedId(r.id);
                  }}
                >
                  <td>{r.urgency}</td>
                  <td className="small">{r.type}</td>
                  <td>{r.description}</td>
                  <td>{r.owner?.name}</td>
                  <td>
                    <span className="badge">{r.status}</span>
                  </td>
                  <td className="small">{hhmm(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="col">
            {items.map((r) => (
              <div
                key={r.id}
                className="card"
                style={{ ...urgencyStyle(r.urgency as any, r.status) }}
                onClick={() => setSelectedId(r.id)}
              >
                <div
                  className="row"
                  style={{ justifyContent: 'space-between' }}
                >
                  <b>{r.description}</b>
                  <span className="badge">{r.urgency}</span>
                </div>
                <div className="small muted">{r.type}</div>
                <div className="row small">
                  <span>
                    Owner: <b>{r.owner?.name}</b>
                  </span>
                  <span>
                    Status: <b>{r.status}</b>
                  </span>
                </div>
                <div className="small muted">⏱ {hhmm(r.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
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
