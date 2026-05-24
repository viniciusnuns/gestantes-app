# 🧪 Credenciais de Teste

## Usuário Admin (Mãe)

```
📧 Email:    mae@test.com
🔐 Senha:    Senha123456
```

**Como criar:**
Siga o guia em `CREATE_TEST_USER.md`

---

## URLs de Teste

| Função | URL |
|--------|-----|
| **Página de Login** | http://localhost:3000 |
| **Onboarding** | http://localhost:3000 (após login) |
| **Home/Dashboard** | http://localhost:3000/home |
| **Biblioteca** | http://localhost:3000/biblioteca |
| **Progresso** | http://localhost:3000/progresso |
| **Comunidade** | http://localhost:3000/comunidade |
| **Painel Terapeuta** | http://localhost:3000/dashboard |

---

## Fluxo de Teste Completo

### 1. Login
- Acesse: http://localhost:3000
- Clique em "Já tem conta?"
- Email: `mae@test.com`
- Senha: `Senha123456`
- Clique "Entrar"

### 2. Onboarding (6 passos)
- **Step 1**: Boas-vindas → Clique "Próximo"
- **Step 2**: Dados da gestação → Preencha semana e clique "Próximo"
- **Step 3**: Contatos → Preencha email/telefone → "Próximo"
- **Step 4**: Saúde → Selecione opções → "Próximo"
- **Step 5**: Objetivos → Marque objetivos → "Próximo"
- **Step 6**: Desconfortos → Marque desconfortos → "Salvar"

### 3. Home
- Deve aparecer: "Olá, Você 💗"
- Nome: "Mãe Admin - Teste"
- Exercícios disponíveis

### 4. Outras Páginas
- Clique nos tabs: Biblioteca, Progresso, Comunidade
- Teste a navegação

---

## Painel Terapeuta

**URL:** http://localhost:3000/dashboard

### Criar Conta Terapeuta
1. Clique "Criar Conta Profissional"
2. Preencha:
   - Nome: Seu nome
   - Especialidade: Sua especialidade
   - Email: Um email único
   - Senha: Mínimo 6 caracteres
3. Clique "Criar Conta"

### Adicionar Paciente
1. Após login, clique "+ Adicionar Paciente"
2. Digite: `mae@test.com`
3. Clique "Adicionar"
4. Veja a paciente na lista!

---

## 🐛 Debug

### Abrir Console do Navegador
- **Mac**: `Cmd + Opt + J`
- **Windows**: `Ctrl + Shift + J`

### Ver Logs
Procure por mensagens como:
```
✅ Login bem-sucedido
Auth state changed
```

### Limpar Cache/Cookies
- **Mac**: `Cmd + Shift + R` (Force refresh)
- **Windows**: `Ctrl + Shift + R` (Force refresh)

---

## Status de Implementação

| Funcionalidade | Status |
|---|---|
| Login/Signup | ⚠️ Corrigindo |
| Onboarding | ✅ Funcional |
| Home | ✅ Funcional |
| Biblioteca | ✅ Funcional |
| Progresso | ✅ Funcional |
| Comunidade | ✅ Funcional |
| Painel Terapeuta | ✅ Funcional |
| Adicionar Pacientes | ✅ Funcional |

---

**Última atualização:** 22/05/2026 11:50

Se encontrar problemas, abra o Console (F12) e procure por mensagens de erro! 🔍
