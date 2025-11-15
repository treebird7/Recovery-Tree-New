/**
 * Example Usage: Agent Status Coordination
 *
 * This shows how to use the agent status system in different contexts
 */

import { createAgentStatusClient, AgentStatusClient } from '@/lib/agent-status';

/**
 * Example 1: Basic usage in a Claude Code session
 */
async function exampleBasicUsage() {
  // Create client (auto-picks up env vars)
  const agent = createAgentStatusClient({
    sessionId: 'claude-web-abc123',
    branchName: 'feature/auth',
    agentType: 'claude-code-web'
  });

  if (!agent) {
    console.error('Failed to create agent client');
    return;
  }

  // Start working
  await agent.updateStatus('working', 'Implementing user login');

  // Later: check what others are doing
  const others = await agent.getOtherAgents();
  console.log('Other agents:', others);

  // Complete task
  await agent.markComplete();

  // Clean up
  await agent.cleanup();
}

/**
 * Example 2: Coordinating work across branches
 */
async function exampleCrossbranchCoordination() {
  const agent = createAgentStatusClient({
    sessionId: 'vscode-xyz789',
    branchName: 'feature/ui-redesign',
    agentType: 'vscode'
  });

  if (!agent) return;

  // Check if anyone else is working on main branch
  const agentsOnMain = await agent.getAgentsOnBranch('main');

  if (agentsOnMain.length > 0) {
    console.log('⚠️  Warning: Someone is working on main branch');
    agentsOnMain.forEach(a => {
      console.log(`  - ${a.agent_type}: ${a.current_task}`);
    });
  }

  // Update your status
  await agent.updateStatus('working', 'Redesigning dashboard component');
}

/**
 * Example 3: Blocking scenario
 */
async function exampleBlockedWorkflow() {
  const agent = createAgentStatusClient({
    sessionId: 'terminal-session-1',
    branchName: 'feature/api-integration',
    agentType: 'terminal'
  });

  if (!agent) return;

  // Start working
  await agent.updateStatus('working', 'Integrating external API');

  // Discover you're blocked
  await agent.markBlocked('Waiting for API credentials from DevOps');

  // Later: check if anyone can help
  const allAgents = await agent.getActiveAgents();
  const activeAgents = allAgents.filter(a => a.status === 'working');

  console.log(`${activeAgents.length} agents currently working`);

  // Unblock and continue
  await agent.updateStatus('working', 'API credentials received, continuing integration');
}

/**
 * Example 4: Using in an API route or server function
 */
export async function exampleInApiRoute() {
  // In a Next.js API route
  const agent = createAgentStatusClient({
    sessionId: 'api-background-job',
    branchName: 'production', // or get from git
    agentType: 'other'
  });

  if (!agent) {
    return { error: 'Agent status not available' };
  }

  await agent.updateStatus('working', 'Processing background job batch-123');

  try {
    // Do work...
    await processBackgroundJob();

    await agent.markComplete();
    return { success: true };
  } catch (error) {
    await agent.markBlocked(`Error: ${error}`);
    return { error: String(error) };
  } finally {
    await agent.cleanup();
  }
}

/**
 * Example 5: Monitoring all agents (dashboard view)
 */
async function exampleDashboard() {
  const agent = createAgentStatusClient({
    sessionId: 'monitor',
    branchName: 'main',
    agentType: 'other'
  });

  if (!agent) return;

  const allAgents = await agent.getActiveAgents();

  console.log('\n🤖 Agent Status Dashboard\n');
  console.log('━'.repeat(60));

  // Group by status
  const byStatus = allAgents.reduce((acc, agent) => {
    acc[agent.status] = acc[agent.status] || [];
    acc[agent.status].push(agent);
    return acc;
  }, {} as Record<string, typeof allAgents>);

  // Display summary
  console.log(`Total active agents: ${allAgents.length}`);
  console.log(`  Working: ${byStatus.working?.length || 0}`);
  console.log(`  Blocked: ${byStatus.blocked?.length || 0}`);
  console.log(`  Completed: ${byStatus.completed?.length || 0}`);
  console.log(`  Idle: ${byStatus.idle?.length || 0}`);
  console.log('');

  // Show blocked agents (need attention)
  if (byStatus.blocked?.length > 0) {
    console.log('⚠️  BLOCKED AGENTS:');
    byStatus.blocked.forEach(a => {
      console.log(`  [${a.branch_name}] ${a.current_task}`);
    });
    console.log('');
  }

  // Show working agents
  if (byStatus.working?.length > 0) {
    console.log('🔨 WORKING:');
    byStatus.working.forEach(a => {
      console.log(`  [${a.branch_name}] ${a.current_task}`);
    });
  }
}

/**
 * Example 6: With additional metadata
 */
async function exampleWithMetadata() {
  const agent = createAgentStatusClient({
    sessionId: 'detailed-session',
    branchName: 'feature/complex-task',
    agentType: 'claude-code-web'
  });

  if (!agent) return;

  // Add custom details
  await agent.updateStatus('working', 'Refactoring authentication system', {
    filesModified: ['auth/login.ts', 'auth/session.ts'],
    linesChanged: 234,
    testStatus: 'passing',
    estimatedCompletion: '30 minutes',
    dependencies: ['feature/api-refactor']
  });

  // Later, other agents can read these details
  const agents = await agent.getActiveAgents();
  agents.forEach(a => {
    if (a.details) {
      console.log(`Agent on ${a.branch_name}:`);
      console.log(`  Files: ${a.details.filesModified?.join(', ')}`);
      console.log(`  Dependencies: ${a.details.dependencies?.join(', ')}`);
    }
  });
}

// Mock function for example
async function processBackgroundJob() {
  // Implementation...
}

// Export examples
export {
  exampleBasicUsage,
  exampleCrossbranchCoordination,
  exampleBlockedWorkflow,
  exampleDashboard,
  exampleWithMetadata
};
