import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/http';
import { useAuth } from '../state/auth';
import type { BoardRequest } from '../types/api';
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
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await apiFetch<HistoryResponse>(
          `/requests/${requestId}/history`,
          {
            token,
          }
        );
        if (alive) setData(res);
      } catch (e: any) {
        if (alive) setErr(e?.message || 'FAILED_TO_LOAD');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [requestId, token]);

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
              {data.request.description}
            </div>

            <div className="sep" />

            <div className="col">
              <div>
                <b>Urgency:</b> {data.request.urgency}
              </div>
              <div>
                <b>Status:</b> {data.request.status}
              </div>
              <div>
                <b>Owner:</b> {data.request.owner?.name}
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
