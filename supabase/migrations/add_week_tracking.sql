-- Add week tracking fields to users table
-- This allows automatic calculation of current pregnancy week

ALTER TABLE users ADD COLUMN IF NOT EXISTS week_at_registration INTEGER DEFAULT 20;
ALTER TABLE users ADD COLUMN IF NOT EXISTS registration_date TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS estimated_due_date DATE;

-- Create function to calculate current week
CREATE OR REPLACE FUNCTION calculate_current_week(
  week_at_registration INTEGER,
  registration_date TIMESTAMP
) RETURNS INTEGER AS $$
DECLARE
  days_passed INTEGER;
  weeks_passed INTEGER;
  current_week INTEGER;
BEGIN
  days_passed := EXTRACT(DAY FROM (NOW() - registration_date));
  weeks_passed := FLOOR(days_passed / 7);
  current_week := week_at_registration + weeks_passed;

  -- Cap at week 40 (birth)
  RETURN LEAST(current_week, 40);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add comment for clarity
COMMENT ON COLUMN users.week_at_registration IS 'Pregnancy week when user registered';
COMMENT ON COLUMN users.registration_date IS 'Date when user created their account';
COMMENT ON COLUMN users.estimated_due_date IS 'Estimated due date (optional, for reference)';
