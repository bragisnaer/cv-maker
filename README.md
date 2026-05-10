# cv-maker

Free, open-source CV builder. Edit a clean A4 CV in your browser, switch
templates, export to PDF. Your data stays on your device.

**Live:** [cv-maker-henna.vercel.app](https://cv-maker-henna.vercel.app)

## Features

- A4 CV editor with inline editing on every field
- Multiple profiles (separate CVs per role, language, or target audience)
- Theme-tinted sidebar with seven colour schemes
- Headshot editor — upload, drag, zoom, six shapes, alignment
- Cover letter on its own A4 page with a theme-matched accent
- Applications tracker — company, role, status, dates, notes
- Six templates with live switching; same data, different rendering
- Per-CV language label and one-click translated profile copies
- JSON export and import for backup or transfer between devices
- Print to PDF via the browser print dialog (CSS `@page A4`)
- Word-style page-break visualisation in the editor

## Run locally

Requires Node 20 or later.

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```

## Privacy

All CV data lives in your browser's `localStorage` and `IndexedDB`.
Nothing is uploaded to a server. Export to JSON to back up or move
between devices.

## Project structure

```
src/
  types/        domain shapes (CVData, Application, Template)
  lib/          storage, helpers, constants, seed CV
  state/        Context + useReducer store; auto-persists to localStorage
  components/   editor surfaces (CVDocument, CoverLetter, Applications,
                Toolbar, TweaksPanel, TemplatesPanel, Headshot,
                EditableText, EditChrome, PageFrame, Footer)
  templates/    template registry
```

## License

[MIT](./LICENSE) — fork, modify, self-host, do whatever. Just keep the
copyright notice.
