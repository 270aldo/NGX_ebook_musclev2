# Repository Guidelines

## Project Structure & Module Organization
- `index.tsx` bootstraps the React 19 app; `App.tsx` wires the shell.  
- `components/` holds feature UI: `NGXUltimateBook.tsx` (core flow), `Overlays.tsx`, `UserDashboard.tsx`, `Visualizations.tsx`.  
- `hooks/` contains custom logic (`useLogosAI`, `useImageGen`, `useAudio`, `useFunnel`).  
- `data/` stores book content and mode config; keep shared shapes in `types.ts`.  
- `dist/` is build output; avoid manual edits. `metadata.json`/`index.html` support AI Studio packaging.

## Build, Test, and Development Commands
- `npm install` — install dependencies.  
- `npm run dev` — start the Vite dev server (default `http://localhost:5173`).  
- `npm run build` — create a production bundle in `dist/`.  
- `npm run preview` — serve the built bundle for smoke testing.

## Coding Style & Naming Conventions
- TypeScript + React function components; prefer hooks over classes.  
- Two-space indentation, single quotes, and semicolons (match existing files).  
- Reuse Tailwind-style utility classes already present in JSX; avoid ad-hoc inline styles.  
- Centralize types in `types.ts`; use discriminated unions for modes/overlays.  
- Optional path alias `@/*` is available via `tsconfig.json`.

## Testing Guidelines
- No automated tests yet. Run manual checks:  
  - `npm run dev`: exercise overlays (dashboard/search/database/settings), chat/image/audio flows, and section scrolling.  
  - `npm run build && npm run preview`: verify the bundled app renders correctly.  
- If adding tests, align with Vite + Vitest/React Testing Library and colocate specs under `components/__tests__/`.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `chore:`); keep scopes concise.  
- Commit small, logical units that describe user-visible impact.  
- PRs should include: summary of changes, testing notes (`dev`/`build`/manual scenarios), linked issue/ticket, and UI evidence (screenshots or short Loom) when layout or animations change.

## Configuration & Security Tips
- Set `GEMINI_API_KEY` in `.env.local`; do not commit `.env*` files or secrets.  
- Document any new external service keys and provide safe defaults where possible.  
- Keep generated assets or large binaries out of version control unless explicitly curated.
