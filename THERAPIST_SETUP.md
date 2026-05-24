# Guia de Configuração - Painel de Terapeuta

## ✅ Passo 1: Criar Tabelas de Terapeuta no Supabase

1. Abra o Supabase: https://supabase.com
2. Entre no seu projeto "gestantes-em-movimento"
3. Clique em **SQL Editor** (ícone de banco de dados no menu lateral)
4. Clique em **New Query**
5. Cole TODO o SQL do arquivo `therapist-setup.sql` (neste diretório)
6. Clique em **Run** (botão azul com play)
7. Espere a mensagem "Success" ✅

## 📊 Tabelas Criadas:

### therapists
Armazena dados dos profissionais de saúde:
- id (referência auth.users)
- email, name
- specialty (ex: Fisioterapia, Obstetrícia)
- created_at, updated_at

### therapist_patients
Relacionamento entre terapeuta e pacientes (muitos para muitos):
- therapist_id (referência therapists)
- user_id (referência users)
- assigned_at

## 🔐 Segurança - Row Level Security (RLS)

Políticas de acesso implementadas:
- Terapeutas só veem seus próprios dados
- Terapeutas só veem pacientes que foram atribuídos a eles
- Terapeutas podem visualizar atividades e progresso apenas de pacientes atribuídos

## 🚀 Usando o Painel

### Para Acessar:
1. Acesse http://localhost:3000/dashboard
2. Clique em **"Criar Conta Profissional"**
3. Preencha:
   - Nome Completo
   - Especialidade (opcional, ex: Fisioterapia)
   - Email
   - Senha (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**

### Para Adicionar Pacientes:
1. Após fazer login, clique em **"+ Adicionar Paciente"**
2. Digite o email da paciente que já se cadastrou no app
3. Clique em **"Adicionar"**
4. A paciente agora aparece na sua lista de pacientes

### Para Visualizar Detalhes:
1. Clique no card de qualquer paciente
2. Visualize:
   - Status de saúde (gestação saudável, intercorrências, etc)
   - Informações de contato
   - Semana de gestação
   - Objetivos da paciente
   - Desconfortos relatados
   - Histórico completo de exercícios
   - Progresso (pontos, dias ativos, sequência, total de exercícios)

## 📱 Funcionalidades do Dashboard:

### Painel Principal:
- ✅ Lista de todas as suas pacientes
- ✅ Busca por nome ou email
- ✅ Status visual de saúde (verde/amarelo/vermelho)
- ✅ Semana de gestação por paciente
- ✅ Adicionar novas pacientes por email

### Detalhes da Paciente:
- ✅ Status de gestação completo
- ✅ Contato e informações pessoais
- ✅ Objetivos de treino
- ✅ Desconfortos relatados
- ✅ Histórico de todos os exercícios realizados
- ✅ Métricas de progresso em tempo real
- ✅ Sequência de atividades

## 🔗 Estrutura de URLs:

```
/dashboard              - Painel principal (login/lista de pacientes)
/dashboard/patient/[id] - Detalhes completos da paciente
```

## 💡 Dicas:

- As pacientes precisam ter feito o cadastro no app ANTES de você adicioná-las por email
- Os dados são sincronizados em tempo real do banco de dados
- Você só vê dados de pacientes que foram atribuídas a você
- Use a busca para encontrar rapidamente uma paciente específica

## 🆘 Troubleshooting

Se receber erro ao adicionar paciente:
1. Verifique se o email da paciente existe no sistema (ela deve ter feito o cadastro antes)
2. Verifique se digitou o email correto
3. Verifique sua conexão com internet

Se o painel não carrega:
1. Verifique se você está logado (verá botão "Sair" no topo)
2. Limpe o cache do navegador (Cmd+Shift+R no Mac, Ctrl+Shift+R no Windows)
3. Verifique se o Supabase está online
