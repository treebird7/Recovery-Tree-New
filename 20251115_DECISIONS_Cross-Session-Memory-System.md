# DECISIONS: Cross-Session Memory System
**Date:** November 15, 2025  
**Context:** Implementing Elder Tree's ability to remember users across sessions  
**Participants:** Fritz, Watson, Sancho

---

## Decision 1: Implement Cross-Session Memory
**Context:** Current architecture is session-isolated by design. Users expect therapeutic continuity.

**Options Considered:**
- A) Keep session isolation (maximum privacy, simpler system)
- B) Implement cross-session memory (better UX, therapeutic relationship building)

**Decision:** Option B - Implement cross-session memory

**Rationale:**
- Users expect "Elder Tree should remember me"
- Avoids repetitive intake questions every session
- Builds authentic therapeutic relationship over time
- Privacy architecture already supports this (pseudonymous storage, user data ownership)
- Export feature implies accumulated context has value

**Trade-offs Accepted:**
- More complex system (new tables, extraction logic)
- Ongoing API costs for extraction (~$50-90/month at scale)
- Token budget management for context injection

---

## Decision 2: Two-Tier Memory Architecture
**Decision:** Implement Persistent Profile + Recent Session Summaries (not unlimited rolling history)

**Rationale:**
- Token budget concerns: unlimited history could exceed 10,000 tokens after a year
- Mirrors human memory: detailed recent, summarized distant
- Older patterns compress into profile facts rather than storing all raw sessions

**Implementation:**
- Persistent Profile: slowly-changing facts (addiction type, step status, support system, zones)
- Recent Summaries: last 3 sessions with detailed outcomes
- Context injection target: ~600 tokens total

**Alternative Rejected:** Unlimited rolling history with dynamic truncation (too complex, unpredictable token costs)

---

## Decision 3: Separate Analytics Layer
**Decision:** Create dedicated analytics aggregation system independent of Elder Tree context

**Purpose:**
1. User's personal "Recovery Insights" dashboard
2. Fritz's weekly supervision sessions with Elder Tree
3. Future: system-wide anonymized learning

**Why Separate:**
- Analytics data too heavy for Elder Tree context (thousands of data points)
- Different access patterns (weekly batch vs. per-session)
- Fritz can access aggregate analytics but NOT individual user content (privacy boundary)

**Implementation:**
- Weekly batch job computes: session counts, trigger frequencies, strategy success rates, pattern analysis
- Stored in `analytics_aggregate` table
- Admin-only export endpoint for Fritz

---

## Decision 4: Immediate vs. Batched Extraction
**Decision:** Extract session summaries immediately after completion (not batched overnight)

**Rationale:**
- Better UX: next session has immediate access to previous context
- MVP scale makes cost difference negligible (~$0.02/extraction)
- Simpler architecture (no batch job coordination for extraction)

**When to Revisit:** If costs exceed $100/month or we reach 500+ active users, consider batching for cost optimization

---

## Decision 5: Profile Update Acknowledgment Strategy
**Decision:** Gentle acknowledgment for major shifts, silent adaptation for natural progression

**Follows "Sandy B. sponsor approach" - direct but caring:**

**Silent Updates:**
- Step progression (1 → 2 → 3)
- Zone refinements
- Minor preference changes

**Gentle Acknowledgment:**
- Relapse after sobriety period
- Dropping meetings/fellowship
- Sponsor changes
- Major new trigger patterns (5+ occurrences in 30 days)

**Rationale:**
- Demonstrates Elder Tree is paying attention (builds trust)
- Invites exploration of significant changes without interrogating every detail
- Balances therapeutic presence with user autonomy

---

## Decision 6: User Data Ownership & Control
**Decision:** Full user control over stored context with transparency features

**Features Required:**
- View what's stored (full context visibility)
- Edit any field (corrections, privacy adjustments)
- Delete all context ("fresh start" option)
- Export everything (JSON format for sponsor/therapist sharing)

**Rationale:**
- Aligns with recovery principle: "user owns their recovery data"
- Privacy-first architecture requires transparency
- Builds trust in the system

