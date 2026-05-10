import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { useCVStore } from '../state/useCVStore';
import { TEMPLATES } from '../templates/registry';
import { COLOR_SCHEMES } from '../lib/constants';
import { classNames } from '../lib/helpers';

type SectionId = 'template' | 'theme' | 'layout';

interface OpenState {
  template: boolean;
  theme: boolean;
  layout: boolean;
}

const STORAGE_KEY = 'cv-inspector-sections';

function loadOpen(): OpenState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const v = JSON.parse(raw) as Partial<OpenState>;
      return {
        template: v.template ?? true,
        theme: v.theme ?? true,
        layout: v.layout ?? false,
      };
    }
  } catch {
    // ignore
  }
  return { template: true, theme: true, layout: false };
}

export function Inspector() {
  const { cv, updatePath } = useCVStore();
  const [open, setOpen] = useState<OpenState>(loadOpen);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(open));
    } catch {
      // ignore
    }
  }, [open]);

  const toggle = (id: SectionId) =>
    setOpen((p) => ({ ...p, [id]: !p[id] }));

  const activeScheme = COLOR_SCHEMES.find(
    (s) => s.ink === cv.theme.ink && s.side === cv.theme.side,
  );

  function moveSection(i: number, dir: -1 | 1) {
    const next = cv.sidebar.slice();
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    updatePath(['sidebar'], next);
  }

  function toggleSection(i: number) {
    const next = cv.sidebar.slice();
    next[i] = { ...next[i], visible: !next[i].visible };
    updatePath(['sidebar'], next);
  }

  return (
    <aside className="inspector screen-only" aria-label="Editor inspector">
      <div className="inspector__inner">
        <Section
          id="template"
          label="Template"
          open={open.template}
          onToggle={toggle}
        >
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
        </Section>

        <Section
          id="theme"
          label="Theme"
          open={open.theme}
          onToggle={toggle}
        >
          <div className="theme-swatches">
            {COLOR_SCHEMES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={classNames(
                  'theme-swatch',
                  activeScheme?.id === s.id && 'theme-swatch--active',
                )}
                style={
                  {
                    '--swatch-ink': s.ink,
                    '--swatch-side': s.side,
                  } as CSSProperties
                }
                onClick={() => updatePath(['theme'], { ink: s.ink, side: s.side })}
                aria-label={s.name}
                title={s.name}
              />
            ))}
          </div>
        </Section>

        <Section
          id="layout"
          label="Layout"
          open={open.layout}
          onToggle={toggle}
        >
          <ul className="layout-list">
            {cv.sidebar.map((s, i) => (
              <li key={s.id} className="layout-row">
                <label className="layout-row__check">
                  <input
                    type="checkbox"
                    checked={s.visible}
                    onChange={() => toggleSection(i)}
                  />
                  <span>{s.title}</span>
                </label>
                <div className="layout-row__reorder">
                  <button
                    type="button"
                    onClick={() => moveSection(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(i, 1)}
                    disabled={i === cv.sidebar.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </aside>
  );
}

interface SectionProps {
  id: SectionId;
  label: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}

function Section({ id, label, open, onToggle, children }: SectionProps) {
  return (
    <section className={classNames('inspector__section', open && 'inspector__section--open')}>
      <button
        type="button"
        className="inspector__header"
        onClick={() => onToggle(id)}
        aria-expanded={open}
      >
        <span className="inspector__label">{label}</span>
        <span className="inspector__chevron" aria-hidden>
          ⌃
        </span>
      </button>
      {open && <div className="inspector__body">{children}</div>}
    </section>
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
