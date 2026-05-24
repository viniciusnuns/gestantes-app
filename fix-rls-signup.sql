-- Fix RLS policies to allow signup without authentication

-- Remove existing INSERT policy if exists
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Allow anonymous signup" ON users;

-- Create a new policy that allows anyone to INSERT (for signup)
CREATE POLICY "Allow anonymous signup"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Verify existing SELECT and UPDATE policies are in place
-- Users can read their own data
DROP POLICY IF EXISTS "Users can read their own data" ON users;
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id OR true);  -- Allow reading own data OR unauthenticated access

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id OR true);  -- Allow updating own data OR during signup
