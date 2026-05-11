import { useRef } from 'react';
import { useCVStore } from '../state/useCVStore';
import { deepMerge, classNames } from '../lib/helpers';
import { SEED_CV } from '../lib/seed';
import type { CVData } from '../types/cv';

export type ToolbarView = 'cv' | 'cover' | 'apps';

interface ToolbarProps {
  view: ToolbarView;
  onChangeView: (v: ToolbarView) => void;
}

export function Toolbar({ view, onChangeView }: ToolbarProps) {
  const {
    cv,
    profileNames,
    active,
    setActive,
    createProfile,
    renameProfile,
    deleteProfile,
    resetProfile,
    setCV,
  } = useCVStore();
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onSaveAs() {
    const name = window.prompt('Name this profile', `${active} copy`);
    if (!name || !name.trim()) return;
    if (profileNames.includes(name)) {
      window.alert('A profile with that name already exists.');
      return;
    }
    createProfile(name.trim(), structuredClone(cv));
  }

  function onAddLanguage() {
    const lang = window.prompt(
      'Language for the new copy (e.g. Dansk, Español)',
      'Dansk',
    );
    if (!lang || !lang.trim()) return;
    const trimmed = lang.trim();
    const baseName = active.replace(/ \([^)]+\)$/, '');
    const candidate = `${baseName} (${trimmed})`;
    let name = candidate;
    let i = 2;
    while (profileNames.includes(name)) {
      name = `${candidate} ${i}`;
      i++;
    }
    const next = structuredClone(cv);
    next.language = trimmed;
    createProfile(name, next);
  }

  function onRename() {
    const name = window.prompt('Rename profile', active);
    if (!name || !name.trim() || name === active) return;
    if (profileNames.includes(name)) {
      window.alert('A profile with that name already exists.');
      return;
    }
    renameProfile(active, name.trim());
  }

  function onDelete() {
    if (profileNames.length <= 1) return;
    if (!window.confirm(`Delete profile "${active}"? This cannot be undone.`)) return;
    deleteProfile(active);
  }

  function onReset() {
    if (!window.confirm(`Reset "${active}" to the sample CV? Edits will be lost.`)) return;
    resetProfile();
  }

  function onExport() {
    const blob = new Blob([JSON.stringify(cv, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = (cv.name || active).replace(/[^a-zA-Z0-9-_]+/g, '-').toLowerCase();
    a.download = `${safe || 'cv'}.cv.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onImportClick() {
    fileRef.current?.click();
  }

  function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = JSON.parse(text) as Partial<CVData>;
        const merged = deepMerge(SEED_CV, parsed);
        setCV(merged);
      } catch {
        window.alert('Could not parse that JSON file.');
      } finally {
        if (fileRef.current) fileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  }

  function onPrint() {
    window.print();
  }

  const tabs: Array<{ id: ToolbarView; label: string }> = [
    { id: 'cv', label: 'CV' },
    { id: 'cover', label: 'Cover' },
    { id: 'apps', label: 'Apps' },
  ];

  return (
    <div className="toolbar" role="toolbar" aria-label="CV editor toolbar">
      <div className="toolbar__tabs" role="tablist" aria-label="Document">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={view === t.id}
            className={classNames(
              'toolbar__tab',
              view === t.id && 'toolbar__tab--active',
            )}
            onClick={() => onChangeView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="toolbar__sep" />

      <div className="toolbar__group">
        <label className="toolbar__label" htmlFor="profile-picker">
          Profile
        </label>
        <select
          id="profile-picker"
          className="toolbar__select"
          value={active}
          onChange={(e) => setActive(e.target.value)}
        >
          {profileNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button className="btn btn--ghost" onClick={onSaveAs}>
          Save as…
        </button>
        <button
          className="btn btn--ghost"
          onClick={onAddLanguage}
          title="Duplicate this CV in another language"
        >
          + Language
        </button>
        <button className="btn btn--ghost" onClick={onRename}>
          Rename
        </button>
        <button
          className="btn btn--ghost"
          onClick={onDelete}
          disabled={profileNames.length <= 1}
        >
          Delete
        </button>
      </div>

      <div className="toolbar__sep" />

      <div className="toolbar__group">
        <button className="btn btn--ghost" onClick={onExport}>
          Export JSON
        </button>
        <button className="btn btn--ghost" onClick={onImportClick}>
          Import JSON
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={onImportFile}
          hidden
        />
        <button className="btn btn--ghost" onClick={onReset}>
          Reset
        </button>
      </div>

      <div className="toolbar__spacer" />

      <button className="btn btn--primary" onClick={onPrint}>
        Print / PDF
      </button>
    </div>
  );
}
