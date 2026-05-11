import type { CSSProperties } from 'react';
import { useCVStore } from '../state/useCVStore';
import { COLOR_SCHEMES } from '../lib/constants';
import { classNames } from '../lib/helpers';

export function TweaksPanel() {
  const { cv, updatePath } = useCVStore();

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
    <>
      <div className="side-panel__section">
        <p className="side-panel__label">Theme</p>
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
      </div>

      <div className="side-panel__section">
        <p className="side-panel__label">Layout</p>
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
      </div>
    </>
  );
}
