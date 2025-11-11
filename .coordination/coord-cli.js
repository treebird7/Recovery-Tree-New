#!/usr/bin/env node

/**
 * Coordination CLI - Helper script for managing multi-agent orchestration
 *
 * Usage:
 *   node .coordination/coord-cli.js status
 *   node .coordination/coord-cli.js queue
 *   node .coordination/coord-cli.js handoffs
 *   node .coordination/coord-cli.js agent <agent-name>
 *   node .coordination/coord-cli.js mytask
 *
 * Or add to package.json scripts:
 *   "coord": "node .coordination/coord-cli.js"
 * Then use: npm run coord status
 */

const fs = require('fs');
const path = require('path');

const COORD_DIR = path.join(__dirname);
const FILES = {
  context: path.join(COORD_DIR, 'COORDINATOR_CONTEXT.md'),
  queue: path.join(COORD_DIR, 'WORK_QUEUE.md'),
  handoffs: path.join(COORD_DIR, 'AGENT_HANDOFFS.md'),
  decisions: path.join(COORD_DIR, 'DECISIONS_LOG.md'),
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(colorize(`Error reading ${filePath}:`, 'red'), error.message);
    process.exit(1);
  }
}

function parseTaskStatus(content) {
  const tasks = {
    ready: [],
    inProgress: [],
    blocked: [],
    completed: [],
  };

  const taskRegex = /### Task #(\d+): (.+?)\n\*\*Status\*\*: (.*?)\n/gs;
  let match;

  while ((match = taskRegex.exec(content)) !== null) {
    const [, number, title, status] = match;
    const task = { number, title, status: status.trim() };

    if (status.includes('✅') || status.includes('Completed')) {
      tasks.completed.push(task);
    } else if (status.includes('⏳') || status.includes('In Progress')) {
      tasks.inProgress.push(task);
    } else if (status.includes('🔴') || status.includes('Blocked')) {
      tasks.blocked.push(task);
    } else if (status.includes('🟢') || status.includes('Ready')) {
      tasks.ready.push(task);
    }
  }

  return tasks;
}

function showStatus() {
  console.log(colorize('\n🎯 Project Status\n', 'bright'));

  const content = readFile(FILES.context);

  // Extract key sections
  const goalMatch = content.match(/\*\*Goal\*\*: (.+)/);
  const statusMatch = content.match(/\*\*Status\*\*: (.+)/);
  const blockersMatch = content.match(/\*\*Blockers\*\*: (.+)/);

  if (goalMatch) {
    console.log(colorize('Goal: ', 'cyan') + goalMatch[1]);
  }

  if (statusMatch) {
    const status = statusMatch[1];
    const color = status.includes('Healthy') ? 'green' :
                  status.includes('Warning') ? 'yellow' : 'red';
    console.log(colorize('Status: ', 'cyan') + colorize(status, color));
  }

  if (blockersMatch) {
    const blockers = blockersMatch[1];
    const color = blockers.includes('None') ? 'green' : 'red';
    console.log(colorize('Blockers: ', 'cyan') + colorize(blockers, color));
  }

  // Show active work streams
  const streamRegex = /### Stream (.+?)\n- \*\*Status\*\*: (.+?)\n/g;
  let streamMatch;
  const streams = [];

  while ((streamMatch = streamRegex.exec(content)) !== null) {
    streams.push({
      name: streamMatch[1].split('(')[0].trim(),
      status: streamMatch[2],
    });
  }

  if (streams.length > 0) {
    console.log(colorize('\n📊 Active Work Streams:\n', 'bright'));
    streams.forEach(stream => {
      const statusIcon = stream.status.includes('Not started') ? '⏸️ ' :
                        stream.status.includes('progress') ? '⏳ ' :
                        stream.status.includes('ready') ? '✅ ' : '';
      console.log(`  ${statusIcon}${stream.name}: ${colorize(stream.status, 'gray')}`);
    });
  }

  console.log('\n');
}

function showQueue() {
  console.log(colorize('\n📋 Work Queue\n', 'bright'));

  const content = readFile(FILES.queue);
  const tasks = parseTaskStatus(content);

  const total = tasks.ready.length + tasks.inProgress.length +
                tasks.blocked.length + tasks.completed.length;

  console.log(colorize('Summary:', 'cyan'));
  console.log(`  Total Tasks: ${total}`);
  console.log(colorize(`  🟢 Ready: ${tasks.ready.length}`, 'green'));
  console.log(colorize(`  ⏳ In Progress: ${tasks.inProgress.length}`, 'yellow'));
  console.log(colorize(`  🔴 Blocked: ${tasks.blocked.length}`, 'red'));
  console.log(colorize(`  ✅ Completed: ${tasks.completed.length}`, 'gray'));

  if (tasks.ready.length > 0) {
    console.log(colorize('\n🟢 Ready to Start:\n', 'green'));
    tasks.ready.forEach(task => {
      console.log(`  #${task.number}: ${task.title}`);
    });
  }

  if (tasks.inProgress.length > 0) {
    console.log(colorize('\n⏳ In Progress:\n', 'yellow'));
    tasks.inProgress.forEach(task => {
      console.log(`  #${task.number}: ${task.title}`);
    });
  }

  if (tasks.blocked.length > 0) {
    console.log(colorize('\n🔴 Blocked:\n', 'red'));
    tasks.blocked.forEach(task => {
      console.log(`  #${task.number}: ${task.title}`);
    });
  }

  console.log('\n');
}

