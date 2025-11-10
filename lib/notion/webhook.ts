/**
 * Notion Webhook Router
 * Routes updates to different Notion pages via Zapier webhook
 *
 * Usage:
 * import { notionWebhook } from '@/lib/notion/webhook';
 * await notionWebhook.buildTask('Fix mining bug', 'high');
 */

type NotionCategory = 'mission' | 'design-brief' | 'build' | 'design-system' | 'content' | 'bug';

interface WebhookPayload {
  [key: string]: any;
}

class NotionWebhookRouter {
  private webhookUrl: string;

  constructor() {
    // Get webhook URL from environment variable
    this.webhookUrl = process.env.NOTION_WEBHOOK_URL || '';

    if (!this.webhookUrl && process.env.NODE_ENV !== 'test') {
      console.warn('NOTION_WEBHOOK_URL not configured. Notion updates will be skipped.');
    }
  }

  /**
   * Send data to specific Notion category
   */
  private async sendToCategory(category: NotionCategory, data: WebhookPayload): Promise<boolean> {
    if (!this.webhookUrl) {
      console.log(`[Notion] Skipped ${category} update (webhook not configured)`);
      return false;
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'category': category,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error(`[Notion] Failed to send to ${category}:`, response.statusText);
        return false;
      }

      console.log(`[Notion] ✓ Sent to ${category}`);
      return true;
    } catch (error) {
      console.error(`[Notion] Error sending to ${category}:`, error);
      return false;
    }
  }

  /**
   * Update Mission Control
   */
  async missionControl(title: string, content: string) {
    return this.sendToCategory('mission', {
      title,
      content,
    });
  }

  /**
   * Create Design Brief
   */
  async designBrief(projectName: string, requirements: string) {
    return this.sendToCategory('design-brief', {
      project: projectName,
      requirements,
      status: 'pending',
    });
  }

  /**
   * Create Build Task
   *
   * Status flow: Ready → In Progress → Testing → Done
   */
  async buildTask(
    task: string,
    status: 'Ready' | 'In Progress' | 'Testing' | 'Done' = 'Ready',
    details?: {
      priority?: 'Low' | 'Medium' | 'High' | 'Critical';
      filesModified?: string[];
      filesCreated?: string[];
      commit?: string;
      notes?: string;
    }
  ) {
    return this.sendToCategory('build', {
      task,
      status,
      priority: details?.priority || 'Medium',
      files_modified: details?.filesModified?.join(', '),
      files_created: details?.filesCreated?.join(', '),
      commit_hash: details?.commit,
      notes: details?.notes,
    });
  }

  /**
   * Update Design System
   */
  async designSystem(component: string, status: 'Implemented' | 'In Progress' | 'Planned', notes?: string) {
    return this.sendToCategory('design-system', {
      component,
      status,
      notes,
    });
  }

  /**
   * Add to Content Library
   */
  async contentLibrary(title: string, content: string, tags: string[] = []) {
    return this.sendToCategory('content', {
      title,
      content,
      tags: tags.join(', '),
    });
  }

  /**
   * Report Bug
   *
   * Status flow: New → In Progress → Fixed → Verified
   */
  async bugReport(
    description: string,
    severity: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium',
    details?: {
      status?: 'New' | 'In Progress' | 'Fixed' | 'Verified';
      file?: string;
      reproduction?: string;
      commit?: string;
    }
  ) {
    return this.sendToCategory('bug', {
      description,
      severity,
      status: details?.status || 'New',
      file: details?.file,
      reproduction_steps: details?.reproduction,
      fix_commit: details?.commit,
    });
  }

  /**
   * Sancho Reporting Protocol - Task Started
   */
  async taskStarted(taskName: string, notes?: string) {
    return this.buildTask(taskName, 'In Progress', {
      notes: `Started ${new Date().toLocaleString()}\n${notes || ''}`,
    });
  }

  /**
   * Sancho Reporting Protocol - Task Completed
   */
  async taskCompleted(
    taskName: string,
    implementationNotes: {
      filesCreated?: string[];
      filesModified?: string[];
      commit?: string;
      buildStatus: 'success' | 'warnings' | 'errors';
      notes?: string;
    }
  ) {
    const notesSummary = [
      `Completed ${new Date().toLocaleString()}`,
      '',
      'Implementation Notes:',
      implementationNotes.filesCreated?.length
        ? `- Files created: ${implementationNotes.filesCreated.join(', ')}`
        : null,
      implementationNotes.filesModified?.length
        ? `- Files modified: ${implementationNotes.filesModified.join(', ')}`
        : null,
      implementationNotes.commit
        ? `- Commit: ${implementationNotes.commit}`
        : null,
      `- Build status: ${implementationNotes.buildStatus}`,
      implementationNotes.notes ? `\n${implementationNotes.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return this.buildTask(taskName, 'Testing', {
      filesCreated: implementationNotes.filesCreated,
      filesModified: implementationNotes.filesModified,
      commit: implementationNotes.commit,
      notes: notesSummary,
    });
  }

  /**
   * Sancho Reporting Protocol - Task Blocked
   */
  async taskBlocked(taskName: string, blocker: string, needsInput?: string) {
    return this.buildTask(taskName, 'In Progress', {
      priority: 'High',
      notes: `❌ BLOCKED\n\nBlocker: ${blocker}\n${needsInput ? `Need Watson's input on: ${needsInput}` : ''}`,
    });
  }

  /**
   * Batch update multiple items
   */
  async batchUpdate(updates: Array<{ category: NotionCategory; data: WebhookPayload }>) {
    const results = await Promise.allSettled(
      updates.map(({ category, data }) => this.sendToCategory(category, data))
    );

    const successful = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    console.log(`[Notion] Batch update: ${successful}/${updates.length} successful`);

    return { successful, total: updates.length };
  }
}

// Export singleton instance
export const notionWebhook = new NotionWebhookRouter();

// Export types
export type { NotionCategory, WebhookPayload };
