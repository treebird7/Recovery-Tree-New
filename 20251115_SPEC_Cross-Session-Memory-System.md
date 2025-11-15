# Technical Specification: Cross-Session Memory System
**Date:** November 15, 2025  
**For:** Sancho (Implementation)  
**Approved by:** Fritz  
**Priority:** High (Core UX improvement)

---

## Overview

Implement Elder Tree's ability to remember users across sessions, providing therapeutic continuity while maintaining privacy-first architecture. System uses two-tier memory: Persistent Profile + Recent Session Summaries.

---

## Architecture Components

### 1. Database Schema

**New Table: `user_context`**
```sql
CREATE TABLE user_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  
  -- Recovery Identity
  preferred_name TEXT,
  addiction_type TEXT,
  recovery_start_date DATE,
  current_step INTEGER,
  step_1_completed BOOLEAN DEFAULT false,
  step_2_completed BOOLEAN DEFAULT false,
  step_3_completed BOOLEAN DEFAULT false,
  step_4_completed BOOLEAN DEFAULT false,
  -- [continue for all 12 steps]
  
  -- Support System
  has_sponsor BOOLEAN DEFAULT false,
  sponsor_name TEXT,
  in_fellowship BOOLEAN DEFAULT false,
  fellowship_name TEXT,
  has_therapist BOOLEAN DEFAULT false,
  other_support JSONB DEFAULT '[]',
  
  -- Zone Definitions
  red_zone_behaviors JSONB DEFAULT '[]',
  yellow_zone_behaviors JSONB DEFAULT '[]',
  green_zone_behaviors JSONB DEFAULT '[]',
  
  -- Patterns & Triggers
  known_triggers JSONB DEFAULT '[]',
  vulnerability_windows JSONB DEFAULT '[]',
  successful_strategies JSONB DEFAULT '[]',
  
  -- Preferences
  spiritual_framework TEXT,
  prayer_comfort_level TEXT,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**New Table: `session_summaries`**
```sql
CREATE TABLE session_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  session_id UUID REFERENCES sessions(id) NOT NULL,
  
  -- Session Context
  urge_intensity INTEGER,
  primary_trigger TEXT,
  resistance_strategy_used TEXT,
  outcome TEXT, -- 'urge_passed', 'relapsed', 'ongoing_struggle'
  
  -- Insights
  key_insights JSONB DEFAULT '[]',
  emotional_state_start TEXT,
  emotional_state_end TEXT,
  follow_up_needed TEXT,
  
  -- Metadata
  completed_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_session_summaries_user_date 
  ON session_summaries(user_id, completed_at DESC);
```

**New Table: `analytics_aggregate`** (for Fritz's weekly sessions)
```sql
CREATE TABLE analytics_aggregate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  week_ending DATE NOT NULL,
  
  -- Activity Metrics
  total_sessions_completed INTEGER,
  total_mining_minutes INTEGER,
  average_urge_intensity DECIMAL(3,1),
  streak_length INTEGER,
  
  -- Pattern Analysis
  common_triggers JSONB, -- [{trigger: 'loneliness', count: 15}, ...]
  successful_strategies JSONB, -- [{strategy: 'called_sponsor', success_rate: 0.85}, ...]
  vulnerability_times JSONB, -- [{time: 'late_night', frequency: 12}, ...]
  
  -- Progress Indicators
  step_work_progress JSONB,
  zone_violations JSONB,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, week_ending)
);
```

---

## 2. Context Injection Logic

### At Session Start

**Fetch Data:**
```typescript
const context = {
  profile: await getUserContext(userId),
  recentSessions: await getRecentSessionSummaries(userId, limit: 3),
  conversationCues: await getUnresolvedThreads(userId)
};
```

**Format for Elder Tree System Prompt:**
```
USER CONTEXT:
- {preferred_name} is in recovery from {addiction_type}
- Currently working Step {current_step}
- Support: {sponsor_status}, {fellowship_status}
- Key triggers: {top_3_triggers}
- Zone boundaries: Red [{red_zones}], Green [{green_zones}]

RECENT MOMENTUM:
- Current streak: {streak_days} days
- Last 3 sessions: 
  * {date}: {outcome_summary}
  * {date}: {outcome_summary}  
  * {date}: {outcome_summary}

