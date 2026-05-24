-- Create therapists table
CREATE TABLE therapists (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create therapist_patients junction table (many-to-many relationship)
CREATE TABLE therapist_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(therapist_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_patients ENABLE ROW LEVEL SECURITY;

-- Therapist RLS policies
CREATE POLICY "Therapists can read their own data" ON therapists
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can update their own data" ON therapists
  FOR UPDATE USING (auth.uid() = id);

-- Therapist can see their assigned patients
CREATE POLICY "Therapists can read their patients" ON therapist_patients
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can create patient assignments" ON therapist_patients
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

-- Allow therapists to view patient data (via therapist_patients)
CREATE POLICY "Therapists can view assigned patients data" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients
      WHERE therapist_patients.user_id = users.id
      AND therapist_patients.therapist_id = auth.uid()
    )
  );

-- Allow therapists to view activities of assigned patients
CREATE POLICY "Therapists can view patient activities" ON completed_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients
      WHERE therapist_patients.user_id = completed_activities.user_id
      AND therapist_patients.therapist_id = auth.uid()
    )
  );

-- Allow therapists to view progress of assigned patients
CREATE POLICY "Therapists can view patient progress" ON user_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM therapist_patients
      WHERE therapist_patients.user_id = user_progress.user_id
      AND therapist_patients.therapist_id = auth.uid()
    )
  );
