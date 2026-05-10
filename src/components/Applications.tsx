import type { Application, ApplicationStatus } from '../types/application';
import { useCVStore } from '../state/useCVStore';
import { APPLICATION_STATUS_META } from '../lib/constants';
import { uid } from '../lib/helpers';

export function Applications() {
  const { applications, setApplications, active } = useCVStore();

  function update(id: string, patch: Partial<Application>) {
    const now = new Date().toISOString();
    setApplications(
      applications.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: now } : a,
      ),
    );
  }

  function remove(id: string) {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    setApplications(applications.filter((a) => a.id !== id));
  }

  function create() {
    const now = new Date().toISOString();
    const fresh: Application = {
      id: uid('app-'),
      company: '',
      role: '',
      postingUrl: '',
      appliedDate: '',
      status: 'drafting',
      notes: '',
      createdAt: now,
      updatedAt: now,
      sourceProfile: active,
      snapshot: { cv: null, headshotKey: null },
    };
    setApplications([fresh, ...applications]);
  }

  const sorted = [...applications].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );

  return (
    <div className="apps">
      <header className="apps__header">
        <div>
          <h2 className="apps__title">Applications</h2>
          <p className="apps__lead">
            Track every role you apply to. Saved on this device only.
          </p>
        </div>
        <button className="btn btn--primary" onClick={create}>
          + New application
        </button>
      </header>

      {sorted.length === 0 ? (
        <div className="apps__empty">
          <p>No applications yet.</p>
        </div>
      ) : (
        <ul className="apps__list">
          {sorted.map((a) => (
            <ApplicationCard
              key={a.id}
              app={a}
              onChange={(patch) => update(a.id, patch)}
              onDelete={() => remove(a.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

interface ApplicationCardProps {
  app: Application;
  onChange: (patch: Partial<Application>) => void;
  onDelete: () => void;
}

function ApplicationCard({ app, onChange, onDelete }: ApplicationCardProps) {
  const meta = APPLICATION_STATUS_META.find((s) => s.id === app.status);
  return (
    <li className="app-card">
      <div className="app-card__row app-card__row--top">
        <div className="app-card__title">
          <input
            className="app-card__company"
            type="text"
            value={app.company}
            onChange={(e) => onChange({ company: e.target.value })}
            placeholder="Company"
            aria-label="Company"
          />
          <input
            className="app-card__role"
            type="text"
            value={app.role}
            onChange={(e) => onChange({ role: e.target.value })}
            placeholder="Role"
            aria-label="Role"
          />
        </div>
        <div className="app-card__status-wrap">
          <span
            className="app-card__status-dot"
            style={{ background: meta?.color ?? '#9aa1a6' }}
            aria-hidden
          />
          <select
            className="app-card__status"
            value={app.status}
            onChange={(e) =>
              onChange({ status: e.target.value as ApplicationStatus })
            }
            aria-label="Status"
          >
            {APPLICATION_STATUS_META.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            className="btn btn--ghost app-card__delete"
            onClick={onDelete}
            aria-label="Delete application"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      <div className="app-card__row app-card__row--meta">
        <label className="app-card__field">
          <span>Applied</span>
          <input
            type="date"
            value={app.appliedDate}
            onChange={(e) => onChange({ appliedDate: e.target.value })}
          />
        </label>
        <label className="app-card__field app-card__field--grow">
          <span>Posting URL</span>
          <input
            type="url"
            value={app.postingUrl}
            onChange={(e) => onChange({ postingUrl: e.target.value })}
            placeholder="https://"
          />
        </label>
        <div className="app-card__source">
          <span>Profile</span>
          <span>{app.sourceProfile}</span>
        </div>
      </div>

      <label className="app-card__notes">
        <span className="app-card__notes-label">Notes</span>
        <textarea
          value={app.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Recruiter contact, interview prep, follow-ups…"
          rows={3}
        />
      </label>
    </li>
  );
}
