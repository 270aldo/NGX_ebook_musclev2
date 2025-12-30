# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGX Ultimate Book is an interactive educational e-book about muscle biology and health, featuring:
- AI-powered chat, image generation, and text-to-speech via Google Gemini API
- Interactive 3D visualizations with Three.js/React Three Fiber
- Onboarding flow and email-gated premium features
- Persistent state management with localStorage

Built with React 19, TypeScript, and Vite. Designed for AI Studio deployment.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server (default: http://localhost:5173)
npm run build     # Build for production
npm run preview   # Preview production build
```

## Environment Variables

Create `.env.local` with:
- `VITE_GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `VITE_N8N_WEBHOOK_URL` - Optional n8n webhook for funnel analytics

## Architecture

### Core Structure

```
/
├── App.tsx                     # Root component, renders NGXUltimateBook
├── index.tsx                   # React 19 entry point
├── types.ts                    # Shared TypeScript interfaces
├── components/
│   ├── NGXUltimateBook.tsx     # Main orchestrator: sidebar, content, chat panel
│   ├── Model3DViewer.tsx       # Three.js 3D models (muscle, myokine, cell) with hotspots
│   ├── PostProcessingEffects.tsx # Bloom, vignette effects for 3D viewer
│   ├── Visualizations.tsx      # 2D Canvas animations (AbstractNetwork, ParticleFlow, SimulationWidget)
│   ├── Overlays.tsx            # Modal overlays (Search, Database, Settings)
│   ├── UserDashboard.tsx       # User progress dashboard
│   ├── OnboardingModal.tsx     # First-visit onboarding flow (3 steps)
│   ├── EmailGateModal.tsx      # Email capture for Coach mode unlock
│   └── ApiKeyBanner.tsx        # Warning banner when API key missing
├── hooks/
│   ├── useGeminiChat.ts        # Chat with Gemini (text generation)
│   ├── useGeminiImage.ts       # Image generation via Gemini
│   ├── useGeminiTTS.ts         # TTS via Gemini (gemini-2.5-flash-preview-tts)
│   ├── usePersistence.ts       # localStorage-backed useState hook
│   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   └── useFunnel.ts            # Analytics webhook to n8n
└── data/
    ├── content.ts              # Book sections and knowledge base
    └── modes.ts                # AI agent mode configurations
```

### Key Patterns

**AI Integration**: All Gemini API calls use `@google/genai` SDK. The main component (`NGXUltimateBook.tsx`) initializes a `GoogleGenAI` instance with `import.meta.env.VITE_GEMINI_API_KEY`.

**Mode System**: The app has 5 AI modes defined in `data/modes.ts`:
| Mode | Purpose | Icon | Color |
|------|---------|------|-------|
| `chat` | General assistant (Logos AI) | Brain | Blue |
| `visual` | Image generation with presets | Palette | Purple |
| `mentor` | Simplified explanations for beginners | GraduationCap | Amber |
| `research` | Scientific/clinical responses | Microscope | Cyan |
| `coach` | Action-oriented fitness advice (email-gated) | Trophy | Emerald |

Each mode has its own `systemPromptPrefix` in `MODE_CONFIG`.

**3D Visualization System** (`Model3DViewer.tsx`):
- Three procedural models: `MuscleFiberModel`, `MyokineModel`, `CellModel`
- Hotspot system with `HotspotMarker` components for interactive annotations
- Uses `@react-three/fiber` for React integration, `@react-three/drei` for helpers
- Post-processing via `@react-three/postprocessing` (bloom, vignette)
- 2D/3D toggle allows fallback to canvas-based visualizations

**Persistence Hook** (`usePersistence.ts`):
- Drop-in replacement for `useState` with localStorage backup
- Used for: `activeSectionId`, `savedInsights`, `activeMode`, `chatHistory`, onboarding state
- Keys prefixed with `ngx_` (e.g., `ngx_chat_history`)

**Content Model**: Book content in `data/content.ts` uses `textParts` array with types:
- `text` - Regular paragraph text
- `keyword` - Clickable term linked to `agentKnowledgeBase`
- `insight` - Saveable quote with bookmark action

**Onboarding & Lead Capture**:
- `OnboardingModal`: 3-step introduction shown on first visit
- `EmailGateModal`: Captures email before unlocking Coach mode
- State tracked via `usePersistence` (`ngx_onboarding_seen`, `ngx_email_verified`)

### State Flow

1. `NGXUltimateBook` manages all primary state via `usePersistence`:
   - `activeSectionId`, `activeMode`, `chatHistory`, `savedInsights`
   - Overlay state (`dashboard` | `search` | `database` | `settings` | `none`)
   - Onboarding/email gate visibility
2. AI features (chat, image, TTS) are handled inline in `NGXUltimateBook`
3. Modular hooks exist but may not be wired up (`useGeminiChat`, etc.)
4. Funnel analytics sent via `useFunnel.triggerWebhook()`

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open search overlay |
| `Cmd/Ctrl + /` | Focus chat input |
| `Cmd/Ctrl + 1-5` | Switch AI mode |
| `Escape` | Close any overlay |

## Tech Stack

- **React** 19.2.0
- **TypeScript** 5.8
- **Vite** 6.2
- **Tailwind CSS** (via inline classes)
- **Three.js** 0.181 + React Three Fiber 9.x
- **@react-three/drei** - 3D helpers (OrbitControls, Float, MeshDistortMaterial)
- **@react-three/postprocessing** - Visual effects
- **lucide-react** - Icons
- **@google/genai** - Gemini API SDK

## Path Alias

`@/*` maps to project root (configured in `tsconfig.json` and `vite.config.ts`).

## Code Style

- TypeScript + React function components; prefer hooks over classes
- Two-space indentation, single quotes, semicolons
- Reuse Tailwind utility classes; avoid custom CSS
- Centralize types in `types.ts`; use discriminated unions for variants
- Spanish language in UI text (user-facing), English in code comments

## Testing

No automated tests currently. Manual verification:
1. `npm run dev` - Test overlays, chat/image/audio, 3D viewer hotspots, onboarding flow
2. `npm run build && npm run preview` - Verify production build

If adding tests, use Vitest + React Testing Library; place specs in `components/__tests__/`.

## Common Tasks

### Adding a new AI mode
1. Add mode config to `data/modes.ts` with `id`, `label`, `icon`, `color`, `hex`, `placeholder`, `systemPromptPrefix`
2. Add keyboard shortcut in `NGXUltimateBook.tsx` `modeKeys` object
3. Optionally add quick-switch button in the input area

### Adding a new book section
1. Add section object to `bookContent` array in `data/content.ts`
2. Define `textParts` with appropriate types
3. If adding keywords, add entries to `agentKnowledgeBase`

### Adding 3D hotspots
1. Add hotspot objects to `MUSCLE_HOTSPOTS`, `MYOKINE_HOTSPOTS`, or `CELL_HOTSPOTS` in `Model3DViewer.tsx`
2. Position is `[x, y, z]` relative to model center

## Security Notes

- Never commit `.env*` files or API keys
- `VITE_GEMINI_API_KEY` is exposed client-side (standard for Vite apps)
- Email captured via `EmailGateModal` is sent to n8n webhook only
