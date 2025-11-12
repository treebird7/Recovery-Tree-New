# Changelog

All notable changes to the Rooting Routine project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - November 2025

#### Testing & Quality Assurance
- **Comprehensive Playwright test suite** (2,800+ lines of tests)
  - Urge support flow tests (crisis landing, Elder Tree responses, mining timer, morning reveal)
  - Daily inventory feature tests
  - Dashboard and walkabout flow tests
  - Walk session functionality tests
  - Shared test utilities (fixtures, helpers, mocks)

#### Integration & Automation
- **Notion webhook integration system** via Zapier
  - Smart routing to 6 categories: mission, design-brief, build, design-system, content, bug
  - `NotionWebhookRouter` TypeScript class with type safety
  - Sancho Reporting Protocol helpers: `taskStarted()`, `taskCompleted()`, `taskBlocked()`
  - Batch update support and environment-aware configuration
  - Complete documentation in `NOTION_WEBHOOK_ROUTING_SYSTEM.md`
- **Zapier webhook integration documentation** (287 lines)
  - Category-based routing specifications
  - API specifications with headers and request formats
  - Node.js/TypeScript implementation examples with retry logic
  - Troubleshooting guide

#### Documentation
- **App structure documentation** (`docs/APP_STRUCTURE_FOR_DESIGN.md`, 970 lines)
  - Screen-by-screen breakdown for design team
  - Navigation flow and UI components
  - Active functions and API endpoints
  - Implementation status tracking
  - Design system notes (colors, typography, icons)
  - Elder Tree voice guidelines

#### Features
- Custom timer input for urge mining (1-480 minutes)
- Custom time selector UI with expandable input field
- Walkabout session type support in database
- Database migration 006: Added `location`, `body_need`, and `walkabout_duration_minutes` fields
- Database migration 007: Nature therapy enhancements

### Changed - November 2025

#### Elder Tree Enhancements
- **Conversation loop system** (up to 5 exchanges)
  - Conversation state management with history tracking
  - Full conversation history display with follow-up input
  - Context-aware responses based on conversation history
  - Automatic progression after 5 exchanges or when ready for solution
- **Verify and clarify approach**
  - Elder Tree asks clarifying questions instead of making presumptions
  - Only offers solutions after understanding user needs
  - Response includes `readyForSolution` flag for intelligent flow control

#### Urge Mining Flow Overhaul
- **Pre-mining intent choice**
  - "What do you need help with?" selection before timer
  - Options: "Help going to sleep" vs "Help putting the screen down"
  - Adaptive instructions based on intent:
    - Sleep: "Lie in the dark, Close your eyes, Just breathe"
    - Screen: "Step away from screen, Move to different room, Do something with hands"
  - Button text adapts to intent (Sleep Mining Timer vs Mining Timer)
- **Post-mining honest check-in**
  - Replaced presumptive "You made it through" with honest question
  - Three outcome buttons: "I didn't act out" / "I acted out" / "I'm not sure"
  - Tailored responses for each outcome with compassion and non-judgment
  - Outcome menu (journal, connect with HP, reach out, work a step, dashboard)
- **Mining timer improvements**
  - Shows both duration target and elapsed time
  - Real-time countdown with clear time displays
- Urge mining timer now supports both quick options (30min, 1hr, 2hr, until morning) and custom duration

#### UI Improvements
- Morning reveal flow with state-aware routing buttons
  - "I'm Good - Feeling Stable" (routes to dashboard)
  - "Still Struggling - Need Support" (routes to urge support)
- Orchestrate improvements merged while preserving working urge support state buttons

### Fixed - November 2025
- **Critical bug**: Mining double-call causing incorrect coin awards
- Mining end error: Added JSON body to finish mining request
- Mining finish button now properly collects coins without throwing errors
- Signup page build error: Removed invalid dynamic export
- Elder Tree conversation button logic for test compatibility
- Multiple test selector fixes to match actual component text
- Test mocks for walk-session and daily-inventory
- Urge-support test mock: Correct API route and `readyForSolution` flag
- JSX syntax error in urge page
- Session type constraint now includes 'walkabout' alongside 'walk' and 'mining'

### Removed - November 11, 2025

#### Security
- **CRITICAL**: Removed `cookies.txt` containing authentication tokens from git
- Added `cookies.txt` to `.gitignore`

#### Code Cleanup (~990 lines removed)
- Unused fal-ai image generation service (195 lines) - project uses DALL-E
- Unused `@fal-ai/serverless-client` npm dependency
- Orphaned `SubscriptionManager` component (160 lines) - never imported
- Duplicate `DEPLOYMENT_NOTES.MD` file (kept lowercase `.md` version)
- Temporary `check_tables.sql` debug file
- Example files: `webhook.example.ts`, `test-notion-webhook.ts`
- Nested duplicate in `lemonsqueezy.disabled` folder

