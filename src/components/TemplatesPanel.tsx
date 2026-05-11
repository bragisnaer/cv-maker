import type { CSSProperties } from 'react';
import { useCVStore } from '../state/useCVStore';
import { TEMPLATES } from '../templates/registry';
import { classNames } from '../lib/helpers';

export function TemplatesPanel() {
  const { cv, updatePath } = useCVStore();

  return (
    <div className="side-panel__section">
      <p className="side-panel__label">Template</p>
      <ul className="tmpl-grid">
        {TEMPLATES.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              className={classNames(
                'tmpl-card',
                cv.templateId === t.id && 'tmpl-card--active',
              )}
              onClick={() => updatePath(['templateId'], t.id)}
              title={t.description}
            >
              <ThumbPreview
                side={t.defaultTweaks.theme.side}
                ink={t.defaultTweaks.theme.ink}
              />
              <span className="tmpl-card__name">{t.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ThumbPreview({ side, ink }: { side: string; ink: string }) {
  return (
    <div
      className="tmpl-thumb"
      style={{ '--thumb-side': side, '--thumb-ink': ink } as CSSProperties}
      aria-hidden
    >
      <div className="tmpl-thumb__side">
        <div className="tmpl-thumb__avatar" />
        <div className="tmpl-thumb__line tmpl-thumb__line--side" />
        <div className="tmpl-thumb__line tmpl-thumb__line--side" />
        <div className="tmpl-thumb__line tmpl-thumb__line--side tmpl-thumb__line--short" />
      </div>
      <div className="tmpl-thumb__main">
        <div className="tmpl-thumb__line tmpl-thumb__line--main tmpl-thumb__line--bold" />
        <div className="tmpl-thumb__line tmpl-thumb__line--main" />
        <div className="tmpl-thumb__line tmpl-thumb__line--main" />
        <div className="tmpl-thumb__line tmpl-thumb__line--main tmpl-thumb__line--short" />
      </div>
    </div>
  );
}
