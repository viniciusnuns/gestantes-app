-- Adiciona campo para rastrear se usuária aceitou notificações push
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscribed boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_subscribed_at timestamptz;
