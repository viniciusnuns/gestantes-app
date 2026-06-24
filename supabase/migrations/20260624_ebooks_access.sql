-- Colunas de acesso aos ebooks na tabela de usuários
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS has_ebook_gestacao boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_ebook_parto boolean DEFAULT false;

-- Flag do order bump na tabela de checkouts pendentes
ALTER TABLE pending_checkouts
  ADD COLUMN IF NOT EXISTS add_ebook_parto boolean DEFAULT false;

-- Todos os usuários existentes recebem o ebook gestação (bônus incluído)
UPDATE users SET has_ebook_gestacao = true WHERE user_type = 'patient';
