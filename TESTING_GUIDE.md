# Guia de Testes - Gestar em Movimento

**Status:** MVP com 4 telas 100% integradas e sincronizadas  
**Data:** 2026-05-24  
**Ambiente:** http://localhost:3000

---

## ✅ Checklist de Testes

### **1. Setup Inicial**

- [ ] Servidor rodando: `npm run dev`
- [ ] Abrir: http://localhost:3000
- [ ] Deve redirecionar para `/` (landing page)

### **2. Fluxo Signup/Login**

#### **Primeira vez: Signup**
- [ ] Clique em "Começar agora"
- [ ] Preencha formulário:
  - Email: `teste@example.com`
  - Senha: `123456`
  - Confirmar: `123456`
- [ ] Clique "Criar conta"
- [ ] Deve redirecionar para `/onboarding`

#### **Onboarding (6 steps)**
- [ ] Step 1: Nome (ex: "Maria da Silva")
- [ ] Step 2: Semana (ex: 20)
- [ ] Step 3: Data prevista (automática)
- [ ] Step 4: Tipo de parto (escolher um)
- [ ] Step 5: Checkbox de saúde
- [ ] Step 6: Objetivos/desconfortos
- [ ] Clique "Finalizar"
- [ ] Tela "Pronto!" deve aparecer
- [ ] Clique "Começar agora"
- [ ] **ESPERADO:** Redireciona para `/home`

### **3. Home Page Tests**

- [ ] Header mostra: `Olá, [nome] 💗`
- [ ] Mostra semana correta (deve aumentar 1 por semana)
- [ ] Mostra trimestre (1º/2º/3º)
- [ ] Mostra 3 exercícios do dia
- [ ] **Cada exercício é read-only** (sem botão de toggle)
- [ ] Meta semanal: 0/5 (deve aumentar quando completar)
- [ ] Card "Seu progresso": 0 pontos, 0 dias ativos
- [ ] Botão "Sair" no canto superior direito funciona
- [ ] Clique em exercício → Vai para `/biblioteca/[id]`

### **4. Biblioteca Tests**

#### **Lista (browse)**
- [ ] Mostra todos os exercícios
- [ ] Filtrados por trimestre (deve ver 3 por trimestre)
- [ ] Clique em qualquer exercício → Vai para detalhe

#### **Detalhe (`/biblioteca/[id]`)**
- [ ] Mostra imagem do exercício
- [ ] Mostra nome, categoria, duração
- [ ] Mostra descrição completa
- [ ] Botão "Completei a prática" está azul (ativo)
- [ ] Clique no botão → "Salvando..." aparece
- [ ] Após salvar → Botão fica verde com "Prática concluída · +20 pontos"
- [ ] Botão fica desabilitado
- [ ] Voltar para Home → **Exercício deve mostrar com checkmark** ✨

### **5. Sincronização em Tempo Real (Cross-Screen)**

#### **Test: Marcar em Biblioteca, Verificar em Home**
- [ ] Abra 2 abas do navegador
- [ ] Aba 1: `/home`
- [ ] Aba 2: `/biblioteca/ex-1`
- [ ] Na Aba 2: Clique "Completei a prática"
- [ ] **ESPERADO:** Na Aba 1, sem recarregar:
  - [ ] Exercício aparece com checkmark
  - [ ] "Meta semanal" sobe para 1/5
  - [ ] "Pontos" muda para 20
  - [ ] "Dias ativos" muda para 1

#### **Test: Marcar em Biblioteca, Verificar em Progresso**
- [ ] Abra 2 abas
- [ ] Aba 1: `/progresso`
- [ ] Aba 2: `/biblioteca`
- [ ] Na Aba 2: Marque outro exercício
- [ ] **ESPERADO:** Na Aba 1, sem recarregar:
  - [ ] Pontos sobem (20 → 40)
  - [ ] "Esta semana" mostra mais dias completos
  - [ ] Ranking pode atualizar

### **6. Calendário Tests**

- [ ] Acesse `/calendario`
- [ ] **Sem dados de test:** Mostra grid vazio (é esperado)
- [ ] Navegação entre meses funciona
- [ ] Botão "Hoje" volta para dia atual
- [ ] Header sincronizado: Mostra "Semana 20 · 2º trimestre"
- [ ] Clique em um dia → Vai para `/calendario/[date]`

#### **Dia Detail (quando houver dados)**
- [ ] Volta mostra exercícios sugeridos (quando houver)
- [ ] Botão "Completei" funciona
- [ ] Após completar → Mostra checkmark verde

### **7. Progresso Tests**

- [ ] Tab "Ranking": Mostra ranking (pode estar vazio no início)
- [ ] Tab "Conquistas": Mostra conquistas (todas bloqueadas no início)
- [ ] Tab "Histórico":
  - [ ] Mostra total de pontos
  - [ ] Mostra dias totais
  - [ ] Mostra total de práticas
  - [ ] Lista as últimas 10 datas com atividades
- [ ] Sincroniza com Home (mesmo número de pontos)

### **8. Logout/Relogin**

