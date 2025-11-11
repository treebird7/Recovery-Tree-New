/**
 * Test Notion Webhook Integration
 *
 * Run: npx tsx scripts/test-notion-webhook.ts
 */

import { notionWebhook } from '../lib/notion/webhook';

async function testWebhook() {
  console.log('🧪 Testing Notion webhook integration...\n');

  // Test 1: Mission Control
  console.log('📝 Test 1: Mission Control update');
  const test1 = await notionWebhook.missionControl(
    'Webhook Integration Test',
    'Testing automated Notion updates from Recovery Tree'
  );
  console.log(test1 ? '✅ Success' : '❌ Failed', '\n');

  // Test 2: Build Task
  console.log('📝 Test 2: Build task creation');
  const test2 = await notionWebhook.buildTask(
    'Test task from webhook system',
    'Testing',
    {
      priority: 'Low',
      notes: 'This is an automated test. You can delete this task.'
    }
  );
  console.log(test2 ? '✅ Success' : '❌ Failed', '\n');

  // Test 3: Bug Report
  console.log('📝 Test 3: Bug report');
  const test3 = await notionWebhook.bugReport(
    'Test bug report - can be deleted',
    'Low',
    {
      status: 'New',
      file: 'scripts/test-notion-webhook.ts'
    }
  );
  console.log(test3 ? '✅ Success' : '❌ Failed', '\n');

  console.log('🎉 Webhook testing complete!');
  console.log('📋 Check your Notion to verify the updates appeared:');
  console.log('   - Mission Control: Should have "Webhook Integration Test"');
  console.log('   - Build Tasks: Should have "Test task from webhook system"');
  console.log('   - Bug Tracker: Should have "Test bug report - can be deleted"');
}

testWebhook().catch(console.error);
