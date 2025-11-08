# Changelog

All notable changes to the Rooting Routine project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Custom timer input for urge mining (1-480 minutes)
- Walkabout session type support in database
- Database migration 006: Added `location`, `body_need`, and `walkabout_duration_minutes` fields
- Custom time selector UI with expandable input field

### Fixed
- Mining end error: Added JSON body to finish mining request
- Mining finish button now properly collects coins without throwing errors
- Session type constraint now includes 'walkabout' alongside 'walk' and 'mining'

### Changed
- Urge mining timer now supports both quick options (30min, 1hr, 2hr, until morning) and custom duration

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

## Deployment Notes

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=your-anthropic-key
FAL_API_KEY=your-fal-key (for future use)
NEXT_PUBLIC_APP_URL=your-app-url
SESSION_TIMEOUT_MINUTES=60
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
