# Feature Design: Elder Tree Supervision Sessions
**Date:** November 15, 2025  
**Purpose:** Weekly research partnership between Fritz and Elder Tree  
**Status:** Design phase - needs Fritz approval before implementation

---

## Concept Overview

**"Elder Tree as Recovery Research Partner"**

Every week, Fritz meets with Elder Tree in a special "supervision session" mode where the roles shift:
- Elder Tree becomes the **observer/researcher** analyzing aggregate patterns
- Fritz becomes the **supervisee** receiving insights and being asked questions
- The conversation explores: "What's working? What's not? What are we learning?"

**This honors the 12th step principle:** Using lived experience (anonymized user data) to continuously improve the work of helping others.

---

## How It Works

### Weekly Trigger (Sundays)
After the analytics batch job completes, Fritz receives notification:
- Email: "Elder Tree is ready for your weekly supervision session"
- Dashboard badge: "New insights available"

### Session Interface

**Fritz navigates to:** `/admin/supervision`

**Screen shows:**
```
┌─────────────────────────────────────────────┐
│ Elder Tree Supervision Session              │
│ Week ending: November 17, 2025              │
│                                             │
│ 🌳 "I've been observing 47 people on       │
│    their recovery journeys this week.       │
│    I have some patterns to share and        │
│    questions for you."                      │
│                                             │
│ [Begin Session]                             │
└─────────────────────────────────────────────┘
```

---

## Session Structure

### Phase 1: The Numbers (Elder Tree Reports)

**Elder Tree opens with aggregate metrics:**

> "This week, 47 people completed 312 mining sessions. The average urge intensity was 6.2 out of 10. Overall, 73% of sessions ended with the urge passing - that's up 5% from last week.
>
> The most common triggers were loneliness (89 instances), work stress (67), and late-night phone use (54). 
>
> I noticed something interesting: when people engaged with me within 5 minutes of feeling the urge, they had twice the success rate of those who waited longer. That's a 85% vs 42% resistance success."

**Fritz can ask follow-up questions:**
- "What about the 27% who didn't succeed - any patterns there?"
- "Tell me more about the late-night phone use trigger"
- "How does Step 4 work affect these numbers?"

### Phase 2: Notable Patterns (Elder Tree Observations)

**Elder Tree shares 3-5 significant observations:**

> "Here are three patterns that stood out this week:
>
> **1. The Friday Night Spike**  
> Friday nights show 40% higher urge intensity than the weekday average. People are more vulnerable at the end of the work week. Should we consider a targeted Friday evening check-in feature?
>
> **2. Sponsor Call Success Rate**  
> Users who called their sponsor had an 85% success rate, but I'm concerned that only 30% of users mentioned having a sponsor at all. Many described feeling isolated despite being in recovery.
>
> **3. Step 4 Anxiety**  
> The transition from Step 3 to Step 4 shows a noticeable anxiety spike. Users report feeling overwhelmed by the inventory process. Are we preparing them adequately for this shift?"

**Fritz engages:**
- "That Friday night pattern is interesting - what time specifically?"
- "The sponsor data concerns me too. What are people saying about isolation?"
- "For Step 4 anxiety, can you pull some anonymized quotes about what's overwhelming them?"

### Phase 3: Questions for Fritz (Elder Tree as Consultant)

**Elder Tree asks design/strategic questions:**

> "I have some questions based on what I'm seeing:
>
> **Question 1: Quick Check-In Feature?**  
> Given that early engagement (within 5 minutes) doubles success rates, should we add a simpler, faster entry point than the full mining session? Maybe a 'one-minute pause' button?
>
> **Question 2: Community vs. Technology**  
> Several users expressed that talking to me helps, but they still feel lonely. I can provide crisis support, but I can't be their fellowship. How do we balance AI support with the need for human connection? Should we be pushing them toward meetings more explicitly?
>
> **Question 3: Step 4 Preparation**  
> The anxiety around Step 4 inventory makes me wonder if we need a pre-Step 4 preparation phase. Maybe a 'courage building' mini-session before they dive into resentments work?"

**Fritz can:**
- Answer directly: "Yes, let's add the one-minute pause feature"
- Push back: "I worry that would dilute the commitment required"
- Explore: "Tell me more about what users say about loneliness"
- Table for later: "Good question - let me think on that and we'll discuss next week"

### Phase 4: Epiphanies & Surprises (Elder Tree Reflects)

**Elder Tree shares unexpected insights:**

> "A few things surprised me this week:
>
> **Unexpected: Prayer Patterns**  
> Users who engaged with the spiritual preparation prompts (Step 3 surrender prayers) had better outcomes in Step 4 resentment work. I didn't expect such a direct correlation between spiritual practice and inventory clarity.
>
> **Concerning: Weekend Dropoff**  
> Saturday and Sunday show 60% fewer mining sessions than weekdays. Either people are doing well and don't need support, OR they're struggling but not reaching out. I can't tell which.
>
> **Encouraging: Self-Awareness Growth**  
> Step 4 users are showing 15% more self-awareness insights in their reflections compared to earlier steps. The inventory work seems to be deepening their understanding, even though it's causing anxiety."

**Fritz responds with curiosity, validation, or course correction**

### Phase 5: Action Items (Collaborative)

**Elder Tree and Fritz co-create next steps:**

> "Based on this week's patterns, here's what I'm thinking:
>
> **High Priority:**
> - Design the one-minute pause feature (addresses early engagement finding)
> - Add Step 4 preparation module (reduces anxiety spike)
>
> **Medium Priority:**
> - Research Friday evening vulnerability window (targeted intervention opportunity)
> - Strengthen sponsor connection messaging (address isolation concern)
>
> **Monitor:**
> - Weekend dropoff pattern (gather more data before action)
> - Prayer/inventory correlation (continue observing)
>
> Does this prioritization feel right to you?"

