-- ============================================
-- FIX: Corrigir RLS para Salvamento do Onboarding
-- ============================================

-- PASSO 1: Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- PASSO 2: Criar policies NOVAS e CORRETAS

-- Permitir que usuários façam INSERT de seus próprios dados
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Permitir que usuários façam SELECT de seus próprios dados
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Permitir que usuários façam UPDATE de seus próprios dados
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- PASSO 3: Verificar se as policies foram criadas
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- PASSO 4: Verificar que Row Level Security está ATIVADO
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'users';
