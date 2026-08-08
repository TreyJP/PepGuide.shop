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

Copy `.env.example` to `.env.local` and fill in Firebase, OpenAI, and Stripe values as needed.

## Firebase setup

1. Create a Firebase project
2. Enable Email/Password auth
3. Add web app config to `.env.local`
4. Deploy `firestore/firestore.rules`
5. Add Firebase Admin service-account vars (`FIREBASE_ADMIN_*`) for checkout + Pro unlock
6. Set `NEXT_PUBLIC_USE_MOCK_SERVICES=false`

## Stripe — PepGuide Pro ($20/mo)

Checkout, confirm, webhook, and Customer Portal routes are already wired:

| Route | Purpose |
|-------|---------|
| `POST /api/billing/checkout` | Start Stripe Checkout subscription |
| `POST /api/billing/confirm` | Activate Pro after return from Checkout |
| `POST /api/billing/webhook` | Keep Pro in sync on renew / cancel |
| `POST /api/billing/portal` | Stripe Customer Portal (manage / cancel) |

### Setup checklist

1. In Stripe, copy your **Secret key** → `STRIPE_SECRET_KEY`
2. (Optional) Create a **$20/month** Price → `STRIPE_PRICE_ID` (otherwise checkout uses an inline $20 price)
3. Set `NEXT_PUBLIC_APP_URL` to your site origin (`http://localhost:3000` locally)
4. Add a webhook endpoint to `/api/billing/webhook` for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`
   - Local: `stripe listen --forward-to localhost:3000/api/billing/webhook`
6. Enable the **Customer portal** in Stripe (cancel + payment method)
7. Ensure Firebase Admin vars are set so paid sessions can write `subscriptionTier: pro`

### Pro explainer video

When a free user opens a locked Pro feature, the subscribe modal includes a video slot.

Set one of:

```bash
NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_URL=https://www.youtube.com/watch?v=VIDEO_ID
# or Vimeo, or a file under /public:
NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_URL=/pro/explainer.mp4
NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_POSTER=/pro/explainer-poster.jpg
```

Until the URL is set, the slot shows a branded placeholder.

## Safety architecture

All production AI requests go through Firebase callable functions / server routes:

1. Verify auth + App Check
2. Validate input and rate limits
3. Classify message
4. Apply safety policy
5. Call OpenAI
6. Validate output
7. Persist response / safety events

The web client never receives OpenAI API keys.

## Notes

- Free tier: Chat, Questions & Discussion, Library, Cycle, Calculator
- PepGuide Pro ($20/mo via Stripe): Education & Research, Protocols
- Firebase Auth handles sessions when configured

