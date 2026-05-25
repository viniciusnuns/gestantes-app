# Guia de Aplicação: Event-Log Architecture

**Status:** Pronto para implementação  
**Criado por:** Dara (Data Engineer)  
**Data:** 2026-05-24  
**Validação:** ✅ APPROVED WITH 3 CORRECTIONS

## O que foi criado

A migração implementa uma arquitetura baseada em event-log (fonte de verdade) que:

- ✅ Suporta repetição de exercícios (Ex-1 no dia 1 + Ex-1 no dia 4 = 2 eventos, 40 pts)
- ✅ Sincroniza 4 telas (Home, Biblioteca, Progresso, Ranking) em tempo real
- ✅ Calcula automaticamente progresso semanal
- ✅ Persiste 100% do histórico no Supabase
- ✅ Mantém dados em timezone Brasil (America/Sao_Paulo)

## Tabelas criadas

### `daily_activities` (Sugestões diárias)
```sql
- id UUID (chave primária)
- user_id UUID (quem é)
- activity_date DATE (qual dia)
- exercise_id TEXT (qual exercício: ex-1, ex-2, etc)
- slot_order SMALLINT (1, 2 ou 3 = posição na sugestão)
- trimestre SMALLINT (1, 2 ou 3)
- week_number SMALLINT (semana da gestação)
- generated_at TIMESTAMPTZ (quando foi sugerido)
```

### `user_activity_history` (Histórico de conclusões - FONTE DE VERDADE)
```sql
- id UUID (chave primária)
- user_id UUID (quem fez)
- exercise_id TEXT (qual exercício)
- exercise_name TEXT (nome do exercício - snapshot)
- activity_date DATE (qual dia - força timezone BR)
- completed_at TIMESTAMPTZ (quando completou)
- points_earned INTEGER (padrão 20)
- source TEXT ('biblioteca', 'home', 'calendario', 'admin')
- daily_activity_id UUID (link para sugestão, opcional)

⚠️ SEM constraint UNIQUE → permite repetições propositais
```

## Views derivadas (sempre sincronizadas)

### `v_user_stats`
```sql
SELECT * FROM v_user_stats;
-- Retorna por usuário:
-- - total_points (soma de todos os pontos)
-- - active_days (quantidade de dias distintos com atividade)
-- - total_completions (quantidade total de registros)
-- - first_activity_date / last_activity_date
```

### `v_ranking`
```sql
SELECT * FROM v_ranking;
-- Retorna ranking em tempo real:
-- - position (RANK() OVER points DESC)
-- - user_id, name
-- - total_points, active_days, total_completions
```

## Passos para aplicar

### 1. Acesse o SQL Editor do Supabase

Vá para: **https://supabase.com/dashboard/project/odirmtmompghjgmhotml/sql/new**

(Use as credenciais da conta que tem acesso ao projeto Gestar em Movimento)

### 2. Cole a migração

Abra o arquivo: `supabase/migrations/2026-05-24_event_log_architecture.sql`

Copie TODO o conteúdo e cole no editor SQL do Supabase.

### 3. Execute

Pressione **Ctrl+Enter** (ou clique em "RUN" / ▶️ verde)

**Aguarde ~5-10 segundos** enquanto o Supabase processa.

### 4. Valide

No mesmo editor, execute cada comando abaixo para verificar:

```sql
-- Verificar tabelas
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('daily_activities', 'user_activity_history') AND table_schema = 'public';

-- Deve retornar 2 linhas:
-- daily_activities
-- user_activity_history

-- Verificar views
SELECT table_name FROM information_schema.views 
WHERE table_name IN ('v_user_stats', 'v_ranking') AND table_schema = 'public';

-- Deve retornar 2 linhas:
-- v_user_stats
-- v_ranking

-- Testar ranking vazio
SELECT * FROM v_ranking LIMIT 5;

-- Deve retornar 0 linhas (ainda sem dados)
```

## Dados de teste (opcional)

Para testar sem fake data, você pode inserir dados de exemplo:

