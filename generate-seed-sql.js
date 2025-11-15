// Quick script to generate SQL INSERT statements from Watson's JSON
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('20251112_Step_Questions_Database_Import.json', 'utf8'));

const questions = [
  ...data.step_1_questions,
  ...data.step_2_questions,
  ...data.step_3_questions,
];

console.log('-- Seed script for step_questions table');
console.log('-- Generated from 20251112_Step_Questions_Database_Import.json');
console.log(`-- Total questions: ${questions.length}`);
console.log('-- Run this in Supabase SQL Editor\n');

console.log('-- Temporarily disable RLS for seeding');
console.log('ALTER TABLE step_questions DISABLE ROW LEVEL SECURITY;\n');

console.log('-- Insert all questions');
console.log('INSERT INTO step_questions (');
console.log('  id, step_number, phase, phase_title, question_order,');
console.log('  question_text, question_type, is_required, follow_up_type,');
console.log('  follow_up_text, conditional_follow_up, safety_flag,');
console.log('  completion_marker, data_logging, is_active');
console.log(') VALUES');

questions.forEach((q, index) => {
  const id = q.id;
  const step_number = q.step_number;
  const phase = q.phase.replace(/'/g, "''");
  const phase_title = q.phase_title.replace(/'/g, "''");
  const question_order = q.question_order;
  const question_text = q.question_text.replace(/'/g, "''");
  const question_type = q.question_type;
  const is_required = q.is_required !== false;
  const follow_up_type = q.follow_up_type || null;
  const follow_up_text = q.follow_up_text ? `'${q.follow_up_text.replace(/'/g, "''")}'` : 'NULL';
  const conditional_follow_up = q.conditional_follow_up ? `'${JSON.stringify(q.conditional_follow_up).replace(/'/g, "''")}'::jsonb` : 'NULL';
  const safety_flag = q.safety_flag || false;
  const completion_marker = q.completion_marker || false;
  const data_logging = q.data_logging ? `ARRAY[${q.data_logging.map(d => `'${d}'`).join(', ')}]` : 'ARRAY[]::text[]';
  const is_active = q.is_active !== false;

  const comma = index < questions.length - 1 ? ',' : ';';

  console.log(`  ('${id}', ${step_number}, '${phase}', '${phase_title}', ${question_order},`);
  console.log(`   '${question_text}',`);
  console.log(`   '${question_type}', ${is_required}, ${follow_up_type ? `'${follow_up_type}'` : 'NULL'},`);
  console.log(`   ${follow_up_text}, ${conditional_follow_up}, ${safety_flag},`);
  console.log(`   ${completion_marker}, ${data_logging}, ${is_active})${comma}`);
});

console.log('\n-- Re-enable RLS after seeding');
console.log('ALTER TABLE step_questions ENABLE ROW LEVEL SECURITY;');

console.log('\n-- Verify the seed');
console.log('SELECT step_number, COUNT(*) as count FROM step_questions GROUP BY step_number ORDER BY step_number;');