- [ ] Na Home, clique botão "Sair"
- [ ] Deve voltar para `/`
- [ ] Faça login novamente com mesmo email/senha
- [ ] **ESPERADO:** Volta para Home com TODOS os dados preservados:
  - [ ] Nome correto
  - [ ] Semana aumentou (se passou 1 semana)
  - [ ] Pontos estão lá
  - [ ] Exercícios completados mostram checkmark
  - [ ] Histórico intacto

---

## 🧪 Testes Avançados

### **Teste: Múltiplas abas simultâneas**

1. Abra 3 abas:
   - Aba A: Home
   - Aba B: Biblioteca (detalhe)
   - Aba C: Progresso

2. Em Aba B: Marque um exercício
3. **ESPERADO:**
   - Aba A: Atualiza imediatamente (sem refresh)
   - Aba C: Pontos sobem imediatamente

### **Teste: Offline (simular)**

1. Home carregada normalmente
2. DevTools → Network → Offline
3. Tente marcar exercício na Biblioteca
4. **ESPERADO:** Erro gracioso ("Erro ao salvar. Tente novamente.")

### **Teste: Múltiplos usuários**

1. Navegador privado: Signup com `user2@example.com`
2. Navegador principal: Continua com `teste@example.com`
3. Marque exercício em ambas as janelas
4. **ESPERADO:**
   - Cada usuário vê seus dados isolados
   - Ranking mostra ambos (quando implementado)

---

## 📊 O que Está Implementado

### **Phase 2: Store Centralizado**
- ✅ Zustand store com estado global
- ✅ Realtime subscriptions (3 canais: activities, stats, ranking)
- ✅ 8 hooks derivados para componentes
- ✅ Otimistic updates com rollback

### **Phase 3: Calendário**
- ✅ Grid visual do mês
- ✅ Indicadores (verde = completo, amarelo = pendente)
- ✅ Navegação entre meses
- ✅ Página de detalhe do dia com 3 sugestões

### **Sincronização**
- ✅ Home ↔ Biblioteca (exercícios, pontos, meta semanal)
- ✅ Biblioteca → Progresso (pontos, histórico)
- ✅ Calendário → todas as telas (atividades)
- ✅ Progresso → Home (ranking, badges)

---

## 🚀 Como Inserir Dados de Teste (Optional)

Se quiser testar o Calendário com sugestões reais:

```sql
-- Execute no Supabase SQL Editor

-- Inserir sugestões para hoje (3 exercícios)
INSERT INTO daily_activities(user_id, activity_date, exercise_id, slot_order, trimester, week_number, generated_at)
VALUES
  ('[USER_UUID]', '2026-05-24', 'ex-1', 1, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-24', 'ex-4', 2, 2, 20, NOW()),
  ('[USER_UUID]', '2026-05-24', 'ex-7', 3, 2, 20, NOW());

-- Inserir 5 atividades de teste
INSERT INTO user_activity_history(user_id, exercise_id, exercise_name, completed_at, points_earned, source)
VALUES
  ('[USER_UUID]', 'ex-1', 'Respiração Consciente', NOW() - INTERVAL '2 days', 20, 'biblioteca'),
  ('[USER_UUID]', 'ex-4', 'Caminhada Leve', NOW() - INTERVAL '1 day', 20, 'biblioteca'),
  ('[USER_UUID]', 'ex-1', 'Respiração Consciente', NOW(), 20, 'biblioteca');
```

Substitua `[USER_UUID]` pelo UUID do usuário logado (veja no console.log ou localStorage `customAuthSession`).

---

## 🎯 Critério de Sucesso

**MVP pronto quando:**
- [x] 4 telas carregam sem erros
- [x] Signup/Login funciona
- [x] Onboarding funciona
- [x] Marcar exercício salva em Supabase
- [x] Realtime sync funciona entre telas
- [x] Logout/Relogin preserva dados
- [x] Build TypeScript passa
- [ ] Testar em 2+ navegadores (Chrome, Safari, Firefox)
- [ ] Testar em mobile (responsive)

---

## 📱 Testes Mobile (opcional)

Se tiver iPhone/Android:
- Acesse: `http://[seu-ip-local]:3000` (ex: 192.168.1.100:3000)
- Teste swipe, toque, orientação

---

## 🐛 Bugs Conhecidos (Tech-Debt)

- [ ] **TD-001:** Migrar custom auth para Supabase Auth (depois de MVP)
- [ ] **TD-002:** Materialized view para v_ranking (quando > 500 usuários)
- [ ] **TD-003:** Particionar user_activity_history (quando > 1M eventos)
- [ ] **TD-004:** Implementar Conquistas/Badges (próxima sprint)
- [ ] **TD-005:** Gerar daily_activities automaticamente (via cron job)

---

## 📞 Suporte

Se algo não funcionar:

1. **Verificar logs:** `tail -f /tmp/dev.log`
2. **Verificar console do navegador:** DevTools → Console
3. **Verificar Supabase:** Logs do projeto Supabase
4. **Reset localStorage:** DevTools → Application → Clear Storage → Reload

---

**Bom teste! 🎉**
