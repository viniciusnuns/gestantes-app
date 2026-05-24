# Criar Usuário de Teste (Admin)

## Método 1: Via Supabase Dashboard (Recomendado)

### Passo 1: Abrir Supabase
1. Acesse: https://supabase.com
2. Entre no projeto "gestantes-em-movimento"
3. Clique em **Authentication** (no menu lateral esquerdo)
4. Clique na aba **Users**

### Passo 2: Criar Novo Usuário
1. Clique no botão **"Create user"** ou **"Add user"** (no topo à direita)
2. Preencha os dados:

| Campo | Valor |
|-------|-------|
| Email | `mae@test.com` |
| Password | `Senha123456` |
| Confirm password | `Senha123456` |

3. **IMPORTANTE**: Deixe marcado **"Auto confirm user"** ✅
4. Clique em **"Save"**

### Passo 3: Adicionar Perfil no Banco
1. Clique em **SQL Editor** (ícone de BD no menu lateral)
2. Clique em **New Query**
3. Cole este SQL (substitute o `user_id` pelo ID do usuário criado):

```sql
INSERT INTO users (
  id, 
  email, 
  name, 
  week, 
  healthy_pregnancy, 
  had_intercurrence, 
  doctor_approved, 
  objectives, 
  discomforts
) VALUES (
  'COPIE_O_ID_DO_USUARIO_AQUI',
  'mae@test.com',
  'Mãe Admin - Teste',
  22,
  true,
  false,
  true,
  ARRAY['preparar-para-parto'],
  ARRAY['dor-lombar']
);
```

4. Clique em **Run** (botão azul)
5. Aguarde "Success" ✅

### Passo 4: Testar no App
1. Acesse: http://localhost:3000
2. Clique em "Já tem conta?"
3. Faça login com:
   - **Email**: `mae@test.com`
   - **Senha**: `Senha123456`
4. Você deve ir para a tela **"Olá, Você 💗"** de boas-vindas

---

## Onde Pegar o User ID?

1. Em **Authentication** → **Users**
2. Clique no usuário que você criou
3. Copie o valor de **UID** (User ID)
4. Cole no SQL acima onde diz `COPIE_O_ID_DO_USUARIO_AQUI`

**Exemplo:**
```
id: c12a3b4d-5e6f-7g89-h012-i34j56k789l0
```

---

## ✅ Credenciais de Teste

Após seguir os passos acima:

```
📧 Email:    mae@test.com
🔐 Senha:    Senha123456
```

Use essas credenciais para testar todo o fluxo do app!

---

## 🎯 O Que Testar

1. ✅ Login na página inicial
2. ✅ Tela "Olá, Você 💗" aparecer
3. ✅ Ver o nome "Mãe Admin - Teste" no header
4. ✅ Avançar pelos 6 passos de onboarding
5. ✅ Salvar dados
6. ✅ Ver a página home com exercícios

---

## Se Receber Erro "Auto confirm user"

Se a opção "Auto confirm user" não existir:

1. Vá em **Project Settings** (ícone de engrenagem)
2. Clique em **Auth** → **Providers**
3. Procure por **Email**
4. Desmarque "Confirm email" se tiver marcado
5. Salve
6. Tente criar o usuário novamente

---

## Próxima Vez

Para criar usuários no futuro sem problemas de rate limit, aguarde pelo menos 1 minuto entre cada criação.

Ou use este comando (se tiver acesso ao CLI do Supabase):

```bash
supabase auth create --email mae@test.com --password Senha123456
```
