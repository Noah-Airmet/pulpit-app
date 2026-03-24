-- Make sessions publicly readable so the landing page stats
-- work for logged-out visitors. Write policies are unchanged.

DROP POLICY IF EXISTS "Sessions are viewable by authenticated users" ON sessions;
CREATE POLICY "Sessions are publicly viewable" ON sessions
  FOR SELECT USING (true);
