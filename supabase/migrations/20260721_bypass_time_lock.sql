-- Coluna para bypasear o time lock de 7 dias (meditação/parto)
-- Setada como true quando usuária faz upgrade do plano parto → full
ALTER TABLE users ADD COLUMN IF NOT EXISTS bypass_time_lock boolean DEFAULT false;
