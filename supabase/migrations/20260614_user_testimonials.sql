-- Tabela de depoimentos e avaliações das usuárias
CREATE TABLE IF NOT EXISTS user_testimonials (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL,
  type        TEXT        NOT NULL CHECK (type IN ('nps', 'star_rating')),
  score       INTEGER     NOT NULL,
  testimonial TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Leitura e inserção abertas (app usa custom auth, não Supabase Auth)
ALTER TABLE user_testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read"   ON user_testimonials FOR SELECT USING (true);
CREATE POLICY "public insert" ON user_testimonials FOR INSERT WITH CHECK (true);
