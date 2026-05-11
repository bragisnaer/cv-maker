import { useEffect, useRef, type ReactNode } from 'react';
import { classNames } from '../lib/helpers';
import { useSidePanel } from './SidePanelContext';

interface SideButtonProps {
  id: string;
  label: string;
  side: 'left' | 'right';
  children: ReactNode;
}

export function SideButton({ id, label, side, children }: SideButtonProps) {
  const { openId, toggle, close } = useSidePanel();
  const isOpen = openId === id;
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onDocClick(e: MouseEvent) {
      const root = wrapRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) close();
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isOpen, close]);

  return (
    <div
      ref={wrapRef}
      className={classNames(
        'side-mount',
        side === 'left' ? 'side-mount--left' : 'side-mount--right',
      )}
    >
      <button
        type="button"
        className={classNames('side-button', isOpen && 'side-button--open')}
        onClick={() => toggle(id)}
        aria-expanded={isOpen}
        aria-controls={`side-panel-${id}`}
      >
        <span>{label}</span>
        <span className="side-button__chevron" aria-hidden>
          ⌄
        </span>
      </button>
      {isOpen && (
        <div id={`side-panel-${id}`} className="side-panel" role="dialog">
          {children}
        </div>
      )}
    </div>
  );
}
