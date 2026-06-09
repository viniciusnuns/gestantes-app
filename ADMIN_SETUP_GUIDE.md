# Setup do Admin Dashboard com Supabase Auth

## 🔐 Passo 1: Aplicar a Migration

Execute esta migration no Supabase SQL Editor:

```sql
-- Já incluída em: supabase/migrations/009_admin_users_table.sql
-- Cria tabela admin_users que linka com auth.users
```

## 👤 Passo 2: Criar a Primeira Conta Admin

### Opção A: Via Dashboard (Recomendado)

1. **Acesse:** http://localhost:3000/admin/login
2. **Clique:** "Não tem conta? Crie uma" (ou similar, dependendo do fluxo)
3. **Ou use o Supabase Auth diretamente** para criar um novo usuário

### Opção B: Via Supabase Console (Direto no Banco)

1. Vá para **Supabase Dashboard → SQL Editor**
2. Execute este SQL:

```sql
-- 1. Crie um usuário no auth.users
-- (Isso deve ser feito via Supabase UI ou API)
-- Use Supabase Console → Authentication → Add User

-- 2. Depois de criar o user no auth, pegue o user_id e execute:
INSERT INTO admin_users (user_id, email, role)
VALUES (
  'UUID-DO-USER-AQUI',  -- Pegue o ID da tabela auth.users
  'admin@gestantes.com',
  'admin'
);
```

## 🔑 Passo 3: Fazer Login

1. Acesse http://localhost:3000/admin/login
2. Use as credenciais criadas no Passo 2
3. Você deve ser redirecionado para `/admin`

## 🛡️ Segurança

### Como funciona:

1. **Login via Supabase Auth**
   - Email/Senha gerenciado pelo Supabase
   - Sessão criptografada no browser

2. **Verificação de Permissão**
   - Após login, verificamos se user existe em `admin_users`
   - Se não existir → Login falha, mensagem "Sem permissão"

3. **RLS no banco**
   - Tabela `admin_users` tem RLS habilitado
   - Admins só veem seus próprios dados
   - Super admins veem todos

### Mudança de Senha

O usuário pode mudar senha via:
- "Esqueci minha senha" na página de login (Supabase Auth)
- Ou via Supabase Dashboard (Authentication → Users)

## 📋 Múltiplos Admins

Para adicionar mais admins:

1. **Crie usuário no Supabase:**
   - Supabase Console → Authentication → Add User
   - Coloque email + password

2. **Registre como admin:**
   ```sql
   INSERT INTO admin_users (user_id, email, role)
   VALUES ('novo-user-id', 'novo-admin@gestantes.com', 'admin');
   ```

## 🔄 Fluxo Completo

```
1. Usuário acessa /admin/login
2. Digita email + senha
3. Supabase Auth valida credenciais
4. Sistema verifica se user está em admin_users
5. Se SIM → Cria sessão, redireciona para /admin
6. Se NÃO → Mostra "Sem permissão para acessar"
7. Em /admin, middleware verifica permissão a cada reload
8. Clicando "Sair" → signOut() do Supabase, volta para /login
```

## 🚨 Troubleshooting

**"Email ou senha inválidos"**
- Verifique se o usuário foi criado em auth.users
- Tente "Esqueci minha senha" para resetar

**"Você não tem permissão"**
- O usuário existe em auth.users mas não em admin_users
- Execute o SQL acima para registrar como admin

**Login funciona mas Dashboard fica carregando**
- Verifique RLS policies (deve ter SELECT em admin_users)
- Rodou a migration 009?

## 📝 Próximos Passos

- [ ] Criar primeiro admin via Supabase UI
- [ ] Testar login em http://localhost:3000/admin/login
- [ ] Testar logout
- [ ] Em produção, configurar OAuth (Google, GitHub)

---

**Nota:** Em produção, você pode integrar OAuth para login mais seguro:
- Google Sign-In
- GitHub Sign-In
- Ambos ja são suportados pelo Supabase Auth
