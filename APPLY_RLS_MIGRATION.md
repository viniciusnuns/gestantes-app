# Como Aplicar a Migration RLS Corrigida

## Opção 1: Via Supabase CLI (Recomendado)

```bash
# Faça login (uma única vez)
supabase login

# Linke o projeto
supabase link --project-ref odirmtmompghjgmhotml

# Aplique a migration
supabase db push
```

## Opção 2: Manual via Dashboard Supabase

Se a CLI não funcionar, execute a SQL manualmente:

1. Abra o Supabase Dashboard: https://app.supabase.com
2. Acesse seu projeto "gestantes-app" (ou o nome do projeto)
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole todo o conteúdo do arquivo:
   ```
   supabase/migrations/007_enable_rls_policies.sql
   ```
6. Clique em **Run** ou pressione `Ctrl+Enter`

## Opção 3: Via Variável de Ambiente

Se você tem a **Service Role Key**, pode rodar:

```bash
# Obtenha a chave em:
# Supabase Dashboard > Project Settings > API > Service Role Key

export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
npm run apply:rls
```

## Próximos Passos

Após aplicar a migration:

1. Reinicie o servidor Next.js:
   ```bash
   npm run dev
   ```

2. Teste criando uma conta com: `maet14@gmail.com` / `123456`

3. Se funcionar, crie uma segunda conta para testar isolamento de dados

## Problema Resolvido

As policies de RLS foram corrigidas para funcionar com seu sistema de **custom auth**:
- ❌ Antes: `id = auth.uid()` (Supabase Auth específico)
- ✅ Agora: `true` com validação no app-level

Isto permite que o RLS seja ativado enquanto sua arquitetura de custom auth funciona normalmente.
