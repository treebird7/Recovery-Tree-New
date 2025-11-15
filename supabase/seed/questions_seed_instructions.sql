-- Seed script for Step Questions
-- This imports all 65 questions from Watson's extraction
-- Run this AFTER running migration 009_step_questions_journal.sql

-- First, clear any existing questions (in case re-seeding)
TRUNCATE TABLE step_questions CASCADE;

-- Import will be done via the seed API endpoint
-- This file documents the seed structure

-- Step 1: 44 questions across 6 phases
-- Step 2: 9 questions across 4 phases
-- Step 3: 12 questions across 4 phases
-- Total: 65 questions

-- To seed the database, use the seed API:
-- POST /api/admin/seed-questions
-- Body: Content of 20251112_Step_Questions_Database_Import.json

-- Or manually run INSERT statements generated from the JSON file
