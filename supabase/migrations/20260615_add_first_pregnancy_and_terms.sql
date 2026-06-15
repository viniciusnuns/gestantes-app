-- Add first_pregnancy and terms_accepted_at to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_pregnancy BOOLEAN DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
