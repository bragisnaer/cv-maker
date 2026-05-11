import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { A4_HEIGHT_PX } from '../lib/constants';

interface PageFrameProps {
  children: ReactNode;
}

const PAGE_MARGIN_PX = 36;

/**
 * Wraps an A4 document and:
 *  1. Paginates the main column's top-level blocks across pages —
 *     any block that would cross a page boundary gets a margin-top
 *     push so it starts at the top of the next page with the same
 *     36px margin as page 1. No content overflows the page edges.
 *  2. Snaps total height to a whole multiple of A4 so the visual
 *     matches what the browser prints.
 *  3. Draws Word-style page-break seams between pages.
 *
 * Sidebar content is NOT paginated — it's expected to fit on page 1.
 */
export function PageFrame({ children }: PageFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const skipNextRO = useRef(false);
  const [pages, setPages] = useState(1);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    function paginate() {
      const main = root!.querySelector('.cv-main') as HTMLElement | null;
      if (!main) return;
      const blocks = Array.from(main.children) as HTMLElement[];

      // Reset any previously applied pushes so measurements reflect
      // the natural flow.
      for (const b of blocks) b.style.marginTop = '';

      const accumulated = new Array(blocks.length).fill(0);
      let changed = true;
      let safety = 0;

      while (changed && safety < 20) {
        changed = false;
        safety++;

        const mainRect = main.getBoundingClientRect();
        for (let i = 0; i < blocks.length; i++) {
          const block = blocks[i];
          const rect = block.getBoundingClientRect();
          const topInMain = rect.top - mainRect.top;
          const bottomInMain = rect.bottom - mainRect.top;

          // Which page is this block's top currently on?
          const pageIndex = Math.floor(topInMain / A4_HEIGHT_PX);
          const pageContentBottom =
            (pageIndex + 1) * A4_HEIGHT_PX - PAGE_MARGIN_PX;

          if (bottomInMain > pageContentBottom + 0.5) {
            const nextPageContentTop =
              (pageIndex + 1) * A4_HEIGHT_PX + PAGE_MARGIN_PX;
            const push = nextPageContentTop - topInMain;
            accumulated[i] += push;
            block.style.marginTop = `${accumulated[i]}px`;
            changed = true;
            break;
          }
        }
      }

      const h = root!.scrollHeight || root!.offsetHeight;
      const next = Math.max(1, Math.ceil(h / A4_HEIGHT_PX));
      setPages((prev) => (prev === next ? prev : next));
    }

    skipNextRO.current = true;
    paginate();

    const ro = new ResizeObserver(() => {
      if (skipNextRO.current) {
        skipNextRO.current = false;
        return;
      }
      paginate();
    });
    ro.observe(root);
    return () => ro.disconnect();
  });

  // Re-run pagination whenever children change identity (parent passes
  // new tree). useLayoutEffect above runs every render anyway, so this
  // is mostly defensive — keeps the dep array intentional.
  useEffect(() => {
    skipNextRO.current = true;
  }, [children]);

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
