# Database Setup Instructions

## Current Status

The application is running but the **Daily Inventory** feature is not working because the `daily_inventories` table hasn't been created in your Supabase database yet.

## Error

When you try to access `/inventory`, you see this error in the logs:
```
Error getting todays inventory: {
  code: 'PGRST205',
  message: "Could not find the table 'public.daily_inventories' in the schema cache"
}
```

## Solution: Apply Migration

You need to apply the migration file `supabase/migrations/005_daily_inventory.sql` to your Supabase database.

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://supabase.com/dashboard/project/iopbbsjdphgctfbqljcf
2. Click on **SQL Editor** in the left sidebar
3. Open the file `supabase/migrations/005_daily_inventory.sql` from your local project
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

First, link your local project to Supabase:

```bash
# Link to your Supabase project
supabase link --project-ref iopbbsjdphgctfbqljcf

# Apply all pending migrations
supabase db push
```

You'll need to authenticate with Supabase CLI first if you haven't already.

## Migration File Content

The migration creates the `daily_inventories` table with the following structure:

```sql
-- Daily Inventory Table
-- Stores user's daily check-in reflections
CREATE TABLE public.daily_inventories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  what_went_well TEXT NOT NULL,
  struggles_today TEXT NOT NULL,
  gratitude TEXT NOT NULL,
  tomorrow_intention TEXT NOT NULL,
  additional_notes TEXT,
  elder_reflection TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);
```

## Verification

After applying the migration:

1. Restart your dev server (or it will auto-restart)
2. Log in to the app
3. Click on "Daily Inventory" from the dashboard
4. You should be able to complete an inventory without errors

## Other Database Tables

All other tables should already be created:
- ✅ `sessions` (walk sessions)
- ✅ `subscriptions` (coin economy)
- ✅ Mining fields added to sessions table
- ❌ `daily_inventories` (needs migration above)

## Need Help?

If you run into issues, check:
- Your Supabase project is active
- You have the correct project ref: `iopbbsjdphgctfbqljcf`
- Row Level Security policies are configured (included in migration)
