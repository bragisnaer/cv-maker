import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { A4_HEIGHT_PX } from '../lib/constants';

interface PageFrameProps {
  children: ReactNode;
}

/**
 * Wraps an A4 document and snaps its rendered height to a whole
 * multiple of A4. If content overflows page 1 by even one bullet,
 * the page extends to a full second A4 page (empty space at the
 * bottom) so the visual matches what the browser actually prints.
 *
 * Page-break overlays draw a Word-style 28px gap between every
 * pair of pages, hidden in @media print.
 */
export function PageFrame({ children }: PageFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const h = el.scrollHeight || el.offsetHeight;
      const next = Math.max(1, Math.ceil(h / A4_HEIGHT_PX));
      setPages((prev) => (prev === next ? prev : next));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const style = { '--page-count': pages } as CSSProperties &
    Record<string, number>;

  return (
    <div className="page-frame" style={style}>
      <div ref={ref} className="page-frame__measure">
        {children}
      </div>
      <div className="page-frame__breaks" aria-hidden>
        {Array.from({ length: Math.max(0, pages - 1) }, (_, i) => (
          <div
            key={i}
            className="page-break"
            style={{ top: `calc(var(--cv-page-h) * ${i + 1})` }}
          />
        ))}
      </div>
    </div>
  );
}
