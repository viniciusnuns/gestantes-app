# ⚡ Quick Start - Teste Rápido

## 🎯 Objetivo
Criar um usuário de teste e testar o app inteiro em 5 minutos.

---

## 📝 Passo 1: Criar Usuário no Supabase (3 min)

### 1.1 Abrir Supabase
```
https://supabase.com → Login → gestantes-em-movimento
```

### 1.2 Ir para Users
```
Authentication (menu esquerdo) → Users
```

### 1.3 Criar Novo User
Clique em **"Create user"** (botão azul no topo direito)

Preencha:
```
Email:           mae@test.com
Password:        Senha123456
Confirm Password: Senha123456
✅ Auto confirm user (MARQUE!)
```

Clique em **"Save"**

### 1.4 Copiar ID do Usuário
1. Clique no usuário que foi criado
2. Copie o **UID** (User ID)
   - Parece com: `c12a3b4d-5e6f-7g89-h012-i34j56k789l0`

---

## 💾 Passo 2: Adicionar ao Banco de Dados (1 min)

### 2.1 SQL Editor
```
SQL Editor (menu lateral) → New Query
```

### 2.2 Cole Este SQL
```sql
INSERT INTO users (id, email, name, week, healthy_pregnancy, had_intercurrence, doctor_approved, objectives, discomforts) 
VALUES (
  'COLE_O_UID_AQUI',
  'mae@test.com',
  'Mãe Admin',
  22,
  true,
  false,
  true,
  ARRAY['preparar-para-parto'],
  ARRAY['dor-lombar']
);
```

**IMPORTANTE**: Troque `COLE_O_UID_AQUI` pelo UID copiado no passo anterior!

### 2.3 Executar
Clique em **"Run"** (botão azul) → Aguarde "Success" ✅

---

## 🧪 Passo 3: Testar no App (1 min)

### 3.1 Abrir App
```
http://localhost:3000
```

### 3.2 Fazer Login
1. Clique em **"Já tem conta?"**
2. Email: `mae@test.com`
3. Senha: `Senha123456`
4. Clique em **"Entrar"**

### 3.3 Ver Boas-Vindas
Você deve ver:
```
Olá, Você 💗
Bem-vinda ao seu espaço de bem-estar
```

✅ **Funcionou!** 🎉

---

## 🎮 Testar Recursos

### Onboarding (6 passos)
- Clique "Próximo" em cada tela
- Preencha os dados
- No final, clique "Salvar"

### Home/Dashboard
```
http://localhost:3000/home
```
- Veja exercícios disponíveis
- Teste cliques

### Outras Páginas
- Biblioteca: `http://localhost:3000/biblioteca`
- Progresso: `http://localhost:3000/progresso`
- Comunidade: `http://localhost:3000/comunidade`

### Painel Terapeuta
```
http://localhost:3000/dashboard
```
- Criar conta profissional
- Adicionar paciente: `mae@test.com`
- Ver dados da paciente

---

## ❓ Precisa de Ajuda?

| Problema | Solução |
|----------|---------|
| "Usuário não encontrado" | Verifique o email `mae@test.com` |
| "Senha incorreta" | Use `Senha123456` (com maiúscula) |
| Ainda na tela de login após entrar | Abra Console (F12) e procure por erros |
| "Auto confirm user" não aparece | Veja `CREATE_TEST_USER.md` - seção Troubleshooting |

---

## 📋 Checklist

- [ ] Usuário criado no Supabase
- [ ] Perfil inserido no banco
- [ ] Consegui fazer login
- [ ] Vi tela "Olá, Você 💗"
- [ ] Testei onboarding
- [ ] Testei home
- [ ] Testei painel terapeuta

✅ Tudo funcionando? Ótimo! 🚀

---

**Tempo total esperado:** ~5 minutos
