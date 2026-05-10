export function Footer() {
  return (
    <footer className="site-footer screen-only">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <strong>cv-maker</strong>
          <span className="site-footer__sep">·</span>
          <span>Free, open-source, MIT.</span>
        </div>
        <p className="site-footer__privacy">
          Your CV stays in your browser. Nothing is uploaded.
        </p>
        <nav className="site-footer__links" aria-label="Footer">
          <a
            href="https://github.com/bragisnaer/cv-maker"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <span className="site-footer__sep">·</span>
          <a href="/legacy.html">v1 editor</a>
        </nav>
      </div>
    </footer>
  );
}
