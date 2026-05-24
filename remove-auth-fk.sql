-- Remove foreign key constraint that references auth.users
-- This allows us to use custom UUIDs without auth.users dependency

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_id_fkey;

-- The id column stays as PRIMARY KEY, just no longer references auth.users
