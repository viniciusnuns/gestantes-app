-- Add columns needed for custom authentication system

-- Add password_hash column for custom auth
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';

-- Add onboarding_completed column to track onboarding status
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add onboarding_completed_at timestamp
ALTER TABLE users
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Add user_type column (patient, therapist)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'patient';

-- Make password_hash NOT NULL again (remove the default after adding column)
-- First, ensure all existing rows have a valid password_hash (use empty string as default)
-- Then alter the column if needed

-- Update the table to use empty string for password_hash if not set
UPDATE users SET password_hash = '' WHERE password_hash IS NULL;
