/*
# Create search_history table for resume match analyses

1. New Tables
- `search_history`
  - `id` (uuid, primary key)
  - `user_email` (text, the techfetch login email — identifies who ran the search)
  - `job_description` (text, the JD used for matching)
  - `state_filter` (text, nullable — US state filter applied)
  - `source` (text: 'techfetch' or 'upload')
  - `candidate_count` (int, number of candidates analyzed)
  - `top_score` (int, highest match score in results)
  - `created_at` (timestamp)

2. Security
- Enable RLS on `search_history`.
- Owner-scoped CRUD: each user sees only their own search history (scoped by user_email).
- Policies use auth.uid() → joined to a user_profile lookup. Since we use Supabase auth,
  we match on the email from auth.users via a subquery.
- For simplicity and since this is a tool app, we use TO authenticated with email-based ownership.
*/

CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  job_description text NOT NULL,
  state_filter text,
  source text NOT NULL DEFAULT 'upload',
  candidate_count integer NOT NULL DEFAULT 0,
  top_score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON search_history;
CREATE POLICY "select_own_history"
ON search_history FOR SELECT
TO authenticated
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "insert_own_history" ON search_history;
CREATE POLICY "insert_own_history"
ON search_history FOR INSERT
TO authenticated
WITH CHECK (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "delete_own_history" ON search_history;
CREATE POLICY "delete_own_history"
ON search_history FOR DELETE
TO authenticated
USING (user_email = (SELECT email FROM auth.users WHERE id = auth.uid()));
