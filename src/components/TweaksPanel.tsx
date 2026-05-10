import { useState } from 'react';
import { useCVStore } from '../state/useCVStore';
import { COLOR_SCHEMES } from '../lib/constants';
import { classNames } from '../lib/helpers';
import { TEMPLATES } from '../templates/registry';

const COMMON_LANGUAGES = [
  'English',
  'Dansk',
  'Deutsch',
  'Español',
  'Français',
  'Italiano',
  'Nederlands',
  'Norsk',
  'Polski',
  'Português',
  'Svenska',
  'Íslenska',
];

export function TweaksPanel() {
  const { cv, updatePath } = useCVStore();
  const [open, setOpen] = useState(false);

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

  const knownLanguage = COMMON_LANGUAGES.includes(cv.language);

  return (
    <aside
      className={classNames('tweaks', open && 'tweaks--open')}
      aria-label="Tweaks panel"
    >
      <button
        type="button"
        className="tweaks__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Hide tweaks' : 'Tweaks'}
      </button>

      {open && (
        <div className="tweaks__body">
          <section className="tweaks__group">
            <h3 className="tweaks__title">Template</h3>
            <ul className="tweaks__templates">
              {TEMPLATES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={classNames(
                      'tweaks__template',
                      cv.templateId === t.id && 'tweaks__template--active',
                    )}
                    onClick={() => updatePath(['templateId'], t.id)}
                    title={t.description}
                  >
                    <span className="tweaks__template-name">{t.name}</span>
                    <span className="tweaks__template-desc">{t.description}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="tweaks__hint">
              Switching templates keeps every field intact — same data,
              different rendering.
            </p>
          </section>

          <section className="tweaks__group">
            <h3 className="tweaks__title">Language</h3>
            <select
              className="tweaks__select"
              value={knownLanguage ? cv.language : '__custom'}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom') return;
                updatePath(['language'], v);
              }}
            >
              {COMMON_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
              {!knownLanguage && (
                <option value="__custom">{cv.language || '(custom)'}</option>
              )}
            </select>
            <input
              className="tweaks__input"
              type="text"
              value={cv.language}
              onChange={(e) => updatePath(['language'], e.target.value)}
              placeholder="Or type a custom language"
            />
            <p className="tweaks__hint">
              The language label travels with this profile. Use the toolbar's
              Save as… to keep multiple language versions of the same CV.
            </p>
          </section>

          <section className="tweaks__group">
            <h3 className="tweaks__title">Colour scheme</h3>
            <div className="tweaks__swatches">
              {COLOR_SCHEMES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={classNames(
                    'swatch',
                    activeScheme?.id === s.id && 'swatch--active',
                  )}
                  style={{
                    background: `linear-gradient(180deg, ${s.ink} 0 50%, ${s.side} 50% 100%)`,
                  }}
                  onClick={() => updatePath(['theme'], { ink: s.ink, side: s.side })}
                  aria-label={s.name}
                  title={s.name}
                />
              ))}
            </div>
          </section>

          <section className="tweaks__group">
            <h3 className="tweaks__title">Sidebar sections</h3>
            <ul className="tweaks__sections">
              {cv.sidebar.map((s, i) => (
                <li key={s.id} className="tweaks__section">
                  <label className="tweaks__check">
                    <input
                      type="checkbox"
                      checked={s.visible}
                      onChange={() => toggleSection(i)}
                    />
                    <span>{s.title}</span>
                  </label>
                  <div className="tweaks__reorder">
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
          </section>
        </div>
      )}
    </aside>
  );
}
