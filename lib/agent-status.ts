/**
 * Agent Status Coordination System
 * Allows Claude Code agents on different branches to share their current status
 *
 * Works from:
 * - Claude Code Web
 * - VSCode
 * - Terminal/CLI
 */

import { createClient } from '@supabase/supabase-js';

// Types
export type AgentType = 'claude-code-web' | 'vscode' | 'terminal' | 'other';
export type AgentStatus = 'idle' | 'working' | 'blocked' | 'completed';

export interface AgentStatusEntry {
  session_id: string;
  branch_name: string;
  agent_type: AgentType;
  current_task?: string;
  status: AgentStatus;
  details?: Record<string, any>;
  last_updated?: string;
  created_at?: string;
}

/**
 * Simple agent status client that works everywhere
 */
export class AgentStatusClient {
  private supabase;
  private sessionId: string;
  private branchName: string;
  private agentType: AgentType;

  constructor(config: {
    supabaseUrl: string;
    supabaseKey: string;
    sessionId?: string;
    branchName?: string;
    agentType?: AgentType;
  }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.sessionId = config.sessionId || this.generateSessionId();
    this.branchName = config.branchName || 'unknown';
    this.agentType = config.agentType || 'other';
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Update your agent's status
   */
  async updateStatus(
    status: AgentStatus,
    currentTask?: string,
    details?: Record<string, any>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agent_status')
        .upsert({
          session_id: this.sessionId,
          branch_name: this.branchName,
          agent_type: this.agentType,
          current_task: currentTask,
          status,
          details: details || {},
        });

      if (error) {
        console.error('[AgentStatus] Update failed:', error);
        return false;
      }

      console.log(`[AgentStatus] Updated: ${status} - ${currentTask || 'no task'}`);
      return true;
    } catch (err) {
      console.error('[AgentStatus] Error:', err);
      return false;
    }
  }

  /**
   * Get all active agents (updated in last 10 minutes)
   */
  async getActiveAgents(): Promise<AgentStatusEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('active_agents')
        .select('*');

      if (error) {
        console.error('[AgentStatus] Read failed:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[AgentStatus] Error:', err);
      return [];
    }
  }

  /**
   * Get agents on a specific branch
   */
  async getAgentsOnBranch(branchName: string): Promise<AgentStatusEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('active_agents')
        .select('*')
        .eq('branch_name', branchName);

      if (error) {
        console.error('[AgentStatus] Read failed:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[AgentStatus] Error:', err);
      return [];
    }
  }

  /**
   * Get all agents except yourself
   */
  async getOtherAgents(): Promise<AgentStatusEntry[]> {
    try {
      const { data, error } = await this.supabase
        .from('active_agents')
        .select('*')
        .neq('session_id', this.sessionId);

      if (error) {
        console.error('[AgentStatus] Read failed:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('[AgentStatus] Error:', err);
      return [];
    }
  }

  /**
   * Mark yourself as completed and idle
   */
  async markComplete(): Promise<boolean> {
    return this.updateStatus('completed', 'Task completed');
  }

  /**
   * Mark yourself as blocked
   */
  async markBlocked(reason: string): Promise<boolean> {
    return this.updateStatus('blocked', reason);
  }

  /**
   * Remove your session when done
   */
  async cleanup(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('agent_status')
        .delete()
        .eq('session_id', this.sessionId);

      if (error) {
        console.error('[AgentStatus] Cleanup failed:', error);
        return false;
      }

      console.log('[AgentStatus] Session cleaned up');
      return true;
    } catch (err) {
      console.error('[AgentStatus] Error:', err);
      return false;
    }
  }
}

/**
 * Helper function to create a client from environment variables
 */
export function createAgentStatusClient(overrides?: {
  sessionId?: string;
  branchName?: string;
  agentType?: AgentType;
}): AgentStatusClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[AgentStatus] Supabase credentials not found');
    return null;
  }

  return new AgentStatusClient({
    supabaseUrl,
    supabaseKey,
    ...overrides,
  });
}
