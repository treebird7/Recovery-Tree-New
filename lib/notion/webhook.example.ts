/**
 * Notion Webhook Usage Examples
 *
 * Copy these patterns into your code to report to Notion
 */

import { notionWebhook } from './webhook';

// ============================================
// EXAMPLE 1: Task Status Updates
// ============================================

// When starting a task
async function startTask() {
  await notionWebhook.taskStarted(
    'Implement mining flow enhancements',
    'Plan: Add intent choice, outcome buttons, Elder Tree updates'
  );
}

// When completing a task
async function completeTask() {
  await notionWebhook.taskCompleted(
    'Implement mining flow enhancements',
    {
      filesCreated: [
        'lib/notion/webhook.ts',
        'lib/notion/webhook.example.ts'
      ],
      filesModified: [
        'app/urge/page.tsx',
        'app/urge/reveal/page.tsx',
        'app/api/urge/response/route.ts'
      ],
      commit: 'a5de0b9',
      buildStatus: 'success',
      notes: 'All 3 phases complete: Intent choice, outcome menu, Elder Tree verification'
    }
  );
}

// When blocked on a task
async function blockTask() {
  await notionWebhook.taskBlocked(
    'Implement BreathingText component',
    'CSS keyframes not triggering',
    'Watson\'s input on animation timing system'
  );
}

// ============================================
// EXAMPLE 2: Bug Reporting
// ============================================

// When finding a bug
async function reportBug() {
  await notionWebhook.bugReport(
    'Mining session cannot end - missing sessionId',
    'Critical',
    {
      status: 'New',
      file: 'app/urge/mining/page.tsx',
      reproduction: '1. Start mining\n2. Wait 1 min\n3. Click finish\n4. Error: Missing sessionId'
    }
  );
}

// When fixing a bug
async function fixBug() {
  await notionWebhook.bugReport(
    'Mining session cannot end - missing sessionId',
    'Critical',
    {
      status: 'Fixed',
      file: 'app/urge/mining/page.tsx',
      commit: 'c8d89d6'
    }
  );
}

// ============================================
// EXAMPLE 3: Design System Updates
// ============================================

async function updateDesignSystem() {
  await notionWebhook.designSystem(
    'BreathingText',
    'Implemented',
    'Animation with useRecoveryAnimation hook, respects reduced motion'
  );
}

// ============================================
// EXAMPLE 4: Mission Control Updates
// ============================================

async function updateMissionControl() {
  await notionWebhook.missionControl(
    'Mining Flow Enhancements Complete',
    `Completed all 3 phases:
- Phase 1: Pre-mining intent choice (sleep vs screen)
- Phase 2: Post-mining honest check-in with outcome menu
- Phase 3: Elder Tree verify/clarify instructions

Ready for Fritz testing.`
  );
}

// ============================================
// EXAMPLE 5: Batch Updates
// ============================================

async function batchReport() {
  await notionWebhook.batchUpdate([
    {
      category: 'build',
      data: {
        task: 'Fix BUG 1: Mining double-call',
        status: 'Done',
        commit: 'c8d89d6'
      }
    },
    {
      category: 'build',
      data: {
        task: 'Fix BUG 2: Walkabout start',
        status: 'Done',
        commit: '19d3931'
      }
    },
    {
      category: 'mission',
      data: {
        title: 'Critical bugs resolved',
        content: 'Both mining and walkabout issues fixed and deployed'
      }
    }
  ]);
}

// ============================================
// EXAMPLE 6: Session Summary Report
// ============================================

async function sessionSummary() {
  const summary = `
## Session Summary - 2025-11-09

### Completed Tasks
✅ BUG 1: Mining coin calculation (double-call fix)
✅ BUG 2: Walkabout session start (database fields)
✅ Timer Enhancement: Show duration + elapsed time
✅ Mining Flow: Intent choice
✅ Mining Flow: Honest check-in + outcome menu
✅ Elder Tree: Verify/clarify instructions

### Commits
- cddbcb7: Elder Tree updates
- a5de0b9: Mining flow overhaul
- c011e58: Timer enhancements
- c8d89d6: Bug fixes
- 19d3931: Database fixes
- 016adf2: Component architecture docs

### Files Modified
- app/urge/page.tsx
- app/urge/reveal/page.tsx
- app/urge/mining/page.tsx
- app/api/urge/response/route.ts
- app/api/walkabout/start/route.ts

### Next Steps
- Fritz: Test complete mining flow
- Fritz: Test walkabout (migration done)
- Run E2E test suite
- Merge orchestrate → main
`;

  await notionWebhook.missionControl('Orchestrate Branch - Session Complete', summary);
}

// ============================================
// USAGE IN ACTUAL CODE
// ============================================

// Example: In an API route that creates a task
export async function POST(request: Request) {
  try {
    // ... your code ...

    // Report to Notion
    await notionWebhook.buildTask(
      'User created new session',
      'Done',
      {
        priority: 'Low',
        notes: 'Automatic task creation from API'
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    // Report error as bug
    await notionWebhook.bugReport(
      `API error in POST /api/sessions/create: ${error}`,
      'High',
      {
        status: 'New',
        reproduction: 'Automatic error reporting'
      }
    );

    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