#### Documentation Archived (~4,000 lines)
- Moved outdated status docs to `docs/archive/`:
  - `STATUS.md`, `WHATS_LEFT.md`
  - `BRANCH_REGISTRY.md`, `BRANCH_SUMMARY_REPORT.md`
  - Agent coordination docs: `SANCHO_BRIEFING.md`, `WATSON_UPDATE_P1_P2_MERGES.md`
  - `MERGE_PROTOCOL.md`, `MISSION_CONTROL.md`
  - `SANCHO_REPORTING_PROTOCOL_2025-11-09.md`
- Archived coordination system to `docs/coordination-archive/`:
  - Entire `.coordination/` directory (6,000+ lines)
  - Agent definitions, workflow examples, coordination protocols

#### Database
- Fixed migration numbering conflict: Renamed `006_nature_therapy.sql` → `007_nature_therapy.sql`

### Technical Debt
- TODOs identified:
  - `app/api/inventory/today/route.ts:10` - Move logic inside POST handler
  - `app/api/mining/start/route.ts:56` - Store mining state in database for persistence

## [0.1.0] - 2025-11-05

### Added - Initial MVP Release

#### Core Features
- **Walk Sessions (Step Work)**
  - Pre-walk check-in (step selection, mood, intention)
  - Elder Tree AI-guided conversations using Claude Sonnet 4.5
  - Support for Steps 1, 2, and 3 from 12-step recovery
  - Session resumption for incomplete walks
  - Session completion with AI-generated reflection
  - Unsplash nature imagery on completion
  - Coin rewards (1 coin per minute)
  - Walk duration tracking
  - Insights extraction

- **Urge Mining (Sleep Timer)**
  - Urge intensity slider (0-10)
  - Context-aware AI responses based on intensity
  - Crisis intervention for high-intensity urges (8-10)
  - Timer duration selection (30min, 1hr, 2hr, until morning)
  - Real-time countdown display
  - Auto-end when duration reached
  - Manual "Finish Mining" button
  - Morning reveal page with state routing
  - Coin earning (1 coin per minute)

- **Walkabout (Nature Therapy)**
  - Grounding guidance from Elder Tree
  - Location selection (park, water, garden, urban, mountains, outside)
  - Body needs assessment (movement, stillness, both, unsure)
  - Timer during walk
  - Completion page with coin rewards
  - Routing to next actions (journal, step-work, dashboard)

- **Daily Inventory**
  - Daily reflection prompts:
    - What went well
    - Struggles today
    - Gratitude
    - Tomorrow's intention
  - Elder Tree end-of-day reflection
  - One-per-day enforcement
  - Inventory history page with list and detail views

- **Dashboard**
  - User profile display
  - Total coins display
  - Navigation to all features
  - Sign out functionality

- **Navigation**
  - Consistent "Back to Dashboard" buttons on all screens
  - Breadcrumb navigation where appropriate

#### Technical Implementation
- **Frontend:** React 18 via Next.js 15 (App Router)
- **Styling:** Tailwind CSS with responsive design
- **State Management:** React Hooks (useState, useEffect)
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL with Row Level Security
- **Authentication:** Supabase Auth
- **AI:** Anthropic Claude API (Sonnet 4.5)
- **Images:** Unsplash API
- **Mobile:** PWA-ready (Progressive Web App)

#### Database Schema
- Sessions table with support for walk, mining, and walkabout session types
- User coins tracking across all activities
- Daily inventories table
- Row Level Security policies for all tables
- Proper indexing for performance

#### Security
- Row Level Security (RLS) enabled on all tables
- User authentication required for all features
- Protected API routes
- Secure session management

### Known Issues
- Daily Inventory feature requires database migration 005 to be applied
- Walkabout feature requires database migration 006 to be applied

## Migration Notes

### Migration 005: Daily Inventory
```sql
-- Creates daily_inventories table
-- Must be applied for Daily Inventory feature to work
```

### Migration 006: Walkabout Support
```sql
-- Adds 'walkabout' to session_type constraint
-- Adds location, body_need, and walkabout_duration_minutes fields
-- Must be applied for Walkabout feature to work
```

### Migration 007: Nature Therapy Enhancements
```sql
-- Additional nature therapy and session type improvements
-- Includes location and body_need field enhancements
```

## Deployment Notes

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_APP_URL=your-app-url
SESSION_TIMEOUT_MINUTES=60
UNSPLASH_ACCESS_KEY=your-unsplash-key (for nature imagery)
```

### Running Migrations
Apply migrations via Supabase Dashboard SQL Editor or CLI:
```bash
supabase link --project-ref your-project-ref
supabase db push
```

## Repository
- **GitHub:** https://github.com/treebird7/Recovery-Tree-New
- **Branch:** claude/terminal-code-communication-011CUofi1SjbyvpwTxDsWAR9

## Credits
- Elder Tree voice inspired by Sandy B.
- Recovery methodology based on 12-step principles
- AI conversations powered by Anthropic Claude
- Nature imagery via Unsplash

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
