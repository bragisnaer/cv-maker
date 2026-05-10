import type { ReactNode } from 'react';

interface PageFrameProps {
  children: ReactNode;
}

/**
 * Wraps an A4 document and overlays Word-style page-break gaps every
 * --cv-page-h. Six gaps cover up to seven pages; the overlay container
 * is overflow-clipped to the document height so gaps below the
 * content don't leak into the workspace.
 */
export function PageFrame({ children }: PageFrameProps) {
  return (
    <div className="page-frame">
      {children}
      <div className="page-frame__breaks" aria-hidden>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="page-break"
            style={{ top: `calc(var(--cv-page-h) * ${i})` }}
          />
        ))}
      </div>
    </div>
  );
}
