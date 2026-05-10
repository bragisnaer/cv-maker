# cv-maker

Free, open-source CV builder. Edit a clean A4 CV in your browser, switch templates, export to PDF. Your data stays on your device.

## Status

Pre-release. v2 is being built on Vite + React + TypeScript. The original
single-file v1 is preserved at `public/legacy.html` and is reachable in the
deployed app at `/legacy.html`.

## Run locally

Requires Node 20 or later.

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`. The legacy v1 editor is
available at `http://localhost:5173/legacy.html`.

## Build

```bash
npm run build
npm run preview
```

## Roadmap

- Vite + React + TypeScript build
- Multiple templates with live switching
- Per-template tweaks (color, density, layout)
- Multi-language CVs (one document, language-tagged)
- Optional applications tracker tab
- Public deploy on Vercel

## Privacy

All CV data lives in your browser's `localStorage`. Nothing is sent to a server. Export/import via JSON for backup or transfer between devices.

## License

[MIT](./LICENSE) — fork, modify, self-host, do whatever. Just keep the copyright notice.
