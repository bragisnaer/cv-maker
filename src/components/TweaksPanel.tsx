import { useState } from 'react';
import { useCVStore } from '../state/useCVStore';
import { COLOR_SCHEMES } from '../lib/constants';
import { classNames } from '../lib/helpers';

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
