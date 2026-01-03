import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/http';
import { useAuth } from '../state/auth';
import type { BoardRequest, RequestStatus } from '../types/api';
import { hhmm } from '../lib/format';

type HistoryEvent = {
  id: string;
  type: string;
  fromValue?: string | null;
  toValue?: string | null;
  createdAt: string;
  performedBy: { id: string; name: string };
};

type HistoryResponse = {
  request: BoardRequest & {
    events: HistoryEvent[];
    createdBy: { id: string; name: string };
  };
};

type UserLite = { id: string; name: string };

const STATUS_ORDER: RequestStatus[] = ['NEW', 'IN_PROGRESS', 'WAITING', 'DONE'];

export default function RequestDrawer({
  requestId,
  onClose,
  canEdit,
  onUpdated,
}: {
  requestId: string;
  onClose: () => void;
  canEdit: boolean;
  onUpdated: () => void;
}) {
  const { token } = useAuth();
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadAll() {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const [req, u] = await Promise.all([
        apiFetch<HistoryResponse>(`/requests/${requestId}/history`, { token }),
        apiFetch<{ users: UserLite[] }>('/auth/users', { token }),
      ]);
      setData(req);
      setUsers(u.users);
    } catch (e: any) {
      setErr(e?.message || 'FAILED_TO_LOAD');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, token]);

  const currentStatus = data?.request.status;

  const canMoveTo = useMemo(() => {
    if (!currentStatus) return new Set<RequestStatus>();
    const map: Record<RequestStatus, RequestStatus[]> = {
      NEW: ['IN_PROGRESS', 'WAITING'],
      IN_PROGRESS: ['WAITING', 'DONE'],
      WAITING: ['IN_PROGRESS', 'DONE'],
      DONE: [],
    };
    return new Set(map[currentStatus]);
  }, [currentStatus]);

  async function assignOwner(ownerId: string) {
    if (!token || !data) return;
    setBusy(true);
    try {
      await apiFetch(`/requests/${data.request.id}/assign`, {
        method: 'POST',
        token,
        body: { ownerId },
      });
      await loadAll();
      onUpdated();
    } catch (e) {
      setErr('FAILED_TO_ASSIGN');
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(to: RequestStatus) {
    if (!token || !data) return;
    if (to === 'DONE') {
      const ok = window.confirm(
        'Mark this request as DONE? This cannot be reopened.'
      );
      if (!ok) return;
    }
    setBusy(true);
    try {
      await apiFetch(
        `/requests/${data.request.id}/${to === 'DONE' ? 'close' : 'status'}`,
        {
          method: 'POST',
          token,
          body: to === 'DONE' ? undefined : { status: to },
        }
      );
      await loadAll();
      onUpdated();
    } catch (e) {
      setErr('FAILED_TO_CHANGE_STATUS');
    } finally {
      setBusy(false);
    }
  }

  if (!data && loading) return null;

  return (
    <>
      <div className="drawerBackdrop" onClick={onClose} />
      <div className="drawer">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="h2">Request</div>
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        {err && (
          <div className="card" style={{ borderColor: 'rgba(255,0,0,0.4)' }}>
            {err}
          </div>
        )}

        {!data ? (
          <div className="muted">Loading…</div>
        ) : (
          <>
            <div className="sep" />

            <div className="badge">{data.request.type}</div>

            <div className="h1" style={{ marginTop: 8 }}>
              {data.request.description}{' '}
              {data.request.status === 'DONE' && (
                <div
                  className="card"
                  style={{
                    borderColor: 'rgba(0,255,0,0.4)',
                    background: 'rgba(0,255,0,0.06)',
                    marginTop: 12,
                  }}
                >
                  This request is DONE. It cannot be reopened.
                </div>
              )}
            </div>

            <div className="sep" />

            <div className="col">
              <div>
                <b>Urgency:</b> {data.request.urgency}
              </div>

              <div>
                <b>Owner:</b>{' '}
                {canEdit ? (
                  <select
                    className="select"
                    disabled={busy || data.request.status === 'DONE'}
                    style={{ opacity: busy ? 0.6 : 1, marginTop: '10px' }}
                    value={data.request.owner?.id}
                    onChange={(e) => assignOwner(e.target.value)}
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  data.request.owner?.name
                )}
              </div>

              <div>
                <b>Status:</b>
                <div className="row" style={{ flexWrap: 'wrap', marginTop: 6 }}>
                  {STATUS_ORDER.map((s) => (
                    <button
                      key={s}
                      className="btn"
                      style={{ opacity: busy ? 0.6 : 1 }}
                      disabled={
                        !canEdit ||
                        busy ||
                        s === data.request.status ||
                        !canMoveTo.has(s)
                      }
                      onClick={() => changeStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <b>Location:</b> {data.request.location}
              </div>
              <div>
                <b>Requested by:</b> {data.request.requestedBy}
              </div>
              <div>
                <b>Created at:</b> {hhmm(data.request.createdAt)}
              </div>
              <div>
                <b>Created by:</b> {data.request.createdBy.name}
              </div>
            </div>

            <div className="sep" />

            <details>
              <summary className="small">History</summary>
              <div className="col" style={{ marginTop: 8 }}>
                {data.request.events.map((e) => (
                  <div key={e.id} className="small">
                    {hhmm(e.createdAt)} — {e.type}
                    {e.fromValue ? ` (${e.fromValue} → ${e.toValue})` : ''}
                    {' by '}
                    {e.performedBy.name}
                  </div>
                ))}
              </div>
            </details>

            {!canEdit && (
              <div className="small muted" style={{ marginTop: 12 }}>
                Read-only view.
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
