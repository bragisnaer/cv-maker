export function App() {
  return (
    <main className="splash">
      <div className="splash__inner">
        <p className="splash__eyebrow">cv-maker · v2 in progress</p>
        <h1 className="splash__title">A clean CV, built in your browser.</h1>
        <p className="splash__lead">
          Free, open-source, and private by default. Your data never leaves your device.
        </p>
        <p className="splash__note">
          The new editor is being rebuilt. The original tool is still available below
          and works exactly as before.
        </p>
        <div className="splash__actions">
          <a className="btn btn--primary" href="/legacy.html">
            Open the v1 editor
          </a>
          <a
            className="btn btn--ghost"
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        </div>
      </div>
    </main>
  );
}