function showHandoffs() {
  console.log(colorize('\n🔄 Active Handoffs\n', 'bright'));

  const content = readFile(FILES.handoffs);

  const handoffRegex = /#### (.+?) → (.+?)\n\*\*Status\*\*: (.+?)\n/g;
  let match;
  const handoffs = [];

  while ((match = handoffRegex.exec(content)) !== null) {
    handoffs.push({
      from: match[1],
      to: match[2],
      status: match[3].trim(),
    });
  }

  if (handoffs.length === 0) {
    console.log(colorize('  No active handoffs', 'gray'));
  } else {
    handoffs.forEach(h => {
      const statusColor = h.status.includes('✅') ? 'green' :
                         h.status.includes('⏸️') ? 'yellow' : 'gray';
      console.log(`  ${h.from} ${colorize('→', 'cyan')} ${h.to}: ${colorize(h.status, statusColor)}`);
    });
  }

  console.log('\n');
}

function showAgentInfo(agentName) {
  const agentFile = path.join(COORD_DIR, 'agents', `${agentName.toUpperCase()}_AGENT.md`);

  if (!fs.existsSync(agentFile)) {
    console.error(colorize(`\nAgent "${agentName}" not found.\n`, 'red'));
    console.log('Available agents: frontend, backend, db, ai, qa\n');
    process.exit(1);
  }

  const content = readFile(agentFile);

  // Extract key sections
  const missionMatch = content.match(/## 🎯 Your Mission\n\n(.+?)(?=\n##)/s);
  const responsibilitiesMatch = content.match(/\*\*Primary\*\*:\n((?:- .+\n)+)/);

  console.log(colorize(`\n🤖 ${agentName.toUpperCase()} Agent\n`, 'bright'));

  if (missionMatch) {
    console.log(colorize('Mission:', 'cyan'));
    console.log(missionMatch[1].trim().split('\n').map(line => `  ${line}`).join('\n'));
  }

  if (responsibilitiesMatch) {
    console.log(colorize('\nResponsibilities:', 'cyan'));
    const responsibilities = responsibilitiesMatch[1].trim().split('\n');
    responsibilities.forEach(resp => {
      console.log(`  ${resp}`);
    });
  }

  // Find tasks for this agent in work queue
  const queueContent = readFile(FILES.queue);
  const agentTaskRegex = new RegExp(`### Task #(\\d+): (.+?)\\n\\*\\*Agent\\*\\*: ${agentName} Agent\\n\\*\\*Status\\*\\*: (.+?)\\n`, 'gis');
  let taskMatch;
  const agentTasks = [];

  while ((taskMatch = agentTaskRegex.exec(queueContent)) !== null) {
    agentTasks.push({
      number: taskMatch[1],
      title: taskMatch[2],
      status: taskMatch[3].trim(),
    });
  }

  if (agentTasks.length > 0) {
    console.log(colorize('\nYour Tasks:', 'cyan'));
    agentTasks.forEach(task => {
      const statusColor = task.status.includes('Ready') ? 'green' :
                         task.status.includes('Progress') ? 'yellow' :
                         task.status.includes('Blocked') ? 'red' : 'gray';
      console.log(`  #${task.number}: ${task.title} - ${colorize(task.status, statusColor)}`);
    });
  } else {
    console.log(colorize('\nYour Tasks:', 'cyan'));
    console.log(colorize('  No tasks currently assigned', 'gray'));
  }

  console.log(`\n${colorize('Full guide:', 'cyan')} .coordination/agents/${agentName.toUpperCase()}_AGENT.md\n`);
}

function showMyTask() {
  console.log(colorize('\n🎯 Finding Your Task...\n', 'bright'));

  // This is a simplified version - in practice, you might determine
  // the current agent context from environment or git branch
  console.log('To use this feature:');
  console.log('1. Set AGENT_ROLE environment variable:');
  console.log(colorize('   export AGENT_ROLE=frontend', 'cyan'));
  console.log('2. Or specify agent: npm run coord agent frontend');
  console.log('\n');
}

function showHelp() {
  console.log(colorize('\n🤖 Coordination CLI\n', 'bright'));
  console.log('Helper tool for multi-agent orchestration\n');
  console.log(colorize('Commands:', 'cyan'));
  console.log('  status       Show project status and active work');
  console.log('  queue        Show work queue with all tasks');
  console.log('  handoffs     Show active handoffs between agents');
  console.log('  agent <name> Show info and tasks for specific agent');
  console.log('  mytask       Show your current task (requires AGENT_ROLE env var)');
  console.log('  help         Show this help message');
  console.log('\n' + colorize('Examples:', 'cyan'));
  console.log('  node .coordination/coord-cli.js status');
  console.log('  node .coordination/coord-cli.js agent frontend');
  console.log('\n' + colorize('Available Agents:', 'cyan'));
  console.log('  frontend, backend, db, ai, qa');
  console.log('\n');
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'status':
    showStatus();
    break;
  case 'queue':
    showQueue();
    break;
  case 'handoffs':
    showHandoffs();
    break;
  case 'agent':
    if (!arg) {
      console.error(colorize('\nError: Please specify an agent name\n', 'red'));
      console.log('Usage: node coord-cli.js agent <name>');
      console.log('Available: frontend, backend, db, ai, qa\n');
      process.exit(1);
    }
    showAgentInfo(arg);
    break;
  case 'mytask':
    showMyTask();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
