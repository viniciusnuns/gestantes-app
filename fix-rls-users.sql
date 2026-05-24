-- Fix RLS policies for users table
-- This allows users to insert their own data during onboarding

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- Create new INSERT policy
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Verify policies are in place
SELECT * FROM pg_policies WHERE tablename = 'users';