```sql
-- Inserir uma atividade de teste
INSERT INTO user_activity_history(user_id, exercise_id, exercise_name, completed_at, source)
VALUES(
  '12345678-1234-1234-1234-123456789012', -- substitua pelo UUID real de um usuário
  'ex-1',
  'Respiração Consciente',
  NOW(),
  'biblioteca'
);

-- Verificar se foi criada
SELECT * FROM user_activity_history WHERE exercise_id = 'ex-1' LIMIT 1;

-- Verificar stats (deve mostrar total_points=20, active_days=1)
SELECT * FROM v_user_stats WHERE user_id = '12345678-1234-1234-1234-123456789012';
```

## Campos a respeitar

Quando a app insere em `user_activity_history`, respeite:

| Campo | Tipo | Obrigatório | Padrão | Notas |
|-------|------|------------|--------|-------|
| `user_id` | UUID | ✅ | — | UUID do usuário (from `getCurrentUser()`) |
| `exercise_id` | TEXT | ✅ | — | ID do exercício (ex: "ex-1", "ex-2") |
| `exercise_name` | TEXT | ✅ | — | Nome do exercício (para auditoria) |
| `completed_at` | TIMESTAMPTZ | ✅ | NOW() | Timestamp com timezone |
| `activity_date` | DATE | ❌ | AUTO (trigger) | Calculado automaticamente do completed_at em timezone BR |
| `points_earned` | INTEGER | ❌ | 20 | Padrão 20; pode ser 0-1000 |
| `source` | TEXT | ❌ | 'biblioteca' | Uma de: 'home', 'biblioteca', 'calendario', 'admin' |
| `daily_activity_id` | UUID | ❌ | NULL | Link para `daily_activities` (opcional) |

## Próximos passos

Após migração aplicada com sucesso:

### Phase 1 ✅ COMPLETA
- [x] Criar schema (daily_activities, user_activity_history)
- [x] Criar views (v_user_stats, v_ranking)
- [x] Criar triggers (enforce_activity_date_brt)
- [x] Criar indexes
- [x] Configurar RLS policies

### Phase 2 TODO (Zustand + Hooks)
Implementar em `lib/stores/activityStore.ts`:
- [ ] Create Zustand store com realtime subscription
- [ ] Implementar hooks derivados:
  - [ ] `useUserHeader()` - sincronizar semana/trimestre
  - [ ] `useTodayExercises()` - exercícios do dia
  - [ ] `useMonthView()` - visualizar mês
  - [ ] `useUserStats()` - pontos e atividades
  - [ ] `useRanking()` - ranking em tempo real
  - [ ] `useActivityMutations()` - inserir atividades

### Phase 3 TODO (Refatorar componentes)
- [ ] Atualizar Home para usar `useUserHeader()` + `useTodayExercises()`
- [ ] Atualizar Biblioteca para usar `useActivityMutations()`
- [ ] Atualizar Progresso para usar `useUserStats()` + `useRanking()`
- [ ] Criar Calendário novo com `useMonthView()`

### Phase 4 TODO (Integração)
- [ ] Implementar migração de dados (user_exercises → user_activity_history)
- [ ] Testes de sincronização entre telas
- [ ] Testes de repetição de exercícios
- [ ] Deploy em produção

## Tech-debt registrado

| ID | Descrição | Quando resolver |
|----|-----------|----|
| TD-001 | Migrar de custom auth para Supabase Auth + enable strict RLS | MVP + 2 releases |
| TD-002 | Criar materialized view para v_ranking (refresh a cada 1h) | Quando > 500 usuários |
| TD-003 | Particionar user_activity_history por mês/trimestre | Quando > 1M eventos |

## Support

Se tiver dúvidas:
1. Verifique os comentários SQL no arquivo (`COMMENT ON TABLE...`)
2. Consulte este guia
3. Revise a validação de Dara em `.aiox/handoffs/`

---

**Criado pelo AIOX Data Engineer (Dara) em 24 de maio de 2026**
