-- ============================================================================
-- FIX ADMIN_USERS RLS POLICIES
--
-- Issues with migration 009:
--   1. "super_admins_can_view_all" policy queries admin_users from within an
--      admin_users policy → infinite recursion (Postgres error 42P17).
--   2. With only the "view own" policy, any tooling that reads admin_users
--      without an authenticated session gets 0 rows and PostgREST .single()
--      responds with HTTP 406.
--
-- Resolution:
--   - Drop both old policies and recreate a single SELECT policy that returns
--     the caller's own admin row when they are authenticated.
--   - Keep RLS enabled so anonymous reads cannot enumerate admins.
--   - No INSERT/UPDATE/DELETE policies exposed to anon/authenticated — admin
--     rows are managed via service role / SQL only.
-- ============================================================================

-- Make sure RLS is on (idempotent)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop the broken policies from migration 009
DROP POLICY IF EXISTS "admins_can_view_own" ON admin_users;
DROP POLICY IF EXISTS "super_admins_can_view_all" ON admin_users;

-- Single, recursion-free SELECT policy:
-- A signed-in user can read the admin_users row that belongs to them.
-- Non-admins simply get 0 rows back (no 406, no enumeration).
CREATE POLICY "admin_users_select_self"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Make sure SELECT is granted (idempotent — was granted in 009)
GRANT SELECT ON admin_users TO authenticated;

COMMENT ON POLICY "admin_users_select_self" ON admin_users IS
  'Authenticated users can read only their own admin_users row. '
  'Replaces the recursive super_admins_can_view_all policy from migration 009.';