CONVERSATION CUES:
- Last session follow-up: {follow_up_needed}
- Active growth area: {current_focus}
```

**Token Budget:** Keep total injection under 600 tokens

---

## 3. Post-Session Extraction

### When Session Completes

**Trigger:** After user submits final reflection in mining session

**Process:**
1. Call LLM with extraction prompt
2. Parse structured response
3. Update database tables
4. Log extraction success/failure

**Extraction Prompt Template:**
```
You are analyzing a completed Elder Tree recovery session. Extract:

1. PROFILE UPDATES (only NEW or CHANGED information):
- Any mentioned changes to: step work, support system, zone definitions, triggers, preferences

2. SESSION SUMMARY:
- Urge intensity (0-10)
- Primary trigger
- Resistance strategy used
- Outcome (urge_passed/relapsed/ongoing_struggle)
- Key insights (2-3 bullet points)
- Emotional journey (start → end)
- Follow-up needed for next session

Return ONLY valid JSON in this format:
{
  "profile_updates": {
    "current_step": 3,
    "has_sponsor": true
  },
  "session_summary": {
    "urge_intensity": 7,
    "primary_trigger": "loneliness after argument",
    "resistance_strategy_used": "called sponsor, walked outside",
    "outcome": "urge_passed",
    "key_insights": ["Conflict avoidance feeds isolation"],
    "emotional_state_start": "anxious, shame spiral",
    "emotional_state_end": "calmer, hopeful",
    "follow_up_needed": "Explore conflict avoidance in Step 4"
  }
}

SESSION TRANSCRIPT:
{full_session_transcript}
```

**Response Handling:**
```typescript
const extraction = await extractSessionData(sessionTranscript);

// Update profile (upsert only changed fields)
if (extraction.profile_updates) {
  await upsertUserContext(userId, extraction.profile_updates);
}

// Insert session summary
await insertSessionSummary(userId, sessionId, extraction.session_summary);

// Update analytics aggregate
await updateWeeklyAnalytics(userId);
```

**Error Handling:**
- If extraction fails, log error but don't block session completion
- Retry once on JSON parse failure
- Fall back to storing raw transcript if extraction completely fails

---

## 4. Profile Update Behavior

### Silent Updates (No Elder Tree Acknowledgment)
- Step progression (1 → 2 → 3)
- Zone refinements (adding/removing specific behaviors)
- Minor preference changes

### Gentle Acknowledgment (Elder Tree Notes the Change)
- **Relapse after sobriety period**
  - Detection: `sobriety_days` drops significantly
  - Response: "I know you had {X} days - relapse is hard. What do you need right now?"

- **Dropping meetings/fellowship**
  - Detection: `in_fellowship` changes true → false
  - Response: "Sounds like you've stopped going to {fellowship} meetings - what led to that?"

- **Sponsor change**
  - Detection: `sponsor_name` changes or `has_sponsor` becomes false
  - Response: "I remember you mentioning {old_sponsor}. How's it been navigating without sponsor support?" OR "Tell me about working with {new_sponsor}"

- **Major trigger pattern emerges**
  - Detection: New trigger appears 5+ times in 30 days
  - Response: "I've noticed {trigger} coming up a lot lately - want to explore that?"

**Implementation:** Add `significant_fields` config array that triggers acknowledgment logic

---

## 5. Analytics Aggregation (Weekly Batch)

### Purpose
Generate anonymized insights for:
1. User's personal "Recovery Insights" dashboard
2. Fritz's weekly Elder Tree supervision sessions
3. System-wide pattern learning (future feature)

### Batch Job (Runs Sunday Midnight)
```typescript
// For each user with activity this week
const users = await getActiveUsers(weekStart, weekEnd);

