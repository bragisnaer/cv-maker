import { useState } from 'react';
import { Applications } from './components/Applications';
import { CVDocument } from './components/CVDocument';
import { CoverLetter } from './components/CoverLetter';
import { Footer } from './components/Footer';
import { PageFrame } from './components/PageFrame';
import { SideButton } from './components/SideButton';
import { SidePanelProvider } from './components/SidePanelContext';
import { TemplatesPanel } from './components/TemplatesPanel';
import { Toolbar, type ToolbarView } from './components/Toolbar';
import { TweaksPanel } from './components/TweaksPanel';
import { CVStoreProvider, useCVStore } from './state/useCVStore';

export function App() {
  return (
    <CVStoreProvider>
      <SidePanelProvider>
        <Editor />
      </SidePanelProvider>
    </CVStoreProvider>
  );
}

function Editor() {
  const { cv } = useCVStore();
  const [view, setView] = useState<ToolbarView>('cv');
  const showSidePanels = view !== 'apps';

  return (
    <div className="app">
      <Toolbar view={view} onChangeView={setView} />
      {showSidePanels && (
        <SideButton id="templates" label="Templates" side="left">
          <TemplatesPanel />
        </SideButton>
      )}
      {showSidePanels && (
        <SideButton id="tweaks" label="Tweaks" side="right">
          <TweaksPanel />
        </SideButton>
      )}
      <main className="stage">
        {view === 'cv' && <CVDocument data={cv} />}
        {view === 'cover' && (
          <PageFrame>
            <CoverLetter data={cv} />
          </PageFrame>
        )}
        {view === 'apps' && <Applications />}
      </main>
      <Footer />
    </div>
  );
}
