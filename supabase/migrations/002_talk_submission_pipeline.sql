-- ============================================================
-- Migration 002: Talk submission pipeline
-- ============================================================

-- New enum for talk lifecycle
CREATE TYPE talk_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- New columns on talks
ALTER TABLE talks ADD COLUMN status talk_status NOT NULL DEFAULT 'draft';
ALTER TABLE talks ADD COLUMN submitted_by UUID REFERENCES public.profiles(id);
ALTER TABLE talks ADD COLUMN rejection_notes TEXT;

-- DROP old read-only policy, replace with role-aware policies
DROP POLICY "Talks are viewable by authenticated users" ON talks;

CREATE POLICY "Talks are viewable by role" ON talks
  FOR SELECT USING (
    auth.role() = 'authenticated' AND (
      needs_review = FALSE
      OR submitted_by = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

CREATE POLICY "Volunteers can insert talks for their sessions" ON talks
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND submitted_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.sessions
      WHERE id = session_id AND claimed_by = auth.uid() AND status = 'in_progress'
    )
  );

CREATE POLICY "Volunteers can update their draft talks" ON talks
  FOR UPDATE USING (submitted_by = auth.uid() AND status IN ('draft', 'rejected'));

CREATE POLICY "Admins can update any talk" ON talks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY "Volunteers can delete their draft talks" ON talks
  FOR DELETE USING (submitted_by = auth.uid() AND status = 'draft');

ALTER PUBLICATION supabase_realtime ADD TABLE talks;

-- Admins can update any profile (for admin toggle)
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
