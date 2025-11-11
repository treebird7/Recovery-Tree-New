# Zapier Webhook Integration - Notion Router

## Overview
Single webhook endpoint that routes incoming data to 6 different Notion pages based on header values. Uses conditional path routing with category-based filtering. Content is added to Notion pages as markdown format.

## API Specification

### Endpoint
```
https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/
```

### Method
`POST`

### Required Headers
- `Content-Type: application/json` (or `text/plain`)
- `category: [CATEGORY_VALUE]` (custom header for routing)

### Category Values & Routing

| Category | Routes To |
|----------|-----------|
| `mission` | Mission Control Notion page |
| `design-brief` | Design Briefs Notion page |
| `build` | Build Tasks Notion page |
| `design-system` | Design System Notion page |
| `content` | Content Library Notion page |
| `bug` | Bug Tracker Notion page |

### Request Body
- Send the content you want added to the Notion page
- Content will be treated as markdown format
- Can be plain text, JSON, or any string content

## Example Requests

### Example 1: Send to Design Briefs
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/ \
  -H "Content-Type: text/plain" \
  -H "category: design-brief" \
  -d "New design brief: Create responsive landing page for Q1 campaign"
```

### Example 2: Send to Build Tasks
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/ \
  -H "Content-Type: application/json" \
  -H "category: build" \
  -d '{"task": "Fix mobile navigation bug", "priority": "high", "due": "2024-01-15"}'
```

### Example 3: Send to Mission Control
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/ \
  -H "Content-Type: text/plain" \
  -H "category: mission" \
  -d "Weekly update: Project X is 75% complete, on track for Q1 delivery"
```

### Example 4: Send to Bug Tracker
```bash
curl -X POST https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/ \
  -H "Content-Type: application/json" \
  -H "category: bug" \
  -d '{
    "title": "Urge support state buttons missing",
    "severity": "high",
    "description": "Morning reveal page not showing stable/struggling buttons",
    "affected_files": ["app/urge/reveal/page.tsx"]
  }'
```

## Technical Requirements

### Error Handling
- Handle network timeouts (webhook may take a few seconds to process)
- Implement retry logic for failed requests
- Validate category headers before sending
- Support both plain text and JSON payloads
- Log successful sends and failures

### Category Validation
Ensure only valid category values are used:
- `mission`
- `design-brief`
- `build`
- `design-system`
- `content`
- `bug`

## Node.js Implementation

```typescript
// lib/webhook/notion-router.ts

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/25305749/usjq2yq/';

type NotionCategory = 'mission' | 'design-brief' | 'build' | 'design-system' | 'content' | 'bug';

interface WebhookPayload {
  category: NotionCategory;
  content: string | object;
}

async function sendToNotion(payload: WebhookPayload): Promise<boolean> {
  const { category, content } = payload;

  // Validate category
  const validCategories: NotionCategory[] = ['mission', 'design-brief', 'build', 'design-system', 'content', 'bug'];
  if (!validCategories.includes(category)) {
    throw new Error(`Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}`);
  }

  const body = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': typeof content === 'string' ? 'text/plain' : 'application/json',
        'category': category,
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log(`✅ Sent to ${category}: ${body.substring(0, 50)}...`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send to ${category}:`, error);
    return false;
  }
}

// Retry logic
async function sendToNotionWithRetry(payload: WebhookPayload, maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await sendToNotion(payload);
      if (success) return true;
    } catch (error) {
      console.log(`Attempt ${attempt}/${maxRetries} failed, retrying...`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
      }
    }
  }
  return false;
}

// Batch sender
async function sendBatch(payloads: WebhookPayload[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const payload of payloads) {
    const result = await sendToNotionWithRetry(payload);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

export { sendToNotion, sendToNotionWithRetry, sendBatch };
export type { NotionCategory, WebhookPayload };
```

## Usage Examples

### Mission Control Updates
```typescript
await sendToNotion({
  category: 'mission',
  content: 'Urge support state buttons fixed and tested. Ready for deployment.'
});
```

### Bug Reports
```typescript
await sendToNotion({
  category: 'bug',
  content: {
    title: 'Test failures in urge-support.spec.ts',
    severity: 'high',
    status: 'fixed',
    files: ['app/urge/reveal/page.tsx'],
    solution: 'Updated state buttons to match test expectations'
  }
});
```

### Build Tasks
```typescript
await sendToNotion({
  category: 'build',
  content: {
    task: 'Deploy urge support fixes to production',
    priority: 'high',
    branch: 'claude/fix-urge-support-state-buttons-011CV22kHSxGvE6eCwTrSyZ2',
    assignee: 'Sancho'
  }
});
```

### Design Briefs
```typescript
await sendToNotion({
  category: 'design-brief',
  content: 'Morning reveal flow needs visual refresh. Current buttons: "I\'m Good - Feeling Stable" and "Still Struggling - Need Support".'
});
```

### Content Library
```typescript
await sendToNotion({
  category: 'content',
  content: 'Documentation updated: Zapier webhook integration guide added to project.'
});
```

## Integration with Git Workflow

```typescript
// Example: Send commit summaries to Mission Control
import { execSync } from 'child_process';

async function sendGitSummary() {
  const lastCommit = execSync('git log -1 --pretty=format:"%h - %s"').toString();
  const branch = execSync('git branch --show-current').toString().trim();

  await sendToNotion({
    category: 'mission',
    content: `**Git Update**\nBranch: ${branch}\nCommit: ${lastCommit}`
  });
}
```

## Troubleshooting

### "Access denied" Error
- Check that the webhook URL is correct
- Verify the category header is included
- Ensure content is properly formatted

### Timeout Issues
- Webhook may take 3-5 seconds to process
- Use retry logic with exponential backoff
- Check Zapier task history for errors

### Content Not Appearing in Notion
- Verify the category header matches exactly (case-sensitive)
- Check Zapier Zap is turned on
- Review Zapier task history for routing issues

## Sancho Integration Notes

When reporting test results or deployment status, use this format:

```typescript
// Test completion report
await sendToNotion({
  category: 'mission',
  content: `**Test Report: Urge Support Flow**

✅ Implementation: State buttons updated
✅ Tests: All passing
✅ Branch: claude/fix-urge-support-state-buttons-011CV22kHSxGvE6eCwTrSyZ2
📊 Files changed: 1
🔧 Lines modified: 64 insertions, 204 deletions

Ready for review and deployment.`
});
```

---

**Last Updated:** 2025-11-11
**Maintained by:** Sancho (Claude Code)
