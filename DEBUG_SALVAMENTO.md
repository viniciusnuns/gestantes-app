# 🔍 Debug - Salvamento de Dados

## 1️⃣ Verificar no Supabase

### Passo 1: Abrir Supabase
```
https://supabase.com
→ gestantes-em-movimento
→ Table Editor (menu lateral)
→ Tabela "users"
```

### Passo 2: Procurar pelo Usuário
Procure por um usuário com email `mae@test.com`

#### Se encontrar:
```
✅ Usuário existe
├── id: [algum código UUID]
├── email: mae@test.com
├── name: [preenchido?]
├── week: [preenchido?]
├── phone: [preenchido?]
└── ...
```

#### Se NÃO encontrar:
```
❌ Usuário não existe na tabela
→ Isso explica o erro!
```

---

## 2️⃣ Testar Salvamento Novamente

### Teste com um Novo Usuário

1. **Criar nova conta** (não use mae@test.com)
   - Email: `mae.nova@test.com` (novo!)
   - Senha: `Senha123`

2. **Fazer login**
   - Email: `mae.nova@test.com`
   - Senha: `Senha123`

3. **Preencher TODO o onboarding:**
   - ✅ Nome: Seu nome completo
   - ✅ Semana: 22
   - ✅ Email: mae.nova@test.com
   - ✅ Telefone: 11999999999
   - ✅ Objetivo: Marque pelo menos um
   - ✅ Desconforto: Marque pelo menos um

4. **Clique em "Salvar"**

---

## 3️⃣ O Que Esperar

### Se Funcionar:
```
✨ Pronto!
Criamos sua jornada personalizada

[Botão "Começar Agora →"]
```

### Se Tiver Erro:
```
❌ ERRO AO SALVAR:

[mensagem de erro específica]
```

Me envie essa mensagem de erro!

---

## 4️⃣ Se Continuar Não Funcionando

Execute este SQL no Supabase para garantir que as permissões estão corretas:

```sql
-- Limpar policies antigas
DROP POLICY IF EXISTS "Users can insert their own data" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Criar policies novas
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Verificar
SELECT * FROM pg_policies WHERE tablename = 'users';
```

Depois tente novamente!

---

## 📝 Checklist

- [ ] Abri Supabase e acessei a tabela users
- [ ] Verifiquei se mae@test.com existe
- [ ] Preenchi TODOS os campos (nome, email, telefone, etc)
- [ ] Cliquei em "Salvar"
- [ ] Vi a tela de "Pronto!" OU recebi mensagem de erro específica

---

**Me avisa se conseguir ou qual foi a mensagem de erro!** 🚀
