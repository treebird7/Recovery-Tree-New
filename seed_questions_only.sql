-- Seed ONLY the questions (tables already exist)
-- This script only inserts questions, doesn't create tables

-- Temporarily disable RLS for seeding
ALTER TABLE step_questions DISABLE ROW LEVEL SECURITY;

-- Clear existing questions (optional - uncomment if you want to start fresh)
-- DELETE FROM step_questions;

-- Insert all questions
INSERT INTO step_questions (
  id, step_number, phase, phase_title, question_order,
  question_text, question_type, is_required, follow_up_type,
  follow_up_text, conditional_follow_up, safety_flag,
  completion_marker, data_logging, is_active
) VALUES
  ('s1_p1_q1a', 1, 'recognition', 'Recognition - Surface Acknowledgment', 1,
   'First - what behaviors are we talking about? What does your addictive behavior include?

For some people it''s porn. For some it''s porn plus other things - sexting, tinder, online stalking, chat rooms, compulsive masturbation, fantasy obsession.

What''s yours? What behaviors are you powerless over?',
   'open_ended', true, 'reflection',
   '[Reflect back what they said]. That''s what we''re looking at. Your addictive behavior around [their behaviors].', NULL, false,
   false, ARRAY['behaviors_identified'], true),
  ('s1_p1_q1b', 1, 'recognition', 'Recognition - Surface Acknowledgment', 2,
   'How long has this been going on?',
   'open_ended', true, 'continuation',
   'In that time, have you tried to stop or control your use?', NULL, false,
   false, ARRAY['duration', 'attempts_to_stop'], true),
  ('s1_p1_q1c', 1, 'recognition', 'Recognition - Surface Acknowledgment', 3,
   'What happened when you tried?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['attempt_outcomes'], true),
  ('s1_p1_q1d', 1, 'recognition', 'Recognition - Surface Acknowledgment', 4,
   'In the last month, how many times did you use when you hadn''t planned to?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['unplanned_use_frequency'], true),
  ('s1_p1_q1e', 1, 'recognition', 'Recognition - Surface Acknowledgment', 5,
   'How many times did you intend to use just briefly, but it went longer than you meant?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['exceeded_intended_duration'], true),
  ('s1_p1_q1f', 1, 'recognition', 'Recognition - Surface Acknowledgment', 6,
   'How many times have you said ''this is the last time'' - but it wasn''t?',
   'open_ended', true, 'reflection',
   'So you''re making promises you can''t keep. You''re not choosing to break them. You just can''t stop.', NULL, false,
   false, ARRAY['broken_last_time_promises'], true),
  ('s1_p2_q2a', 1, 'mental_obsession', 'Mental Obsession - How Your Mind Lies', 7,
   'Think about the last time you used. Before you used, what were you thinking? What was your mind telling you?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['pre_use_thoughts'], true),
  ('s1_p2_q2b', 1, 'mental_obsession', 'Mental Obsession - How Your Mind Lies', 8,
   'When that thought came - ''just once'' or ''I can handle it'' or ''I deserve this'' - did you believe it?',
   'yes_no', true, 'reflection',
   'That''s the mental obsession. Your mind sets you up. It lies to get you to use.', NULL, false,
   false, ARRAY['believed_setup_thoughts'], true),
  ('s1_p2_q2c', 1, 'mental_obsession', 'Mental Obsession - How Your Mind Lies', 9,
   'What''s the ritual? What do you do to prepare? Lock doors, close tabs, clear history, set up playlists, get comfortable?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['ritual_preparation'], true),
  ('s1_p2_q2d', 1, 'mental_obsession', 'Mental Obsession - How Your Mind Lies', 10,
   'After you used - was what your mind told you before true?',
   'yes_no', true, 'reflection',
   'Your mind lies to get you to use. Every time.', NULL, false,
   false, ARRAY['post_use_truth_check'], true),
  ('s1_p2_q2e', 1, 'mental_obsession', 'Mental Obsession - How Your Mind Lies', 11,
   'What were you thinking right after? How did you feel?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['post_use_thoughts_feelings'], true),
  ('s1_p3_q3a', 1, 'craving_compulsion', 'Craving/Compulsion - Why You Can''t Stop', 12,
   'Think about when you''ve told yourself ''just one look'' or ''just for a minute.'' What happens next?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['just_one_look_results'], true),
  ('s1_p3_q3b', 1, 'craving_compulsion', 'Craving/Compulsion - Why You Can''t Stop', 13,
   'During a session, does it escalate? Do you start one place and end up somewhere else?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"Where do you start? Where do you end up? How does that progression happen?"}'::jsonb, false,
   false, ARRAY['escalation_during_session'], true),
  ('s1_p3_q3c', 1, 'craving_compulsion', 'Craving/Compulsion - Why You Can''t Stop', 14,
   'Have you ever wanted to stop in the middle of using - but couldn''t?',
   'yes_no', true, 'reflection',
   'That''s the craving. Once you start, something takes over. You can''t stop.', NULL, false,
   false, ARRAY['unable_to_stop_mid_session'], true),
  ('s1_p4_q4a', 1, 'powerlessness_evidence', 'Powerlessness Evidence - Attempts to Control', 15,
   'How many times have you tried to quit completely?',
   'open_ended', true, 'continuation',
   'What happened each time?', NULL, false,
   false, ARRAY['quit_attempts', 'quit_outcomes'], true),
  ('s1_p4_q4b', 1, 'powerlessness_evidence', 'Powerlessness Evidence - Attempts to Control', 16,
   'What promises have you made to yourself? To stop, to control it, to only use certain kinds, to set limits?',
   'open_ended', true, 'continuation',
   'How many of those promises have you kept?', NULL, false,
   false, ARRAY['promises_made', 'promises_kept'], true),
  ('s1_p4_q4c', 1, 'powerlessness_evidence', 'Powerlessness Evidence - Attempts to Control', 17,
   'Have you faced consequences - damaged relationships, work problems, health issues, legal trouble - and still gone back to using?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"What were the consequences? Did they stop you?"}'::jsonb, false,
   false, ARRAY['consequences_faced', 'consequences_stopped_use'], true),
  ('s1_p4_q4d', 1, 'powerlessness_evidence', 'Powerlessness Evidence - Attempts to Control', 18,
   'Have you ever used against your will? Times when part of you absolutely didn''t want to, but you did anyway?',
   'yes_no', true, 'reflection',
   'That''s powerlessness. You''re not choosing this. You can''t stop.', NULL, false,
   false, ARRAY['used_against_will'], true),
  ('s1_p5a_q5a1', 1, 'unmanageability_physical', 'Unmanageability - Physical Harm', 19,
   'Have you put yourself in dangerous situations to act out? Public places, while driving, at work, around others?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['risky_situations'], true),
  ('s1_p5a_q5a2', 1, 'unmanageability_physical', 'Unmanageability - Physical Harm', 20,
   'Has your health suffered? Sleep loss, exhaustion, physical pain from prolonged use, neglecting exercise or medical care?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['health_neglected'], true),
  ('s1_p5a_q5a3', 1, 'unmanageability_physical', 'Unmanageability - Physical Harm', 21,
   'Have you engaged in risky sexual behavior because of your addiction?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['risky_sexual_behavior'], true),
  ('s1_p5b_q5b1', 1, 'unmanageability_legal', 'Unmanageability - Legal Consequences', 22,
   'Have you accessed illegal content? Even once?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['illegal_access'], true),
  ('s1_p5b_q5b2', 1, 'unmanageability_legal', 'Unmanageability - Legal Consequences', 23,
   'Have you been caught or nearly caught doing something illegal or inappropriate?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['caught_nearly_caught'], true),
  ('s1_p5b_q5b3', 1, 'unmanageability_legal', 'Unmanageability - Legal Consequences', 24,
   'Have you crossed boundaries you swore you never would? Things that violate your values or others'' safety?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['crossed_boundaries'], true),
  ('s1_p5c_q5c1', 1, 'unmanageability_financial', 'Unmanageability - Financial Harm', 25,
   'How much money have you spent on your addiction? Subscriptions, cam sites, paid content, hotels, travel?',
   'open_ended', true, 'continuation',
   'Money you couldn''t afford? Money that should have gone elsewhere?', NULL, false,
   false, ARRAY['money_spent', 'unaffordable_spending'], true),
  ('s1_p5c_q5c2', 1, 'unmanageability_financial', 'Unmanageability - Financial Harm', 26,
   'Have you neglected financial responsibilities because of porn? Bills unpaid, debt accumulated, work missed?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['financial_responsibilities_neglected'], true),
  ('s1_p5c_q5c3', 1, 'unmanageability_financial', 'Unmanageability - Financial Harm', 27,
   'Have you stolen money or lied to get money to support your addiction?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['stolen_lied_for_money'], true),
  ('s1_p5d_q5d1', 1, 'unmanageability_relational', 'Unmanageability - Relational Harm', 28,
   'Have you lied to people you care about to hide your addiction?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['lied_to_loved_ones'], true),
  ('s1_p5d_q5d2', 1, 'unmanageability_relational', 'Unmanageability - Relational Harm', 29,
   'Have you betrayed agreements in relationships? Promised to stop, promised fidelity, but broke those promises?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['betrayed_agreements'], true),
  ('s1_p5d_q5d3', 1, 'unmanageability_relational', 'Unmanageability - Relational Harm', 30,
   'Have you lost relationships because of your addiction? Breakups, divorces, friendships ended?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['lost_relationships'], true),
  ('s1_p5d_q5d4', 1, 'unmanageability_relational', 'Unmanageability - Relational Harm', 31,
   'Do you isolate? Withdraw from people, avoid social situations, prefer to be alone so you can use?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['isolation'], true),
  ('s1_p5d_q5d5', 1, 'unmanageability_relational', 'Unmanageability - Relational Harm', 32,
   'If you''re in a relationship - can you connect sexually with your partner without using porn or fantasy?',
   'yes_no', false, 'none',
   NULL, NULL, false,
   false, ARRAY['sexual_connection_impaired'], true),
  ('s1_p5e_q5e1', 1, 'unmanageability_professional', 'Unmanageability - Professional/Educational', 33,
   'Have you acted out at work or school?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['acted_out_work_school'], true),
  ('s1_p5e_q5e2', 1, 'unmanageability_professional', 'Unmanageability - Professional/Educational', 34,
   'Have you missed work or school because of your addiction? Called in sick when you weren''t, skipped classes, been late?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['missed_work_school'], true),
  ('s1_p5e_q5e3', 1, 'unmanageability_professional', 'Unmanageability - Professional/Educational', 35,
   'Have you lost or nearly lost jobs, educational opportunities, or professional advancement because of your addiction?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['lost_opportunities'], true),
  ('s1_p5e_q5e4', 1, 'unmanageability_professional', 'Unmanageability - Professional/Educational', 36,
   'Has your work or academic performance suffered because of your addiction? Unable to focus, tired, distracted?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['performance_suffered'], true),
  ('s1_p5f_q5f1', 1, 'unmanageability_emotional', 'Unmanageability - Emotional/Spiritual', 37,
   'Have you felt severely depressed or suicidal because of your addiction?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"Are you feeling that way now? Do you need immediate support?"}'::jsonb, true,
   false, ARRAY['depression_suicidal'], true),
  ('s1_p5f_q5f2', 1, 'unmanageability_emotional', 'Unmanageability - Emotional/Spiritual', 38,
   'How intense is the shame you carry about your addiction? How much do you hate yourself because of it?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['shame_level'], true),
  ('s1_p5f_q5f3', 1, 'unmanageability_emotional', 'Unmanageability - Emotional/Spiritual', 39,
   'Have you repeatedly violated your own values and beliefs through your addictive behavior?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['violated_values'], true),
  ('s1_p5f_q5f4', 1, 'unmanageability_emotional', 'Unmanageability - Emotional/Spiritual', 40,
   'If you have spiritual or religious beliefs, has your addiction created a barrier between you and your higher power?',
   'yes_no', false, 'none',
   NULL, NULL, false,
   false, ARRAY['spiritual_disconnection'], true),
  ('s1_p5f_q5f5', 1, 'unmanageability_emotional', 'Unmanageability - Emotional/Spiritual', 41,
   'Do you feel like you''ve lost yourself to this addiction? Like you''re not who you used to be or want to be?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['lost_sense_of_self'], true),
  ('s1_p6_q6a', 1, 'integration', 'Integration - Seeing the Complete Picture', 42,
   'Based on everything you''ve looked at - can you control your addictive behavior on your own?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"What makes this time different from the other times you tried?","if_no":"That''s Step 1. You''re powerless."}'::jsonb, false,
   false, ARRAY['can_control_alone'], true),
  ('s1_p6_q6b', 1, 'integration', 'Integration - Seeing the Complete Picture', 43,
   'Looking at all the consequences - physical, legal, financial, relational, professional, emotional, spiritual - is your life manageable?',
   'yes_no', true, 'reflection',
   'That''s the second part of Step 1. Your life has become unmanageable.', NULL, false,
   false, ARRAY['life_manageable'], true),
  ('s1_p6_q6c', 1, 'integration', 'Integration - The Admission', 44,
   'Step 1 says: ''We admitted we were powerless over our addictive behavior and that our lives had become unmanageable.''

Can you say that? Do you admit that?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"That''s Step 1. That''s the foundation. You can''t manage this alone - and that''s okay. That''s why there are 11 more steps. That''s why there''s a program. That''s why you''re not doing this by yourself anymore.\n\nStep 2 is about finding out that help is available - that you don''t have to do this on willpower. But first, you had to admit you need help.\n\nYou just did. That took courage.","if_no":"That''s okay. This isn''t about convincing you. Keep looking at your own experience. The evidence doesn''t lie. When you''re ready to admit powerlessness, Step 2 is waiting."}'::jsonb, false,
   true, ARRAY['admits_step_1'], true),
  ('s2_p1_q1a', 2, 'defining_sanity', 'Defining Sanity - What Would Sane Look Like?', 1,
   'Start with where you are now. You''ve seen your addiction''s insanity - the mental obsession, the compulsion, the consequences.

What does the insanity of your addiction look like day to day?',
   'open_ended', true, 'reflection',
   'That''s what you''ve been living in.', NULL, false,
   false, ARRAY['insanity_description'], true),
  ('s2_p1_q1b', 2, 'defining_sanity', 'Defining Sanity - What Would Sane Look Like?', 2,
   'Now imagine the opposite. If you were ''restored to sanity'' - what would your daily life look like?

Not perfect. Not problem-free. But sane. Free from the obsession and compulsion.',
   'open_ended', true, 'reflection',
   'That''s what Step 2 is asking about - could that be possible? Could you actually live that way?', NULL, false,
   false, ARRAY['sanity_vision'], true),
  ('s2_p2_q2a', 2, 'evidence_of_recovery', 'Evidence of Recovery - It''s Real', 3,
   'People as hopeless as you have recovered. People who couldn''t stop, who tried everything, who caused massive harm - they''re sober now. Living sane lives.

Have you seen this? Do you know anyone in recovery?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"What''s different about them? What changed?","if_no":"That''s okay. But think about this - there are millions of people in recovery programs worldwide. SAA, AA, SLAA meetings happen in every major city, every day. These aren''t people pretending. They''re living proof that what seems impossible to you happened for them. Does knowing that changes anything? Even a little?"}'::jsonb, false,
   false, ARRAY['knows_people_in_recovery'], true),
  ('s2_p2_q2b', 2, 'evidence_of_recovery', 'Evidence of Recovery - Help That Worked', 4,
   'Here''s what people in recovery say: ''I couldn''t do it alone. But I found help that worked.''

They didn''t get more willpower. They didn''t suddenly become stronger people. They found something outside themselves that could do what they couldn''t.

Does that make sense? Have you ever experienced that in other areas of life - where you couldn''t do something alone, but with help it became possible?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['experiences_of_help_working'], true),
  ('s2_p3_q3a', 2, 'higher_power_exploration', 'Your Higher Power - What Could Help?', 5,
   'If not your own willpower - what could help you recover?

Don''t overthink this. What comes to mind?',
   'open_ended', true, 'reflection',
   '[Reflect back what they said] - that''s a power greater than yourself. That''s Step 2.', NULL, false,
   false, ARRAY['higher_power_concept'], true),
  ('s2_p3_q3b', 2, 'higher_power_exploration', 'Your Higher Power - Where Have You Been Helped?', 6,
   'Think about times in your life when you were stuck - not addiction, anything. Times when you couldn''t solve something alone.

Where did help come from? What got you through?',
   'open_ended', true, 'reflection',
   'So you''ve already experienced this - getting help from outside yourself. You know what that feels like.

Could the same thing work for your addiction?', NULL, false,
   false, ARRAY['past_help_experiences'], true),
  ('s2_p3_q3c', 2, 'higher_power_exploration', 'Your Higher Power - What Are Your Fears?', 7,
   'When you think about relying on something other than yourself - what scares you about that?',
   'open_ended', true, 'reflection',
   '[Acknowledge their fear without dismissing it]

Those fears make sense. But here''s the question: Has relying on yourself alone been working?', NULL, false,
   false, ARRAY['fears_about_relying_on_help'], true),
  ('s2_p4_q4a', 2, 'coming_to_believe', 'Coming to Believe - Is Recovery Possible?', 8,
   'Based on everything we''ve talked about - other people recovering, times you''ve been helped before, what sanity would look like - is it possible that you could recover?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"That''s Step 2. You believe recovery is possible. You believe help exists. You don''t have to know how yet - just that it''s possible.","if_uncertain":"That''s okay. Step 2 is ''came to believe'' - it''s a process. You don''t have to be certain. Just willing to consider it. Can you be willing to consider that recovery might be possible?","if_no":"What would have to change for you to believe it''s possible?"}'::jsonb, false,
   false, ARRAY['recovery_possible'], true),
  ('s2_p4_q4b', 2, 'coming_to_believe', 'Coming to Believe - The Step 2 Admission', 9,
   'Step 2 says: ''We came to believe that a Power greater than ourselves could restore us to sanity.''

Can you say that? Even if you''re not totally sure yet - can you say you''re willing to believe it?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"That''s Step 2. You''ve moved from hopelessness to possibility. You believe recovery exists and help is available.\n\nStep 3 is about deciding to accept that help - to actually let something other than your willpower guide you. But first, you had to believe help was possible.\n\nYou just did.","if_no":"That''s honest. Keep looking at the evidence. Talk to people in recovery. Watch what works. The belief will come when you''re ready.\n\nStep 2 will be waiting when you get there."}'::jsonb, false,
   true, ARRAY['admits_step_2'], true),
  ('s3_p1_q1a', 3, 'understanding_decision', 'Understanding the Decision - What Is Your Will?', 1,
   '''Your will'' means how you want things to be. Your plans, your control, your way of managing life.

Think about your addiction. How have you been trying to manage it with your own will?',
   'open_ended', true, 'continuation',
   'And how has that worked?', NULL, false,
   false, ARRAY['managing_with_will', 'will_effectiveness'], true),
  ('s3_p1_q1b', 3, 'understanding_decision', 'Understanding the Decision - What Is Your Life?', 2,
   '''Your life'' means everything - not just the addiction. Your relationships, work, daily decisions, how you spend your time.

Think about how you''ve been running your life. Making all the decisions. Trying to control all the outcomes.

How''s that going? Where are you exhausted?',
   'open_ended', true, 'reflection',
   '''Turning over your life'' means: Stop trying to control everything. Be willing to be guided instead.', NULL, false,
   false, ARRAY['exhaustion_from_control'], true),
  ('s3_p1_q1c', 3, 'understanding_decision', 'Understanding the Decision - What Does Turn Over Mean?', 3,
   'Here''s what turning it over is NOT:
- It''s not giving up
- It''s not being passive
- It''s not ''God will fix everything''

Here''s what it IS:
- Asking for guidance before acting
- Being willing to do things differently than your instinct says
- Trusting the process even when you can''t see the outcome
- Letting go of outcomes you can''t control

Does that make sense?',
   'yes_no', true, 'none',
   NULL, NULL, false,
   false, ARRAY['understands_surrender'], true),
  ('s3_p2_q2a', 3, 'examining_resistance', 'Examining Resistance - What Are You Afraid of Losing?', 4,
   'If you actually turned your will and life over - stopped trying to control everything - what are you afraid would happen?

What would you lose?',
   'open_ended', true, 'reflection',
   '[Acknowledge fear]

Those are real fears. But here''s the question: Are you actually in control now? Or are you just exhausting yourself trying to be?', NULL, false,
   false, ARRAY['fears_about_letting_go'], true),
  ('s3_p2_q2b', 3, 'examining_resistance', 'Examining Resistance - What Has Control Cost?', 5,
   'Think about what trying to control everything has cost you:
- Energy
- Peace
- Relationships
- Sanity

What has your need to be in control cost you?',
   'open_ended', true, 'reflection',
   'So the fear isn''t really about losing control. It''s about admitting you never had it in the first place.', NULL, false,
   false, ARRAY['cost_of_control'], true),
  ('s3_p2_q2c', 3, 'examining_resistance', 'Examining Resistance - What Would Change?', 6,
   'Imagine you actually did this. You woke up tomorrow and instead of trying to control everything, you asked for guidance. You were willing to be led.

What would change? How would your day look different?',
   'open_ended', true, 'reflection',
   'That''s what Step 3 is offering. Not perfection. Not no problems. But a different way of living.', NULL, false,
   false, ARRAY['life_if_surrendered'], true),
  ('s3_p3_q3a', 3, 'clarifying_higher_power', 'Clarifying Higher Power - What Is Your Higher Power?', 7,
   'In Step 2, you identified what ''power greater than yourself'' could mean for you.

What was that? What can help you that isn''t just your own willpower?',
   'open_ended', true, 'reflection',
   'Okay. So that''s what you''re turning your will and life over to. [Their concept].

Can you do that? Can you let [their Higher Power concept] guide you instead of trying to run everything yourself?', NULL, false,
   false, ARRAY['higher_power_identified'], true),
  ('s3_p3_q3b', 3, 'clarifying_higher_power', 'Clarifying Higher Power - How Do You Access It?', 8,
   'Practical question: How do you actually connect with [their Higher Power]?

- If it''s the program: How do you listen to it?
- If it''s collective wisdom: How do you access it?
- If it''s a spiritual power: How do you communicate with it?

What''s the actual practice?',
   'open_ended', true, 'reflection',
   'That''s your Step 3 practice. That''s how you ''turn it over'' daily.', NULL, false,
   false, ARRAY['daily_practice_defined'], true),
  ('s3_p4_q4a', 3, 'making_decision', 'Making the Decision - Are You Ready?', 9,
   'This isn''t about being perfect at it. You''ll grab control back. You''ll forget. You''ll panic and try to manage things yourself.

That''s normal. That''s why it''s a daily practice.

The question is: Are you willing to TRY living this way? Are you willing to make the decision?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"Continue to formal decision","if_uncertain":"What would make you ready? What do you need to know or understand?","if_no":"That''s honest. What''s stopping you? What needs to change?"}'::jsonb, false,
   false, ARRAY['ready_for_decision'], true),
  ('s3_p4_q4b', 3, 'making_decision', 'Making the Decision - The Step 3 Decision', 10,
   'Step 3 says: ''We made a decision to turn our will and our lives over to the care of God as we understood Him.''

Here''s how to say it in your words:

''I can''t control my addiction or my life alone. I''m willing to be guided by [their Higher Power]. I''m willing to stop running the show. I''m willing to ask for help and follow guidance, even when it''s hard.''

Can you say that? Can you make that decision?',
   'yes_no', true, 'conditional',
   NULL, '{"if_yes":"That''s Step 3. You''ve made the decision.\n\nThis is the foundation for everything else. Steps 4-12 are about HOW to live this out - how to remove the things that block you from your Higher Power, how to clean up the wreckage, how to stay connected.\n\nBut first you had to make the decision to try. You just did.\n\nThis doesn''t mean you''ll do it perfectly. It means you''re willing to practice. And that changes everything.","if_no":"That''s okay. The willingness will come. Keep thinking about what control has cost you and what surrender could give you.\n\nStep 3 will be here when you''re ready."}'::jsonb, false,
   true, ARRAY['made_step_3_decision'], true),
  ('s3_p4_q4c', 3, 'making_decision', 'Making the Decision - Third Step Prayer (Optional)', 11,
   'The Big Book has a prayer for Step 3. You don''t have to say it, but some people find it helpful:

''God, I offer myself to Thee - to build with me and to do with me as Thou wilt. Relieve me of the bondage of self, that I may better do Thy will. Take away my difficulties, that victory over them may bear witness to those I would help of Thy Power, Thy Love, and Thy Way of life. May I do Thy will always!''

Does any of that resonate for you? Want to say it in your own words?',
   'open_ended', false, 'none',
   NULL, NULL, false,
   false, ARRAY['prayer_personalization'], true),
  ('s3_p4_q4d', 3, 'making_decision', 'Making the Decision - Daily Remembering', 12,
   'How will you remember this decision daily? What will remind you to turn things over instead of grabbing control?',
   'open_ended', true, 'none',
   NULL, NULL, false,
   false, ARRAY['daily_reminder_practice'], true);

-- Re-enable RLS after seeding
ALTER TABLE step_questions ENABLE ROW LEVEL SECURITY;

-- Verify the seed
SELECT step_number, COUNT(*) as count FROM step_questions GROUP BY step_number ORDER BY step_number;
