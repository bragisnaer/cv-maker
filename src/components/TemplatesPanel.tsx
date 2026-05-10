import { useState } from 'react';
import { useCVStore } from '../state/useCVStore';
import { TEMPLATES } from '../templates/registry';
import { classNames } from '../lib/helpers';

export function TemplatesPanel() {
  const { cv, updatePath } = useCVStore();
  const [open, setOpen] = useState(false);
  const active = TEMPLATES.find((t) => t.id === cv.templateId) ?? TEMPLATES[0];

  return (
    <aside
      className={classNames('templates-panel', open && 'templates-panel--open')}
      aria-label="Template picker"
    >
      <button
        type="button"
        className="templates-panel__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Hide templates' : `Template · ${active.name}`}
      </button>

      {open && (
        <div className="templates-panel__body">
          <h3 className="templates-panel__title">Choose a template</h3>
          <ul className="templates-panel__list">
            {TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className={classNames(
                    'templates-panel__item',
                    cv.templateId === t.id && 'templates-panel__item--active',
                  )}
                  onClick={() => updatePath(['templateId'], t.id)}
                >
                  <span className="templates-panel__name">{t.name}</span>
                  <span className="templates-panel__desc">{t.description}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className="templates-panel__hint">
            Switching templates keeps every field intact — same data,
            different rendering. (Stub variants render the Editorial layout
            for now; distinct renders ship in upcoming releases.)
          </p>
        </div>
      )}
    </aside>
  );
}
