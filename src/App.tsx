import { useState } from 'react';
import { Applications } from './components/Applications';
import { CVDocument } from './components/CVDocument';
import { CoverLetter } from './components/CoverLetter';
import { Footer } from './components/Footer';
import { PageFrame } from './components/PageFrame';
import { TemplatesPanel } from './components/TemplatesPanel';
import { Toolbar } from './components/Toolbar';
import { TweaksPanel } from './components/TweaksPanel';
import { CVStoreProvider, useCVStore } from './state/useCVStore';
import { classNames } from './lib/helpers';

type View = 'cv' | 'cover' | 'apps';

export function App() {
  return (
    <CVStoreProvider>
      <Editor />
    </CVStoreProvider>
  );
}

function Editor() {
  const { cv } = useCVStore();
  const [view, setView] = useState<View>('cv');

  return (
    <div className="app">
      <Toolbar />
      <ViewTabs view={view} onChange={setView} />
      <main className="stage">
        {view === 'cv' && (
          <PageFrame>
            <CVDocument data={cv} />
          </PageFrame>
        )}
        {view === 'cover' && (
          <PageFrame>
            <CoverLetter data={cv} />
          </PageFrame>
        )}
        {view === 'apps' && <Applications />}
      </main>
      {view !== 'apps' && <TemplatesPanel />}
      {view !== 'apps' && <TweaksPanel />}
      <Footer />
    </div>
  );
}

function ViewTabs({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const tabs: Array<{ id: View; label: string }> = [
    { id: 'cv', label: 'CV' },
    { id: 'cover', label: 'Cover letter' },
    { id: 'apps', label: 'Applications' },
  ];
  return (
    <nav className="view-tabs screen-only" aria-label="Document">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={classNames('view-tab', view === t.id && 'view-tab--active')}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

