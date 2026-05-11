import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type PanelId = string | null;

interface SidePanelContextValue {
  openId: PanelId;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
}

const SidePanelContext = createContext<SidePanelContextValue | null>(null);

const STORAGE_KEY = 'cv-side-panel-open';

export function SidePanelProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<PanelId>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as PanelId) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openId));
    } catch {
      // ignore
    }
  }, [openId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const open = useCallback((id: string) => setOpenId(id), []);
  const close = useCallback(() => setOpenId(null), []);
  const toggle = useCallback(
    (id: string) => setOpenId((cur) => (cur === id ? null : id)),
    [],
  );

  const value = useMemo(
    () => ({ openId, open, close, toggle }),
    [openId, open, close, toggle],
  );

  return (
    <SidePanelContext.Provider value={value}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const ctx = useContext(SidePanelContext);
  if (!ctx) throw new Error('useSidePanel must be used inside SidePanelProvider');
  return ctx;
}
