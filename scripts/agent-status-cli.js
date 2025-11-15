#!/usr/bin/env node
/**
 * Agent Status CLI Tool
 * Usage from terminal to coordinate with other Claude Code agents
 *
 * Examples:
 *   node scripts/agent-status-cli.js update "Fixing auth bug" working
 *   node scripts/agent-status-cli.js list
 *   node scripts/agent-status-cli.js branch main
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get current branch
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current').toString().trim();
  } catch {
    return 'unknown';
  }
}

// Get session ID (stored in temp file or create new)
const os = require('os');
const path = require('path');
const fs = require('fs');

const SESSION_FILE = path.join(os.tmpdir(), 'claude-agent-session.txt');

function getSessionId() {
  if (fs.existsSync(SESSION_FILE)) {
    return fs.readFileSync(SESSION_FILE, 'utf8').trim();
  }
  const newSession = `terminal-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  fs.writeFileSync(SESSION_FILE, newSession);
  return newSession;
}

const sessionId = getSessionId();
const branchName = getCurrentBranch();

// Commands
const commands = {
  async update(task, status = 'working') {
    const { error } = await supabase.from('agent_status').upsert({
      session_id: sessionId,
      branch_name: branchName,
      agent_type: 'terminal',
      current_task: task,
      status,
      details: {},
    });

    if (error) {
      console.error('❌ Failed to update:', error.message);
      return;
    }

    console.log(`✅ Status updated: ${status} - ${task}`);
    console.log(`   Session: ${sessionId}`);
    console.log(`   Branch: ${branchName}`);
  },

  async list() {
    const { data, error } = await supabase
      .from('active_agents')
      .select('*');

    if (error) {
      console.error('❌ Failed to fetch:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log('📭 No active agents');
      return;
    }

    console.log('\n🤖 Active Agents:\n');
    data.forEach((agent, i) => {
      const isSelf = agent.session_id === sessionId;
      const prefix = isSelf ? '👉' : '  ';
      const timeSince = Math.round(agent.seconds_since_update || 0);

      console.log(`${prefix} ${i + 1}. [${agent.agent_type}] ${agent.branch_name}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Task: ${agent.current_task || 'none'}`);
      console.log(`   Updated: ${timeSince}s ago`);
      if (isSelf) console.log(`   (This is you)`);
      console.log('');
    });
  },

  async branch(targetBranch) {
    const { data, error } = await supabase
      .from('active_agents')
      .select('*')
      .eq('branch_name', targetBranch);

    if (error) {
      console.error('❌ Failed to fetch:', error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`📭 No active agents on branch: ${targetBranch}`);
      return;
    }

    console.log(`\n🤖 Agents on branch "${targetBranch}":\n`);
    data.forEach((agent, i) => {
      const timeSince = Math.round(agent.seconds_since_update || 0);
      console.log(`  ${i + 1}. [${agent.agent_type}]`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Task: ${agent.current_task || 'none'}`);
      console.log(`   Updated: ${timeSince}s ago`);
      console.log('');
    });
  },

  async complete() {
    await commands.update('Task completed', 'completed');
  },

  async blocked(reason) {
    await commands.update(reason || 'Blocked', 'blocked');
  },

  async cleanup() {
    const { error } = await supabase
      .from('agent_status')
      .delete()
      .eq('session_id', sessionId);

    if (error) {
      console.error('❌ Failed to cleanup:', error.message);
      return;
    }

    console.log('✅ Session cleaned up');
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
    }
  },

  help() {
    console.log(`
🤖 Agent Status CLI - Coordinate with other Claude Code agents

Usage:
  node scripts/agent-status-cli.js <command> [args]

Commands:
  update <task> [status]   Update your status (default: working)
  list                     List all active agents
  branch <name>            List agents on specific branch
  complete                 Mark current task as completed
  blocked <reason>         Mark yourself as blocked
  cleanup                  Remove your session
  help                     Show this help

Examples:
  node scripts/agent-status-cli.js update "Fixing auth bug" working
  node scripts/agent-status-cli.js list
  node scripts/agent-status-cli.js branch main
  node scripts/agent-status-cli.js complete
  node scripts/agent-status-cli.js cleanup

Your session: ${sessionId}
Your branch: ${branchName}
`);
  },
};

// Parse command
const [,, command, ...args] = process.argv;

if (!command || !commands[command]) {
  commands.help();
  process.exit(0);
}

// Run command
commands[command](...args)
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
