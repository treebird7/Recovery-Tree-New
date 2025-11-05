# Next Steps Plan - Rooting Routine
**Date**: November 4, 2025
**Priority Tasks**: Image Generation Fix, User Profile API, Daily Inventory Integration

---

## 1. Fix FAL.ai Image Generation (or Replace)

### Current Issue
- FAL.ai returns no images in API response
- Error: "Failed to generate image: No image generated from FAL.ai"
- Session completion still works (graceful degradation)
- **Location**: `lib/services/fal-ai.ts`

### Investigation Steps

**Step 1: Debug Current FAL.ai Implementation**
```bash
# Check current FAL.ai response format
# Add detailed logging to see actual API response
```

**Files to check**:
- `lib/services/fal-ai.ts:88-95` - Image generation call
- Look at FAL.ai API response structure
- Verify API key is valid
- Check if FAL.ai endpoint/model name changed

### Option A: Fix FAL.ai (if API is working)

**Likely Issues**:
1. **Response format changed**
   - FAL.ai might have updated their response structure
   - We're looking for `result.images[0].url`
   - May need to check different path

2. **Model endpoint changed**
   - Using `fal-ai/flux-realism`
   - May need to update to new model name

3. **API key or subscription issue**
   - Verify API key is active
   - Check usage limits

**Fix Steps**:
```typescript
// Add detailed logging in lib/services/fal-ai.ts
console.log('FAL.ai full response:', JSON.stringify(result, null, 2));

// Check response structure
if (result.images && result.images.length > 0) {
  return result.images[0].url;
} else if (result.image) {
  return result.image.url;
} else if (result.data?.images) {
  return result.data.images[0].url;
}
```

### Option B: Replace with Alternative Service (RECOMMENDED)

**Why replace?**:
- Current FAL.ai integration is fragile
- Image generation is "nice to have," not critical
- Can defer to v2 with more robust solution

**Alternative 1: DALL-E 3 (OpenAI)** ⭐ RECOMMENDED
- **Pros**:
  - Reliable API
  - High-quality nature images
  - Good documentation
  - Simpler integration
- **Cons**:
  - Costs more per image (~$0.04-0.08)
  - Requires OpenAI API key
- **Effort**: ~1 hour

