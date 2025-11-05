# Rooting Routine

A web application that combines daily nature walks with Steps 1, 2, and 3 from 12-step recovery. The app uses the Recovery Tree methodology with an "Elder Tree" sponsor voice to guide users through reflective questions during their walk, then generates personalized encouragement with AI-generated nature imagery upon completion.

## Features

- **Supabase Authentication**: Secure user authentication with email/password
- **Protected Routes**: Middleware-based route protection
- **Elder Tree Guide**: AI-powered conversational guide (ready for implementation)
- **Session Tracking**: Database schema ready for walk sessions
- **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Processing**: Anthropic API (Claude Sonnet 4.5) - Ready to integrate
- **Image Generation**: FAL.ai Flux Realism API - Ready to integrate

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Anthropic API key (for AI features)
- FAL.ai API key (for image generation)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:

   Update `.env.local` with your actual keys:
   ```env
   # Get these from your Supabase project settings
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

   # Get from Anthropic console
   ANTHROPIC_API_KEY=your-anthropic-key-here

   # Get from FAL.ai
   FAL_API_KEY=your-fal-key-here

   # App config
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SESSION_TIMEOUT_MINUTES=60
   ```

3. **Set up Supabase database**:

   Run this SQL in your Supabase SQL Editor:
   ```sql
   -- Sessions table
   CREATE TABLE sessions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     completed_at TIMESTAMP WITH TIME ZONE,
     pre_walk_mood TEXT,
     pre_walk_intention TEXT,
     step_responses JSONB,
     final_reflection TEXT,
     generated_image_url TEXT,
     encouragement_message TEXT,
     insights TEXT[],
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

   -- Policy: Users can only see their own sessions
   CREATE POLICY "Users can view own sessions" ON sessions
     FOR SELECT USING (auth.uid() = user_id);

   -- Policy: Users can insert their own sessions
   CREATE POLICY "Users can insert own sessions" ON sessions
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   -- Policy: Users can update their own sessions
   CREATE POLICY "Users can update own sessions" ON sessions
     FOR UPDATE USING (auth.uid() = user_id);
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
rooting-routine/
├── app/
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── auth/callback/      # Auth callback handler
│   ├── dashboard/          # Protected dashboard
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── LogoutButton.tsx    # Logout component
├── lib/
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       ├── server.ts       # Server-side Supabase client
│       └── middleware.ts   # Auth middleware utilities
├── types/
│   └── database.ts         # TypeScript database types
├── middleware.ts           # Next.js middleware for auth
├── .env.local              # Environment variables (git-ignored)
└── .env.local.example      # Example environment variables
```

## Authentication Flow

1. **Sign Up**: Users create an account with email/password
2. **Email Verification**: Supabase sends a confirmation email
3. **Sign In**: Users log in with their credentials
4. **Protected Routes**: Middleware redirects unauthenticated users to login
5. **Dashboard**: Authenticated users access the dashboard

## Next Steps

The authentication foundation is complete. Next features to implement:

1. **Walk Session Flow**:
   - Pre-walk check-in UI
   - Elder Tree conversation interface
   - Step question progression logic

2. **AI Integration**:
   - Implement Anthropic API calls for Elder Tree voice
   - Add conversation flow management
   - Create reflection generation

3. **Image Generation**:
   - Integrate FAL.ai for nature imagery
   - Implement mood-based prompts

4. **Session History**:
   - Display past walks
   - Show reflections and images
   - Progress tracking

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Environment Setup Help

### Getting Supabase Keys

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to Project Settings > API
4. Copy the Project URL and anon/public key

### Getting Anthropic API Key

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Go to API Keys section
4. Generate a new API key

### Getting FAL.ai API Key

1. Visit [fal.ai](https://fal.ai)
2. Sign up and log in
3. Navigate to API settings
4. Generate your API key

## Troubleshooting

### Authentication not working
- Check that your Supabase URL and keys are correct in `.env.local`
- Verify email confirmation settings in Supabase dashboard
- Check browser console for errors

### Database errors
- Ensure you've run the SQL setup script in Supabase
- Verify Row Level Security policies are enabled
- Check that user_id references are correct

### Build errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run lint`

## License

ISC

## Support

For issues or questions, refer to the CLAUDE.md file for development guidelines.
