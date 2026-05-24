# 🔄 Recuperar/Recriar Usuários

## ❌ Se os Usuários Sumiram:

Pode ser que foram deletados ou estão ocultos pelo RLS. Vamos recriá-los!

---

## ✅ Recriar Usuários no Supabase

### Passo 1: Abrir Supabase Auth
```
https://supabase.com
→ gestantes-em-movimento
→ Authentication (menu lateral)
→ Users
```

### Passo 2: Criar Novo Usuário

Clique em **"Create user"** e preencha:

#### Exemplo 1:
```
Email:               mae1@gestantes.com
Password:            Senha123456
Confirm Password:    Senha123456
✅ Auto confirm user
```

#### Exemplo 2:
```
Email:               mae2@gestantes.com
Password:            Senha123456
Confirm Password:    Senha123456
✅ Auto confirm user
```

#### Exemplo 3:
```
Email:               mae3@gestantes.com
Password:            Senha123456
Confirm Password:    Senha123456
✅ Auto confirm user
```

Clique **"Save"** para cada um.

---

## 🔧 Depois, Adicionar Perfil no Banco

Para cada usuário criado, copie o **UID** e execute este SQL no **SQL Editor**:

```sql
INSERT INTO users (id, email, name, week, healthy_pregnancy, had_intercurrence, doctor_approved, objectives, discomforts, created_at, updated_at) 
VALUES (
  'COLE_O_UID_AQUI',
  'mae1@gestantes.com',
  'Gestante 1',
  20,
  true,
  false,
  true,
  ARRAY['preparar-para-parto'],
  ARRAY['dor-lombar'],
  NOW(),
  NOW()
);
```

**Repita 3 vezes, trocando:**
- `COLE_O_UID_AQUI` - pelo UID de cada usuário
- `mae1@gestantes.com` - pelo email correto
- `'Gestante 1'` - pelo nome de cada uma

---

## 📋 Usuários Prontos para Testar

Após criar, você terá:

| Email | Senha |
|-------|-------|
| mae1@gestantes.com | Senha123456 |
| mae2@gestantes.com | Senha123456 |
| mae3@gestantes.com | Senha123456 |

Teste login com cada uma em http://localhost:3000

---

## 💾 Para Não Perder Novamente

Salve suas credenciais de teste em um arquivo `.env.local`:

```
NEXT_PUBLIC_TEST_USERS=mae1@gestantes.com,mae2@gestantes.com,mae3@gestantes.com
```

Ou use um Notes/Bloco de notas para guardar.

---

## 🆘 Se Continuar Deletando:

Pode haver um problema com RLS ou permissões. Execute isto no SQL Editor:

```sql
-- Verificar que nenhuma policy está deletando dados
SELECT * FROM pg_policies WHERE tablename = 'users' AND qual = 'DELETE';

-- Se houver DELETE policy, deletar:
-- DROP POLICY "policy_name" ON users;
```

---

**Depois de criar os usuários, teste novamente o app!** 🚀
