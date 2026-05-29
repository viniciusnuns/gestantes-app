---
name: project-gestar-em-movimento
description: Context for the Gestar em Movimento MVP (Next.js + Supabase pregnancy app), audience, scale, and known product gaps
metadata:
  type: project
---

**Product:** Gestar em Movimento — app para gestantes brasileiras com exercícios, calendário gestacional, ranking e comunidade.

**Stack:** Next.js 14 (App Router) + TypeScript + Supabase (custom auth via bcryptjs em `public.users`, NÃO Supabase Auth) + Zustand + Vercel.

**Escala atual:** MVP em produção. 8-12 usuárias/dia esperadas. Filosofia: completar MVP antes de novos features.

**Why:** Owner (Vinicius / vfncoach@gmail.com) está focando em ESTABILIZAR antes de expandir. Toda priorização deve favorecer completar o que já existe e remover quebras > adicionar features novas.

**How to apply:**
- Priorizar bugs e UX gaps sobre novos features
- Não sugerir migrações grandes (ex: Supabase Auth) sem ROI claro vs custo
- Lembrar que ranking, comunidade, biblioteca já estão "100% funcionais" segundo o owner
- Mocked data em `lib/data.ts` (achievements, communityPosts iniciais, ranking inicial) é fallback intencional

**Known product gaps identificados (sessão de revisão 2026-05-27):**
- AuthGate comentado em `app/(private)/layout.tsx` → rotas privadas sem proteção real
- Achievements são 100% hardcoded em `lib/data.ts` (não há lógica de desbloqueio)
- Botão Share em PostCard (comunidade) sem handler
- Não há tela de perfil/configurações da usuária
- Não há reset/recuperação de senha
- Vídeos do YouTube em `lib/data.ts` estão marcados como "MVP placeholder — replace before launch" para 6 exercícios
- "Desafio da semana" na home é estático ("7 dias de respiração consciente") — não muda
- Exercícios sugeridos por trimestre são fixos (3 fixos do trimestre) — não personalizados pelos objetivos/desconfortos do onboarding
- Mock data (`communityPosts`, `ranking` antigos) ainda aparece misturado com dados reais em `comunidade/page.tsx`

**Arquitetura REAL confirmada na auditoria PM (2026-05-28, lendo o código — corrige suposições antigas):**
- Estado global = `lib/stores/activityStore.ts` (Zustand). NÃO existe `userStore` nem `useBootstrap`. Carregamento via `useOptimizedSync()` (lib/hooks/useOptimizedSync.ts) que chama `loadUserData()` + realtime subscribe. É chamado em home, progresso, calendario, e no RootInitializer (app/layout.tsx).
- `loadUserData()` busca 4 fontes do Supabase: users (profile), user_activity_history, v_user_stats, v_ranking. Activities/stats/ranking SÃO reais do DB — persistem após refresh. A suposição antiga de "activities somem no refresh" estava ERRADA.
- Ranking (progresso/page.tsx) É real (v_ranking), NÃO hardcoded. Suposição antiga errada. O `currentUser` mock em data.ts (Marina/Carla) NÃO é usado no ranking.
- Logout FUNCIONA: botão na home chama `customSignOut()` (limpa localStorage SESSION_KEY) + router.push('/'). Suposição antiga de "logout não chamado" errada.

**Gaps de PRODUTO reais (não bugs — confirmados):**
- AuthGate comentado em `app/(private)/layout.tsx` — MAS só protege a rota /onboarding (a única dentro de (private)). Home/biblioteca/progresso/comunidade/calendario estão FORA de (private) e SEM proteção alguma. Qualquer um com a URL acessa. Sessão é só localStorage, sem expiração/token real.
- Achievements 100% hardcoded em data.ts (5 conquistas, 2 unlocked:true fixo). Sem lógica de desbloqueio. Aba Conquistas mostra estado fake.
- Botão Share (Share2) em PostCard sem onClick handler — botão morto.
- Sem tela de perfil/configurações (só avatar upload + logout na home).
- Sem reset/recuperação de senha.
- 11 de 12 exercícios têm youtube_video_id = 'placeholder_*' (NÃO são vídeos reais). 9 placeholders. Vídeo cai no fallback de imagem. Core content não existe ainda.
- "Desafio da semana" home = estático ("7 dias de respiração consciente"), progresso amarrado a active_days (não ao desafio real).
- Exercícios "de hoje" na home = filtro fixo por trimester (3 primeiros), ignora objectives/discomforts do onboarding. Personalização prometida não acontece na home.
- daily_activities é gerado no onboarding (/api/activities/generate) mas a home NÃO usa store.dailyActivities (sempre []) — usa filtro de trimester direto de data.ts. Há um sistema de sugestão diária construído mas desconectado da home.
- Comunidade: posts reais (community_posts) com fallback para mockPosts de data.ts. Se DB vazio, mostra mocks. Mistura intencional.
- Pontos: 20pts/exercício hardcoded no client (addActivity), agregado em v_user_stats. Funciona, mas regra de pontos não centralizada.

**Stack de hooks de dados duplicada (tech-debt):** existem useOptimizedSync, useOptimizedPageData, usePageData, usePageDataSync, useActivityInit — múltiplas tentativas de resolver carregamento. Só useOptimizedSync está em uso ativo. Risco de confusão futura.

**Docs desatualizados:** .claude/PRD.md descreve MVP "mock only, no auth, 4 screens" (estado de 2026-05-21) — não reflete o app atual com Supabase+auth+6-step onboarding. MVP_SUMMARY.md (2026-05-24) é mais fiel mas marca tudo como "100% pronto" otimisticamente.
