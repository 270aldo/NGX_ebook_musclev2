# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NGX Ultimate Book is an interactive educational e-book about muscle biology and health, featuring AI-powered interactions via Google's Gemini API. Built with React 19, TypeScript, and Vite, it runs on AI Studio.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start dev server on port 3000
npm run build     # Build for production
npm run preview   # Preview production build
```

## Environment Variables

Create `.env.local` with:
- `GEMINI_API_KEY` - Google Gemini API key (required for AI features)
- `VITE_N8N_WEBHOOK_URL` - Optional n8n webhook for funnel analytics

## Architecture

### Core Structure

```
/
├── App.tsx                 # Root component, renders NGXUltimateBook
├── index.tsx               # React 19 entry point
├── types.ts                # Shared TypeScript interfaces
├── components/
│   ├── NGXUltimateBook.tsx # Main layout: sidebar, content, chat panel
│   ├── Visualizations.tsx  # Canvas-based animations (AbstractNetwork, ParticleFlow, SimulationWidget)
│   ├── Overlays.tsx        # Modal overlays (Search, Database, Settings)
│   └── UserDashboard.tsx   # User progress dashboard
├── hooks/
│   ├── useLogosAI.ts       # Chat with Gemini (text generation)
│   ├── useImageGen.ts      # Image generation via Gemini
│   ├── useAudio.ts         # TTS via Gemini (gemini-2.5-flash-preview-tts)
│   └── useFunnel.ts        # Analytics webhook to n8n
└── data/
    ├── content.ts          # Book sections and knowledge base
    └── modes.ts            # AI agent mode configurations (chat/visual/mentor/research/coach)
```

### Key Patterns

**AI Integration**: All Gemini API calls use `@google/genai` SDK. Each hook initializes its own `GoogleGenAI` instance with `import.meta.env.VITE_GEMINI_API_KEY`.

**Mode System**: The app has 5 AI modes defined in `data/modes.ts`:
- `chat` - General assistant (Logos AI)
- `visual` - Image generation
- `mentor` - Simplified explanations
- `research` - Scientific/clinical tone
- `coach` - Action-oriented fitness advice

Each mode has its own system prompt prefix in `MODE_CONFIG`.

**Content Model**: Book content in `data/content.ts` uses `textParts` with types: `text`, `keyword` (clickable), `insight` (saveable quote). Keywords link to `agentKnowledgeBase` entries.

**Canvas Visualizations**: `Visualizations.tsx` contains three animated canvas components using `useRef` + `requestAnimationFrame` pattern with mouse interactivity.

### State Flow

1. `NGXUltimateBook` manages: active section, overlay state, saved insights, active mode
2. Hooks encapsulate API calls and return loading states + handlers
3. Chat history lives in `useLogosAI`, images added via callback to `addMessage`

## Tech Stack

- React 19.2.0
- TypeScript 5.8
- Vite 6.2
- Tailwind CSS (via inline classes)
- lucide-react for icons
- @google/genai for Gemini API

## Path Alias

`@/*` maps to project root (configured in tsconfig.json and vite.config.ts)
