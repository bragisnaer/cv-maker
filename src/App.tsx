import { CVDocument } from './components/CVDocument';
import { Toolbar } from './components/Toolbar';
import { TweaksPanel } from './components/TweaksPanel';
import { CVStoreProvider, useCVStore } from './state/useCVStore';

export function App() {
  return (
    <CVStoreProvider>
      <Editor />
    </CVStoreProvider>
  );
}

function Editor() {
  const { cv } = useCVStore();
  return (
    <div className="app">
      <Toolbar />
      <main className="stage">
        <CVDocument data={cv} />
      </main>
      <TweaksPanel />
    </div>
  );
}
