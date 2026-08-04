# PepGuide Web

PepGuide is an AI-powered peptide research and education platform for adults.

It helps users explore peptides relevant to a stated research topic, understand proposed mechanisms, compare available evidence, review known risks, and organize research findings.

**For educational and research purposes only. PepGuide does not sell or prescribe peptides.**

## Stack

- Next.js 15 (App Router, `src/app/`)
- TypeScript
- Tailwind CSS v4
- Zustand
- React Hook Form + Zod
- next-themes
- Mock services (Firebase-ready architecture)

## Project structure

```text
src/app/                 Next.js App Router pages
  (app)/                 Authenticated workspace (chat, library, compare, saved, settings)
  onboarding/            Multi-step onboarding flow
  sign-in/ sign-up/      Auth pages
src/components/          UI, chat, layout, auth
src/services/            Auth, Firestore, AI (mock until Cloud Functions)
src/stores/              Zustand stores (auth, chat, comparison)

src/schemas/             Zod validation schemas
src/constants/           Brand, chat, onboarding constants
functions/               Firebase Cloud Functions (AI + safety) — optional for web mock mode
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Mock services are enabled by default when Firebase is not configured, so you can explore the full product flow without credentials.

### Try the app quickly

1. Open the landing page at `/`
2. Click **Start researching** and create an account (mock auth accepts any valid form)
3. Complete onboarding (interests, experience, preferences, responsible-use)
4. Ask PepGuide AI a research question in `/chat`
5. Browse **Library**, **Compare**, **Saved**, and **Settings**

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run typecheck  # TypeScript check
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/sign-in`, `/sign-up` | Authentication |
| `/chat` | AI research workspace |
| `/library` | Searchable peptide library |
| `/compare` | Side-by-side compound comparison |
| `/saved` | Saved research folders |
| `/settings` | Profile, theme, privacy, sign out |


## Environment variables

Copy `.env.example` to `.env.local` when connecting real Firebase services:

```bash
NEXT_PUBLIC_USE_MOCK_SERVICES=true
# Firebase config (optional in mock mode)
```

## Firebase setup (optional)

When moving beyond mock mode:

1. Create a Firebase project
2. Enable Email/Password auth
3. Add web app config to `.env.local`
4. Deploy `firestore/firestore.rules`
5. Deploy Cloud Functions from `/functions`
6. Set `NEXT_PUBLIC_USE_MOCK_SERVICES=false`

## Safety architecture

All production AI requests go through Firebase callable functions:

1. Verify auth + App Check
2. Validate input and rate limits
3. Classify message
4. Apply safety policy
5. Call OpenAI
6. Validate output
7. Persist response / safety events

The web client never receives OpenAI API keys.

## Notes

- PepGuide is completely free — no Stripe, no paid tiers, no paywalls
- Firebase Auth handles sessions when configured
- Temporary chats are session-scoped in the mock layer

