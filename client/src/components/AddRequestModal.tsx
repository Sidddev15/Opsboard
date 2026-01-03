import { useState, useEffect } from 'react';
import { apiFetch, HttpError } from '../lib/http';
import { useAuth } from '../state/auth';
import type { RequestType, UrgencyLevel } from '../types/api';

const REQUEST_TYPES: RequestType[] = [
  'TRANSPORT',
  'FORKLIFT',
  'PACKING_HELP',
  'URGENT_PURCHASE',
  'MACHINE_ISSUE',
  'LABOUR_REQUIREMENT',
  'OTHER',
];

const URGENCIES: UrgencyLevel[] = ['NOW', 'TODAY', 'LOW'];

export default function AddRequestModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { token } = useAuth();

  const [type, setType] = useState<RequestType | ''>('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel | ''>('');
  const [location, setLocation] = useState('');
  const [requestedBy, setRequestedBy] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ users: { id: string; name: string }[] }>('/auth/users', {
      token,
    })
      .then((res) => setUsers(res.users))
      .catch(() => setUsers([]));
  }, [token]);

  const canSubmit =
    type &&
    description.trim().length >= 3 &&
    urgency &&
    location.trim().length >= 2 &&
    requestedBy.trim().length >= 2 &&
    ownerId;

  async function submit() {
    if (!canSubmit || !token) return;
    setLoading(true);
    setErr(null);
    try {
      await apiFetch('/requests', {
        method: 'POST',
        body: {
          type,
          description: description.trim(),
          urgency,
          location: location.trim(),
          requestedBy: requestedBy.trim(),
          ownerId,
        },
        token,
      });

      onCreated();
      onClose();
    } catch (e) {
      if (e instanceof HttpError) setErr(e.body?.error || 'FAILED_TO_CREATE');
      else setErr('FAILED_TO_CREATE');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modalBackdrop">
      <div className="modal">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="h2">Add Request</div>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="sep" />

        <div className="col">
          <label className="col">
            <div className="small">Request Type</div>
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value as RequestType)}
            >
              <option value="">Select type</option>
              {REQUEST_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label className="col">
            <div className="small">Short description</div>
            <input
              className="input"
              placeholder="Plain language. Short."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="col">
            <div className="small">Urgency</div>
            <div className="row">
              {URGENCIES.map((u) => (
                <button
                  key={u}
                  type="button"
                  className="btn"
                  style={{
                    borderColor:
                      urgency === u ? 'rgba(255,255,255,0.6)' : undefined,
                  }}
                  onClick={() => setUrgency(u)}
                >
                  {u}
                </button>
              ))}
            </div>
          </label>

          <label className="col">
            <div className="small">Location / Dept</div>
            <input
              className="input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </label>

          <label className="col">
            <div className="small">Requested by</div>
            <input
              className="input"
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
            />
          </label>

          <label className="col">
            <div className="small">Owner</div>
            <select
              className="select"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
            >
              <option value="">Select owner</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </label>

          {err && (
            <div className="badge" style={{ borderColor: 'rgba(255,0,0,0.4)' }}>
              {err}
            </div>
          )}

          <button
            className="btn primary"
            disabled={!canSubmit || loading}
            onClick={submit}
          >
            {loading ? 'Creating…' : 'CREATE REQUEST'}
          </button>

          <div className="small muted">
            Rule: If it’s not here, it doesn’t exist.
          </div>
        </div>
      </div>
    </div>
  );
}
