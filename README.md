# Recovery Tree

A comprehensive recovery support app built with Next.js, featuring AI-guided step work, urge management, nature therapy, and daily reflection. The app uses the Recovery Tree methodology with an "Elder Tree" AI companion voice powered by Claude Sonnet 4.5.

## Features

### Walk Sessions (Step Work)
- Pre-walk check-in with step selection, mood, and intention setting
- Elder Tree AI-guided conversations with context-aware follow-ups (up to 5 exchanges)
- Support for Steps 1, 2, and 3 from 12-step recovery
- Session resumption for incomplete walks
- AI-generated reflections and insights
- Nature imagery on completion (Unsplash API)
- Coin rewards (1 coin per minute)

### Urge Mining (Crisis Support)
- Crisis intervention landing page for high-intensity urges
- Pre-mining intent selection (sleep support vs screen time management)
- Adaptive guidance based on intent
- Flexible timer options (30min, 1hr, 2hr, until morning, or custom 1-480 minutes)
- Real-time countdown with duration target display
- Honest post-mining check-in (didn't act out / acted out / not sure)
- Compassionate, non-judgmental responses
- Morning reveal page with state-aware routing
- Coin rewards (1 coin per minute)

### Walkabout (Nature Therapy)
- Elder Tree grounding guidance
- Location selection (park, water, garden, urban, mountains, outside)
- Body needs assessment (movement, stillness, both, unsure)
- Walk timer with real-time tracking
- Completion page with coin rewards and next action routing

### Daily Inventory
- End-of-day reflection prompts (wins, struggles, gratitude, tomorrow's intention)
- Elder Tree AI reflection on your day
- One-per-day enforcement
- Inventory history with list and detail views

### Dashboard & Navigation
- User profile and total coins display
- Quick access to all features
- Consistent "Back to Dashboard" navigation
- Session history tracking

## Tech Stack

- **Frontend**: React 18.3.1 via Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS 3.4.0
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Image Generation**: Unsplash API
- **Mobile**: Capacitor 7.4.4 (iOS and Android)
- **Testing**: Playwright (2,800+ lines of comprehensive tests)
- **Payment Processing**: Lemon Squeezy (integration ready)
- **Webhooks**: Notion integration via Zapier (6-category smart routing)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Anthropic API key (for Elder Tree AI)
- Unsplash API key (for nature imagery)
- Optional: Lemon Squeezy account (for payment processing)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:

   Copy the example file and update with your keys:
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your actual keys:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   SUPABASE_SERVICE_KEY=your-supabase-service-key-here

   # Anthropic API (for Elder Tree)
   ANTHROPIC_API_KEY=your-anthropic-api-key-here

   # Unsplash (for nature imagery)
   UNSPLASH_ACCESS_KEY=your-unsplash-key-here

   # Lemon Squeezy (optional - for payment processing)
   LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key-here
   LEMONSQUEEZY_STORE_ID=your-store-id-here
   LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret-here
   LEMONSQUEEZY_MONTHLY_VARIANT_ID=your-monthly-variant-id-here
   LEMONSQUEEZY_YEARLY_VARIANT_ID=your-yearly-variant-id-here

   # Notion Webhook Integration (optional - via Zapier)
   NOTION_WEBHOOK_URL=your-zapier-webhook-url-here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SESSION_TIMEOUT_MINUTES=60
   ```

3. **Set up Supabase database**:

   Apply all database migrations from the `supabase/migrations/` directory in order:
   - 001_initial_sessions.sql - Sessions table with RLS
   - 002_coins.sql - User coins tracking
   - 003_mining_fields.sql - Urge mining support
   - 004_conversation_history.sql - Elder Tree conversation history
   - 005_daily_inventory.sql - Daily inventory feature
   - 006_walkabout_fields.sql - Walkabout session support
   - 007_nature_therapy.sql - Nature therapy enhancements

   Or run them all at once in your Supabase SQL Editor. All migrations include Row Level Security policies.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
recovery-tree/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── elder-tree/           # Elder Tree AI endpoints
│   │   ├── inventory/            # Daily inventory endpoints
│   │   ├── mining/               # Urge mining endpoints
│   │   ├── sessions/             # Walk session endpoints
│   │   └── walkabout/            # Walkabout endpoints
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   ├── history/                  # Session history
│   ├── inventory/                # Daily inventory + history
│   ├── login/                    # Login page
│   ├── pricing/                  # Pricing page (Lemon Squeezy)
│   ├── signup/                   # Signup page
│   ├── success/                  # Payment success
│   ├── urge/                     # Urge mining flow
│   │   ├── mining/               # Mining timer
│   │   └── reveal/               # Morning reveal
│   ├── walk/                     # Walk session flow
│   ├── walkabout/                # Walkabout flow
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── inventory/                # Inventory components
│   ├── walk/                     # Walk session components
│   └── walkabout/                # Walkabout components
├── lib/
│   ├── supabase/                 # Supabase clients
│   ├── unsplash.ts               # Unsplash image service
│   └── lemonsqueezy.ts           # Payment processing
├── supabase/
│   └── migrations/               # Database migrations (001-007)
├── tests/                        # Playwright E2E tests
│   ├── urge-support.spec.ts      # Urge mining tests
│   ├── daily-inventory.spec.ts   # Inventory tests
│   ├── dashboard.spec.ts         # Dashboard tests
│   ├── walk-session.spec.ts      # Walk session tests
│   └── helpers/                  # Test utilities
├── capacitor.config.ts           # Mobile app config
├── playwright.config.ts          # Test configuration
├── tailwind.config.ts            # Tailwind CSS config
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables (git-ignored)
└── .env.local.example            # Example environment variables
```

## Authentication Flow

1. **Sign Up**: Users create an account with email/password
2. **Email Verification**: Supabase sends a confirmation email
3. **Sign In**: Users log in with their credentials
4. **Protected Routes**: Middleware redirects unauthenticated users to login
5. **Dashboard**: Authenticated users access the dashboard

## Mobile Deployment

The app is configured to deploy as a native mobile app using Capacitor:

```bash
# Build the web app for mobile
npm run build:mobile

# Sync web build with native platforms
npm run cap:sync

# Open in Xcode (iOS)
npm run cap:ios

# Open in Android Studio (Android)
npm run cap:android
```

**Mobile configuration**: capacitor.config.ts:1
- App ID: `com.recoverytree.app`
- App Name: Recovery Tree
- Web Directory: `out`

## Testing

Comprehensive Playwright test suite with 2,800+ lines of tests:

```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode (watch browser)
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

**Test coverage**:
- Urge support flow (crisis landing, Elder Tree, mining timer, morning reveal)
- Daily inventory feature
- Dashboard and walkabout flows
- Walk session functionality
- Shared test utilities and mocks

## Development Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Start production server
npm run lint                   # Run ESLint

# Testing
npm test                       # Run Playwright tests
npm run test:ui                # Interactive test UI
npm run test:headed            # Watch tests in browser
npm run test:debug             # Debug mode
npm run test:report            # View test results

# Mobile
npm run build:mobile           # Build for mobile deployment
npm run cap:sync               # Sync with native platforms
npm run cap:ios                # Open in Xcode
npm run cap:android            # Open in Android Studio
```

## Environment Setup Help

### Getting Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Project Settings > API
4. Copy the Project URL, anon key, and service role key
5. Apply all migrations from `supabase/migrations/` in your SQL Editor

### Getting Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Go to API Keys section
4. Generate a new API key

### Getting Unsplash API Key

1. Visit [unsplash.com/developers](https://unsplash.com/developers)
2. Create a new application
3. Copy your Access Key

### Getting Lemon Squeezy Keys (Optional)

1. Visit [lemonsqueezy.com](https://lemonsqueezy.com)
2. Create an account and set up your store
3. Go to Settings > API to get your API key
4. Create products and copy their variant IDs

## Troubleshooting

### Authentication not working
- Check that your Supabase URL and keys are correct in `.env.local`
- Verify email confirmation settings in Supabase dashboard
- Ensure all migrations have been applied
- Check browser console for errors

### Database errors
- Ensure you've run all migrations from `supabase/migrations/` (001-007)
- Verify Row Level Security policies are enabled
- Check that `session_type` constraint includes 'walk', 'mining', and 'walkabout'
- Verify coins column exists in auth.users table

### Elder Tree AI not responding
- Verify `ANTHROPIC_API_KEY` is set correctly in `.env.local`
- Check Anthropic API quotas and billing
- Review API route logs in browser dev tools

### Tests failing
- Ensure dev server is running (`npm run dev`)
- Install Playwright browsers: `npx playwright install`
- Check test mocks in `tests/helpers/` match actual API routes
- Clear test state: Delete `.auth` directory

### Mobile build issues
- Ensure Next.js is configured for static export
- Run `npm run build:mobile` before `cap:sync`
- Check Capacitor config in capacitor.config.ts:1

## Architecture Notes

**Elder Tree AI System**:
- Conversation loop supports up to 5 exchanges before offering solutions
- Uses `readyForSolution` flag for intelligent flow control
- Maintains full conversation history for context-aware responses
- Verify-and-clarify approach (asks questions before presuming)

**Session Types**:
- `walk` - Step work sessions with Elder Tree guidance
- `mining` - Urge management timer sessions
- `walkabout` - Nature therapy grounding sessions

**Coin System**:
- 1 coin per minute for all activities
- Stored in `auth.users.coins` column
- Updated on session completion

## Documentation

- **CHANGELOG.md** - Comprehensive change history and migration notes
- **docs/APP_STRUCTURE_FOR_DESIGN.md** - Screen-by-screen breakdown for design team
- **docs/NOTION_WEBHOOK_ROUTING_SYSTEM.md** - Webhook integration documentation
- **docs/archive/** - Archived status documentation
- **supabase/migrations/** - Database schema evolution

## Repository

- **GitHub**: https://github.com/treebird7/Recovery-Tree-New
- **Current Branch**: claude/check-component-stack-011CV3ddQgfNDC54TsZ2Xk7N

## Credits

- Elder Tree voice inspired by Sandy B.
- Recovery methodology based on 12-step principles
- AI conversations powered by Anthropic Claude Sonnet 4.5
- Nature imagery via Unsplash API
- Mobile deployment via Capacitor

## License

ISC

---

Built with Next.js, React, Tailwind CSS, and Claude AI