---

## Decision 7: Fritz's Weekly Supervision Sessions
**Decision:** Create "Elder Tree as research partner" feature for Fritz

**Format:** Weekly debrief where Elder Tree:
- Reviews aggregate patterns across all users (anonymized)
- Surfaces notable insights or concerning trends
- Asks Fritz questions about system design implications
- Suggests potential improvements based on observed patterns

**Export Method:** Admin endpoint returning structured JSON with:
- Aggregate metrics (total sessions, success rates, common patterns)
- Notable observations
- Questions for Fritz

**Privacy Boundary:** Fritz receives ONLY anonymized aggregate data, never individual user content

**Purpose:**
- Continuous improvement loop
- Research insights from lived user data
- Elder Tree as collaborative design partner
- Honors 12th step principle: using experience to improve the work

---

## Decision 8: Token Budget Management
**Decision:** Target ~600 tokens for context injection, hard cap at 800 tokens

**Breakdown:**
- Persistent Facts: ~200 tokens
- Recent Momentum: ~300 tokens  
- Conversation Cues: ~100 tokens

**If Exceeds Budget:**
- Reduce recent sessions from 3 to 2
- Compress zone definitions to top 3 behaviors only
- Summarize triggers more aggressively

**Monitoring:** Add alerting if context injection averages >700 tokens

---

## Decision 9: What NOT to Extract/Store
**Privacy Safeguards - Never store:**
- Graphic details of acting-out behaviors
- Names of non-recovery people without clear relevance
- Financial information (except if directly recovery-relevant like gambling)
- Medical diagnoses (unless user explicitly connects to recovery)
- Specific locations beyond general patterns

**Extraction Prompt Constraints:**
- Focus on recovery-relevant context only
- Anonymize unnecessary details
- If uncertain whether to store, err on side of not storing

---

## Open Questions (Still Deciding)

### Question 1: Sentiment Analysis in Analytics?
Should weekly aggregation include emotional pattern tracking (anxiety trends, shame spirals, hope markers)?

**Considerations:**
- Could provide valuable insights for user and Fritz
- More complex extraction logic
- Privacy implications of tracking emotional state over time

**Status:** Defer to Phase 3, start with behavioral data only

### Question 2: Supervision Session Format?
Web UI dashboard vs. email digest for Fritz's weekly sessions?

**Options:**
- Web UI: Interactive exploration of data, can drill down
- Email digest: Convenient, doesn't require login
- Both: Email summary with link to full dashboard

**Status:** To be designed with Fritz before Phase 3

### Question 3: User Notification on Context Updates?
Should users get notified when their profile is updated, or happen silently?

**Transparency vs. Noise:**
- Transparent: "Elder Tree updated: now knows you're working Step 3"
- Silent: Updates happen invisibly, user can view anytime

**Status:** Test with beta users, gather feedback

---

## Implementation Timeline

**Phase 1 (Week 1):** Database foundation, basic context injection  
**Phase 2 (Week 2):** Post-session extraction logic  
**Phase 3 (Week 3):** Analytics aggregation, Fritz supervision endpoint  
**Phase 4 (Week 4):** User features (view/edit/export context)

**Target Launch:** December 15, 2025 (4 weeks from spec approval)

---

## Success Criteria

**User Experience:**
- [ ] Elder Tree remembers name, addiction type, step status across sessions
- [ ] No more "Tell me about your addiction" repetition
- [ ] Users report feeling continuity in relationship

**Technical Performance:**
- [ ] Context injection <600 tokens average
- [ ] Extraction accuracy >90% on key fields
- [ ] Extraction cost <$100/month at 100 active users

**Privacy Compliance:**
- [ ] Fritz cannot access individual user content
- [ ] Users can view/edit/delete their context
- [ ] Export feature works for sponsor sharing

**Research Value:**
- [ ] Fritz successfully conducts weekly supervision session
- [ ] Elder Tree surfaces actionable insights
- [ ] Aggregate data informs product improvements

---

**Next Review:** After Phase 1 implementation, assess extraction accuracy and adjust prompt if needed
