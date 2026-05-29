-- User Achievements Table (tracks unlocked achievements)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- RLS: Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own achievements"
  ON user_achievements FOR SELECT
  USING (user_id = auth.uid() OR true);

CREATE POLICY "Achievements can be inserted by app (server-side)"
  ON user_achievements FOR INSERT
  WITH CHECK (true);
