# Dashboard de Terapeuta - Início Rápido

## 🎯 O Que Foi Criado

Um painel completo para você (terapeuta/profissional de saúde) visualizar e monitorar todas as suas pacientes e seus progressos.

## 📁 Arquivos Adicionados

### Backend (Serviços):
- `lib/therapist.ts` - Funções para buscar dados de terapeuta e pacientes
- `therapist-setup.sql` - Schema do banco de dados para terapeutas

### Frontend (Componentes):
- `components/auth/TherapistAuthForm.tsx` - Formulário de login/cadastro para terapeuta
- `components/dashboard/PatientCard.tsx` - Card para visualizar paciente na lista
- `app/dashboard/page.tsx` - Página principal do painel
- `app/dashboard/patient/[id]/page.tsx` - Página de detalhes de cada paciente

### Documentação:
- `THERAPIST_SETUP.md` - Guia de configuração do banco de dados
- `DASHBOARD_QUICK_START.md` - Este arquivo

## 🚀 Passos Para Ativar

### 1️⃣ **Configurar Banco de Dados** (5 minutos)

Siga as instruções em `THERAPIST_SETUP.md`:
- Abra Supabase SQL Editor
- Cole o conteúdo de `therapist-setup.sql`
- Execute (Run)
- Aguarde "Success"

### 2️⃣ **Testar no Navegador** (5 minutos)

```bash
npm run dev
```

Acesse: http://localhost:3000/dashboard

Você deve ver:
- ✅ Formulário de login/cadastro para terapeuta
- ✅ Opção de "Criar Conta Profissional" ou "Entrar"

### 3️⃣ **Criar Sua Conta de Terapeuta**

1. Clique em "Criar Conta Profissional"
2. Preencha:
   - Nome: Seu nome completo
   - Especialidade: Sua especialidade (ex: Fisioterapia)
   - Email: Um email único
   - Senha: Mínimo 6 caracteres
3. Clique em "Criar Conta"

Agora você está logado no painel! 🎉

### 4️⃣ **Adicionar Suas Pacientes**

Clique em "+ Adicionar Paciente" e digite o email de uma paciente que já se cadastrou no app.

**IMPORTANTE:** A paciente deve ter feito o cadastro no app ANTES de você poder adicioná-la.

### 5️⃣ **Explorar os Dados**

Clique em qualquer paciente para ver:
- Status completo de saúde
- Informações de contato
- Semana de gestação
- Objetivos dela
- Desconfortos relatados
- Histórico de todos os exercícios
- Progresso (pontos, sequência, dias ativos, etc)

## 📊 O Que Você Consegue Ver

### Para Cada Paciente:

**Status de Saúde:**
- ✅ Gestação saudável (sim/não)
- ✅ Tem intercorrências (sim/não)
- ✅ Aprovação do médico (sim/não)
- Visual em cores: 🟢 Saudável | 🟡 Intercorrências | 🔴 Alerta

**Informações Pessoais:**
- Email e telefone
- Semana de gestação atual
- Quando se cadastrou

**Objetivos de Treino:**
- Preparação para parto
- Aliviar desconfortos
- Manter saúde
- Fortalecer musculatura

**Desconfortos Relatados:**
- Dor lombar
- Inchaço
- Fadiga
- Insônia
- Azia
- Falta de ar

**Atividades:**
- Histórico completo de exercícios
- Data e hora de cada exercício
- Duração (se registrada)

**Progresso:**
- Pontos totais acumulados
- Dias ativos
- Sequência atual (dias consecutivos)
- Total de exercícios realizados

## 🔐 Segurança

- Cada terapeuta vê APENAS as pacientes que foram atribuídas a ela
- Cada paciente vê APENAS seus próprios dados
- Dados criptografados em trânsito e no repouso
- Row Level Security do Supabase garante isolamento de dados

## 💡 Fluxo de Uso Recomendado

1. **Você cria conta** no painel (`/dashboard`)
2. **Suas pacientes fazem cadastro** no app normal (`/`) com login
3. **Você adiciona** cada paciente pelo email dela no painel
4. **Você monitora** progresso, atividades e saúde delas
5. **Você acompanha** a semana de gestação e objetivos

## 🎨 Design

- Cores personalizadas: Rosa/Roxo/Pêssego (mesmo do app)
- Interface limpa e intuitiva
- Responsiva (funciona em desktop, tablet, mobile)
- Busca de pacientes integrada
- Cards com status visual de saúde

## 📱 URLs Disponíveis

```
GET /dashboard                      → Painel principal + lista de pacientes
GET /dashboard/patient/:id          → Detalhes completos de uma paciente
POST /dashboard (implícito)         → Login/logout de terapeuta
```

## 🔧 Se Precisar de Ajustes

O painel foi feito para ser flexible:
- Adicione mais campos em `lib/therapist.ts`
- Customize componentes em `components/dashboard/`
- Altere cores em `app/dashboard/` e componentes
- Adicione gráficos em `app/dashboard/patient/[id]/`

## 🎯 Próximos Passos (Opcional)

Se quiser expandir depois:
1. Adicionar gráficos de progresso
2. Exportar relatório em PDF
3. Enviar mensagens às pacientes
4. Agendamento de consultas
5. Notas privadas por paciente
6. Alertas de abandono (sem atividades por X dias)

---

## ✅ Checklist Rápido

- [ ] Abri `therapist-setup.sql` no SQL Editor do Supabase
- [ ] Executei o SQL e recebi "Success"
- [ ] Rodei `npm run dev`
- [ ] Acessei http://localhost:3000/dashboard
- [ ] Criei minha conta de terapeuta
- [ ] Adicionei uma paciente pelo email
- [ ] Visualizei os detalhes dela
- [ ] Testei a busca de pacientes

Pronto! 🚀
