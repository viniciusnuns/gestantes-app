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