**Implementation**:
```typescript
// lib/services/openai-images.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateNatureImage(prompt: string) {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Nature photography: ${prompt}. Photorealistic, serene, no people, no text.`,
      size: "1792x1024",
      quality: "standard",
      n: 1,
    });

    return {
      imageUrl: response.data[0].url,
      error: null,
    };
  } catch (error) {
    return {
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

**Alternative 2: Curated Unsplash Collection** ⭐ FREE + FAST
- **Pros**:
  - FREE (no API costs)
  - Instant (no generation time)
  - Beautiful nature photography
  - Never fails
  - Can still feel personalized via mood-based selection
- **Cons**:
  - Not AI-generated
  - Limited customization
  - Same images over time
- **Effort**: ~30 minutes

**Implementation**:
```typescript
// lib/services/unsplash-images.ts
const NATURE_IMAGES = {
  hopeful: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', // Mountain sunrise
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', // Forest light
  ],
  peaceful: [
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000', // Lake reflection
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e', // Quiet forest
  ],
  struggling: [
    'https://images.unsplash.com/photo-1518173835740-f5d6a8a4f2d1', // Misty path
    'https://images.unsplash.com/photo-1511497584788-876760111969', // Dense woods
  ],
  breakthrough: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', // Mountain vista
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e', // Expansive sky
  ],
};

export function selectNatureImage(mood: string): string {
  const moodImages = NATURE_IMAGES[mood] || NATURE_IMAGES.peaceful;
  const randomIndex = Math.floor(Math.random() * moodImages.length);
  return moodImages[randomIndex];
}
```

**Alternative 3: Disable Images for Now**
- **Pros**: Immediate fix, no cost, no complexity
- **Cons**: Loses visual appeal
- **Effort**: 5 minutes
- Just remove image generation entirely, show only reflection

### Recommendation: Unsplash Collection (MVP) → DALL-E 3 (v2)

**Phase 1 (Now - MVP)**:
- Use curated Unsplash collection
- Mood-based image selection
- Free, fast, reliable
- Good enough for launch

**Phase 2 (Later - Enhancement)**:
- Upgrade to DALL-E 3 for truly personalized images
- Keep Unsplash as fallback
- Add user preference: AI-generated vs curated

**Implementation Steps**:
1. Create `lib/services/unsplash-images.ts`
2. Curate 3-4 images per mood category
3. Update `app/api/session/complete/route.ts` to use Unsplash
4. Remove FAL.ai dependency
5. Test all mood categories
6. Deploy

**Files to modify**:
- `lib/services/unsplash-images.ts` (new)
- `app/api/session/complete/route.ts` (update image generation call)
- `lib/services/fal-ai.ts` (deprecate or remove)
- `.env.local` (remove FAL_API_KEY, add OPENAI_API_KEY if doing DALL-E)

---

## 2. Create /api/user/profile Endpoint

### Current Issue
- `/urge` page tries to fetch `/api/user/profile`
- Returns 404
- Falls back to "friend" username
- **Locations**:
  - `app/urge/page.tsx:24` (fetches profile)
  - No API route exists

### Purpose
- Get user's display name/email for personalization
- Used in urge landing page greeting
- Could be used elsewhere for personalization

### Implementation

**Create**: `app/api/user/profile/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract display name from email
    const email = user.email || '';
    const displayName = email.split('@')[0] || 'friend';

    return NextResponse.json({
      id: user.id,
      email: user.email,
      displayName,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Future Enhancements (v2)
- Add user preferences table for custom display names
- Store preferred name, pronouns, etc.
- Update profile endpoint to fetch from preferences

### Testing
```bash
# Test the endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/user/profile
```

**Files to create**:
- `app/api/user/profile/route.ts`

**Files to update** (optional improvements):
- `app/urge/page.tsx` - Better error handling
- `app/dashboard/page.tsx` - Could use profile for greeting

**Effort**: 15 minutes

---

## 3. Integrate Daily Inventory v0.1

### What is Daily Inventory?
Based on recovery methodology, daily inventory is:
- End-of-day reflection practice (Step 10: "Continued to take personal inventory")
- Review what went well, what didn't
- Identify patterns, resentments, fears
- Make amends where needed
- Plan for tomorrow

### v0.1 Scope (MVP)

**Core Features**:
1. Simple daily check-in (triggered at evening/bedtime)
2. 3-5 guided questions
3. Brief Elder Tree reflection
4. Saved to user's inventory history
5. Streak tracking

**NOT in v0.1**:
- No complex analytics
- No step work integration (that's for walk sessions)
- No amends tracking (v2 feature)
- No sponsor sharing (v2 feature)

### Database Schema

**New table**: `daily_inventories`
```sql
CREATE TABLE daily_inventories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,

  -- Responses to prompts
  what_went_well TEXT,
  struggles_today TEXT,
  gratitude TEXT,
  tomorrow_intention TEXT,
  additional_notes TEXT,

  -- Reflection
  elder_reflection TEXT,

  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,

  UNIQUE(user_id, date)
);

CREATE INDEX idx_daily_inventories_user_date ON daily_inventories(user_id, date DESC);

-- RLS Policies
ALTER TABLE daily_inventories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventories"
  ON daily_inventories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventories"
  ON daily_inventories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventories"
  ON daily_inventories
  FOR UPDATE
  USING (auth.uid() = user_id);
```

### User Flow

**Entry Point 1: Dashboard Prompt**
- Dashboard shows "Complete Today's Inventory" if not done
- Small card/button, non-intrusive
- Badge shows current streak

**Entry Point 2: Navigation Menu**
- "Daily Inventory" link in main nav
- Always accessible

**Entry Point 3: Evening Notification** (v2)
- Optional reminder (9 PM or user's chosen time)
- Not in v0.1

### Inventory Questions (v0.1)

Keep it simple - 4 questions:

1. **"What went well today?"**
   - Focus on positives first
   - Recovery wins, connections, honesty

2. **"What was hard today?"**
   - Struggles, urges, resentments
   - Where did you stumble?

3. **"What are you grateful for?"**
   - 1-3 things
   - Keep it real, not performative

4. **"What's one thing you'll do differently tomorrow?"**
   - Actionable intention
   - Not vague commitments

### UI Components Structure

```
app/inventory/
├── page.tsx                    # Main inventory page
├── today/page.tsx              # Today's inventory (redirects if done)
└── [date]/page.tsx             # View past inventory

components/inventory/
├── InventoryPrompt.tsx         # Question/answer component
├── InventoryComplete.tsx       # Completion screen with reflection
└── InventoryStreak.tsx         # Streak display widget

lib/services/
└── inventory.ts                # Database operations
```

### API Routes

```
/api/inventory/
├── today                       # GET: Check if today's done, POST: Submit
├── start                       # POST: Start new inventory
└── history                     # GET: Past inventories
```

### Implementation Steps

#### Step 1: Database Migration
**File**: `supabase/migrations/005_daily_inventory.sql`
- Create `daily_inventories` table
- Add RLS policies
- Create indexes

#### Step 2: Service Layer
**File**: `lib/services/inventory.ts`
```typescript
export interface DailyInventory {
  id: string;
  user_id: string;
  date: string;
  what_went_well: string;
  struggles_today: string;
  gratitude: string;
  tomorrow_intention: string;
  additional_notes?: string;
  elder_reflection?: string;
  completed_at: string;
}

export async function getTodaysInventory(userId: string): Promise<DailyInventory | null>
export async function createInventory(userId: string, responses: InventoryResponses): Promise<DailyInventory>
export async function getInventoryStreak(userId: string): Promise<number>
export async function getInventoryHistory(userId: string, limit?: number): Promise<DailyInventory[]>
```

#### Step 3: API Routes
- `app/api/inventory/today/route.ts` - Check/submit today's inventory
- `app/api/inventory/history/route.ts` - Get past inventories

#### Step 4: UI Components
- `components/inventory/InventoryPrompt.tsx` - Question/answer flow
- `components/inventory/InventoryComplete.tsx` - Completion screen

#### Step 5: Main Inventory Page
- `app/inventory/page.tsx` - Entry point, checks if today's done

#### Step 6: Dashboard Integration
- Add "Daily Inventory" card to dashboard
- Show streak
- "Complete Today" button

#### Step 7: Elder Tree Reflection
- Generate brief reflection based on inventory responses
- Similar to walk session reflections
- Use Anthropic API with inventory-specific prompt

### Elder Tree Inventory Prompt

```typescript
const systemPrompt = `You are the Elder Tree creating an end-of-day reflection for someone in recovery.

Based on their daily inventory, offer:
- Brief acknowledgment of their honesty
- Recognition of what went well
- Gentle guidance on struggles (without fixing)
- Encouragement for tomorrow

Tone:
- 3-4 sentences max
- Direct but warm
- No clichés or platitudes
- "You showed up today" energy

Format:
Short paragraph, conversational, like a text from a sponsor checking in at night.`;
```

### Testing Checklist
- [ ] Can create today's inventory
- [ ] Can't create duplicate for same day
- [ ] Elder Tree reflection generates correctly
- [ ] Streak calculates correctly
- [ ] Can view past inventories
- [ ] Dashboard shows inventory prompt
- [ ] RLS prevents viewing others' inventories

### Phase Rollout

**Phase 1 (MVP - This Sprint)**:
- Database schema
- Basic inventory flow (4 questions)
- Elder Tree reflection
- View today's inventory
- Streak counter

**Phase 2 (Enhancement)**:
- View past inventories (calendar view)
- Edit today's inventory (before end of day)
- Inventory trends/insights
- Pattern recognition

**Phase 3 (Advanced)**:
- Step 10 integration (spot check inventory)
- Amends tracking
- Share with sponsor feature
- Export inventories

### Effort Estimate
- Database migration: 30 min
- Service layer: 1 hour
- API routes: 1 hour
- UI components: 2 hours
- Dashboard integration: 30 min
- Testing: 1 hour
- **Total: ~6 hours**

---

## Priority Order

### Immediate (This Session)
1. **User Profile API** (15 min) - Quick fix, improves UX
2. **Image Generation Fix** (30 min) - Use Unsplash solution

### Next Session
3. **Daily Inventory v0.1** (6 hours) - Major feature, plan full sprint

---

## Implementation Order Recommendation

```
Day 1 (Now):
├── Fix user profile API (15 min)
├── Replace image generation with Unsplash (30 min)
└── Test both fixes (15 min)

Day 2-3:
├── Daily Inventory database migration (30 min)
├── Daily Inventory service layer (1 hour)
├── Daily Inventory API routes (1 hour)
└── Test backend (30 min)

Day 4-5:
├── Daily Inventory UI components (2 hours)
├── Daily Inventory main page (1 hour)
├── Dashboard integration (30 min)
└── End-to-end testing (1 hour)

Total: ~8 hours over 2-3 days
```

---

## Questions for Discussion

1. **Image Generation**: Unsplash MVP vs invest in DALL-E now?
2. **Daily Inventory**: Any specific questions to include/exclude?
3. **Daily Inventory**: Should streak be days in a row, or X out of last 7 days?
4. **Daily Inventory**: Allow editing after submission, or lock it in?
5. **Priority**: Fix images + profile now, or start Daily Inventory immediately?

---

## Notes

- All three tasks are independent, can be done in any order
- User profile API is quickest win (15 min)
- Image fix has multiple options, recommend Unsplash for speed
- Daily Inventory is biggest feature, needs dedicated focus

**Recommendation**: Knock out profile + images today, tackle inventory fresh tomorrow.

---

**End of Plan**
Generated: November 4, 2025
