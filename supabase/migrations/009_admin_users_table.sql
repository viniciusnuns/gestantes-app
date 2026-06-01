-- ============================================================================
-- ADMIN USERS TABLE - Store admin role information
-- Links to Supabase auth.users via user_id
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on admin_users table
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin can view their own record
CREATE POLICY "admins_can_view_own" ON admin_users
  FOR SELECT USING (auth.uid() = user_id);

-- Super admin can view all
CREATE POLICY "super_admins_can_view_all" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Grant access
GRANT SELECT ON admin_users TO anon, authenticated;

-- Comment
COMMENT ON TABLE admin_users IS 'Admin users with role information for dashboard access control';