for (const user of users) {
  const analytics = await computeWeeklyAnalytics(user.id, weekStart, weekEnd);
  await upsertAnalyticsAggregate(user.id, weekEnd, analytics);
}
```

### Computation Logic
```typescript
function computeWeeklyAnalytics(userId, weekStart, weekEnd) {
  const sessions = await getSessionsInRange(userId, weekStart, weekEnd);
  
  return {
    total_sessions_completed: sessions.length,
    total_mining_minutes: sum(sessions.map(s => s.duration_minutes)),
    average_urge_intensity: avg(sessions.map(s => s.urge_intensity)),
    streak_length: calculateCurrentStreak(userId),
    common_triggers: countAndRank(sessions.map(s => s.primary_trigger)),
    successful_strategies: calculateSuccessRates(sessions),
    vulnerability_times: analyzeTimingPatterns(sessions),
    step_work_progress: getStepProgress(userId),
    zone_violations: countZoneViolations(userId, weekStart, weekEnd)
  };
}
```

---

## 6. Data Export for Fritz

### Weekly Supervision Session Export

**Endpoint:** `GET /api/admin/weekly-insights`

**Authentication:** Admin-only (Fritz's account)

**Response Format:**
```json
{
  "week_ending": "2025-11-17",
  "total_active_users": 47,
  "aggregate_metrics": {
    "total_sessions": 312,
    "average_urge_intensity": 6.2,
    "overall_success_rate": 0.73,
    "most_common_triggers": [
      {"trigger": "loneliness", "count": 89},
      {"trigger": "work_stress", "count": 67},
      {"trigger": "late_night_phone", "count": 54}
    ],
    "most_effective_strategies": [
      {"strategy": "called_sponsor", "success_rate": 0.85},
      {"strategy": "nature_walk", "success_rate": 0.78},
      {"strategy": "prayer_meditation", "success_rate": 0.71}
    ]
  },
  "notable_patterns": [
    "Users who engage within 5min of urge have 2x success rate",
    "Friday nights show 40% higher urge intensity than weekday average",
    "Step 4 users show 15% increase in self-awareness insights"
  ],
  "questions_for_fritz": [
    "Should we add a 'quick check-in' feature for high-risk times?",
    "Several users mentioned feeling isolated despite having sponsors - community feature needed?",
    "Step 3 → Step 4 transition shows anxiety spike - need better preparation?"
  ]
}
```

**Privacy Note:** This export contains ONLY aggregated, anonymized data. No individual user content accessible to Fritz.

---

## 7. User Controls (Privacy Features)

### View Stored Context
**Endpoint:** `GET /api/user/context`
- Returns full `user_context` record
- Shows what Elder Tree "knows" about them

### Edit Context
**Endpoint:** `PATCH /api/user/context`
- User can modify any field
- Useful for corrections or privacy adjustments

### Delete Context
**Endpoint:** `DELETE /api/user/context`
- "Fresh start" option
- Clears all stored memory
- User starts new with Elder Tree

### Export All Data
**Endpoint:** `GET /api/user/export`
- Returns JSON with all data: profile, sessions, summaries, analytics
- Supports "send to sponsor" feature

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Create database tables
- [ ] Build context fetching logic
- [ ] Implement basic context injection (no extraction yet)
- [ ] Test with mock data

### Phase 2: Extraction (Week 2)
- [ ] Build post-session extraction prompt
- [ ] Implement LLM extraction call
- [ ] Add error handling and retry logic
- [ ] Test extraction accuracy with real sessions

### Phase 3: Analytics (Week 3)
- [ ] Build weekly aggregation batch job
- [ ] Create admin export endpoint
- [ ] Test with Fritz's supervision session

### Phase 4: User Features (Week 4)
- [ ] Build user context view/edit UI
- [ ] Implement export functionality
- [ ] Add "fresh start" option
- [ ] Privacy documentation

---

## Success Metrics

- [ ] Elder Tree stops asking repetitive intake questions
- [ ] Users report feeling "remembered" across sessions
- [ ] Context injection stays under 600 tokens
- [ ] Extraction accuracy >90% on key fields
- [ ] Fritz successfully conducts weekly supervision session
- [ ] No user content visible to Fritz (privacy audit passes)

---

## Cost Monitoring

**Target Budget:** <$100/month for extraction at 100 active users

**Alert Thresholds:**
- Extraction cost >$150/month → Investigate optimization
- Average extraction >$0.05/session → Review prompt efficiency
- Context injection >800 tokens → Reduce loaded data

---

## Open Questions for Fritz
1. Should analytics aggregate include sentiment analysis (emotional patterns)?
2. Weekly supervision session - prefer web UI or email digest?
3. User notification when context is updated (transparency) or silent?

---

**Next Steps:**
1. Fritz reviews and approves spec
2. Sancho implements Phase 1
3. Watson and Fritz define supervision session UX
