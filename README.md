# cv-maker

Free, open-source CV builder. Edit a clean A4 CV in your browser, switch
templates, export to PDF. Your data stays on your device.

**Live:** [cv-maker-henna.vercel.app](https://cv-maker-henna.vercel.app)
**Legacy v1 editor:** [cv-maker-henna.vercel.app/legacy.html](https://cv-maker-henna.vercel.app/legacy.html)

## What's there now

- A4 CV editor with inline editing on every field
- Multiple profiles (separate CVs per role / language / target audience)
- Theme-tinted sidebar with seven colour schemes
- Headshot editor (upload, drag, zoom, six shapes, alignment)
- Cover letter on its own A4 page
- Applications tracker (company, role, status, dates, notes)
- JSON export and import; sample CV migrates from v1 automatically
- Print to PDF via the browser print dialog (CSS `@page A4`)
- Six template slots in the picker (only Editorial renders for now;
  switching templates keeps every field intact)
- Per-CV language label with twelve common languages plus custom

## What's coming

- Distinct rendering for each of the six templates
- Mobile editor experience (currently desktop-first)
- Optional cross-device sync (account-based, opt-in)
- AI bullet rewrite

## Run locally

Requires Node 20 or later.

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5173`
Legacy v1 editor: `http://localhost:5173/legacy.html`

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
  lib/          storage, helpers, constants, fictional seed
  state/        Context + useReducer store; auto-persists to localStorage
  components/   editor surfaces (CVDocument, CoverLetter, Applications,
                Toolbar, TweaksPanel, Headshot, EditableText, EditChrome)
  templates/    template registry (renderers come next)
public/
  legacy.html   the v1 single-file editor, untouched
```

## License

[MIT](./LICENSE) — fork, modify, self-host, do whatever. Just keep the
copyright notice.