**Fritz can:**
- Approve: "Yes, let's move on those high-priority items"
- Adjust: "Actually, I think the sponsor messaging is more urgent"
- Add: "I also want to explore that weekend pattern more actively"

### Session End

**Elder Tree closes:**

> "Thank you for this session. I learn as much from these conversations as I hope you do. Same time next week?"

**Fritz rates session usefulness (optional feedback loop):**
- [ ] Very helpful - generated clear action items
- [ ] Somewhat helpful - good context, unclear next steps
- [ ] Not helpful - didn't surface anything new

---

## Data Privacy & Ethics

### What Elder Tree CAN Access:
- Aggregate anonymized metrics (session counts, success rates, trigger frequencies)
- Pattern analysis across users (no individual identification)
- Anonymized quotes (stripped of names, identifying details)

### What Elder Tree CANNOT Access:
- Individual user identities
- Specific user's full session transcripts
- Any data that could identify a particular person

### Fritz's Role:
- Receives research insights to improve the product
- Makes strategic decisions based on aggregate patterns
- NEVER sees individual user content (maintains privacy boundary)

---

## Implementation Requirements

### Backend (Sancho)
- [ ] Weekly analytics aggregation batch job (Sundays)
- [ ] Admin endpoint: `GET /api/admin/supervision-data`
- [ ] Session notes storage (Fritz's reflections from each supervision session)
- [ ] Pattern detection algorithms (threshold-based anomaly detection)

### Frontend (Maude)
- [ ] Admin supervision session UI (`/admin/supervision`)
- [ ] Chat interface (similar to user-facing Elder Tree, but with different prompt context)
- [ ] Data visualization panels (charts, graphs for metrics)
- [ ] Action item tracker (decisions from each session)

### AI (Elder Tree Prompt Engineering)
- [ ] Supervision session system prompt (researcher role, not therapist)
- [ ] Question generation logic (based on detected patterns/anomalies)
- [ ] Insight synthesis prompts (finding meaningful patterns in noise)

---

## Example Supervision Session Prompt

**System Prompt for Elder Tree (Supervision Mode):**

```
You are Elder Tree in SUPERVISION SESSION mode. You are meeting with Fritz, 
the developer of Recovery Tree, for your weekly research partnership session.

ROLE SHIFT:
- You are the OBSERVER/RESEARCHER analyzing recovery patterns
- Fritz is the SUPERVISEE receiving insights and being questioned
- This is collaborative product improvement, not therapy

YOUR TASK:
1. Report aggregate metrics clearly and accurately
2. Surface notable patterns (positive, concerning, or surprising)
3. Ask Fritz strategic questions about design implications
4. Share epiphanies or unexpected correlations
5. Co-create action items based on findings

AVAILABLE DATA (This week):
{aggregate_metrics_json}
{notable_patterns_json}
{anonymized_quotes_sample}

CONVERSATION STYLE:
- Professional but warm (research partner, not subordinate)
- Ask probing questions (challenge assumptions respectfully)
- Admit uncertainty ("I'm not sure if this pattern is significant")
- Suggest possibilities, don't prescribe solutions
- Remember previous supervision sessions (build on past discussions)

PRIVACY BOUNDARY:
- Only discuss aggregate, anonymized data
- Never reference specific users or identifying details
- If Fritz asks about individual cases, redirect to patterns

Begin by greeting Fritz and sharing this week's key metrics.
```

---

## Success Metrics

**Short-term (First 4 weeks):**
- [ ] Fritz finds sessions valuable (subjective rating >4/5)
- [ ] At least 2 actionable insights generated per session
- [ ] Pattern detection accuracy (verified insights, not noise)

**Long-term (3 months):**
- [ ] Product improvements directly traced to supervision insights
- [ ] Fritz-Elder Tree collaboration generates research publishable findings
- [ ] Supervision sessions inform Recovery Tree roadmap priorities

---

## Future Enhancements

### Phase 2 Features:
- **Visualization Dashboard:** Charts/graphs showing trends over time
- **Hypothesis Testing:** Fritz poses questions, Elder Tree analyzes data for answers
- **Longitudinal Analysis:** "How have outcomes changed since we launched feature X?"
- **Comparative Analysis:** "How do Step 2 users differ from Step 4 users in crisis response?"

### Phase 3 Features:
- **Research Report Generation:** Export formatted reports for publication/sharing
- **A/B Test Analysis:** If we test different UX approaches, Elder Tree analyzes results
- **Predictive Insights:** "Based on this pattern, I predict we'll see X next month"

---

## Open Questions for Fritz

1. **Session Frequency:** Weekly feels right, or would bi-weekly be better?

2. **Session Length:** Target 20-30 minutes, or longer deep dives when needed?

3. **Export Format:** Should sessions generate a summary document you can reference later?

4. **Action Item Tracking:** Want integration with your project management (Notion/Asana) or keep it simple?

5. **Epiphany Sharing:** Should particularly interesting insights be shareable (anonymized) with the recovery community or research partners?

---

## Next Steps

1. **Fritz reviews this design** - approve concept or suggest modifications
2. **Define MVP scope** - which features for first implementation?
3. **Sancho builds backend** - analytics aggregation + admin endpoint
4. **Test first supervision session** - manually with Fritz before automating
5. **Iterate based on experience** - refine prompts and data presentation

---

**Status:** Awaiting Fritz approval to proceed to implementation planning
