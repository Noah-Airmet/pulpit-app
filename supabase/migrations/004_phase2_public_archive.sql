-- ============================================================
-- Phase 2: Public archive access + tracker fix
-- Run in Supabase SQL editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Drop the authenticated-only policy on talks
DROP POLICY IF EXISTS "Talks are viewable by authenticated users" ON talks;

-- 2. Create new policy: approved talks are publicly readable (anon + authenticated)
CREATE POLICY "Approved talks are publicly viewable" ON talks
  FOR SELECT USING (needs_review = false);

-- 3. Fix April 2025 session status (already ingested but showing unclaimed)
UPDATE sessions
SET status = 'complete', talk_count = 34, completed_at = NOW()
WHERE id = '2025-04';
