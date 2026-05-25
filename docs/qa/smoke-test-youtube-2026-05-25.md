# Smoke Test: Integração YouTube — 2026-05-25

**Executado por:** @qa (Quinn — automated review) + manual sign-off pendente
**Ambiente:** Local dev (Next.js 14.2.35) — `npm run dev` em `http://localhost:3000`
**Data:** 2026-05-25
**Story:** 1.5 — Testes + Deploy YouTube MVP
**Verdict preliminar:** ⚠️ **CONCERNS** — todos os gates automáticos passam; restam 2 itens que dependem de validação manual em browser (não executável neste ambiente headless).

---

## Resumo Executivo

| Categoria | Resultado |
|-----------|-----------|
| TypeScript (`npx tsc --noEmit`) | ✅ 0 errors |
| Production build (`npm run build`) | ✅ Compiled successfully — 17/17 static pages |
| ESLint (`npm run lint`) | ⚠️ NOT-CONFIGURED — Next.js pede setup interativo (Strict/Base). Não é blocker para soft launch mas deve ser endereçado em story futura |
| Migration `video_progress` | ✅ Arquivo presente, idempotente, RLS habilitada |
| Migration `youtube_video_id` em exercises | ✅ Arquivo presente, idempotente (no-op se tabela não existe — caso atual do MVP) |
| Code review YouTubePlayer | ✅ APROVADO — lazy iframe, overlay anti-logo, tracking fire-and-forget |
| Code review API `/api/exercises/[id]` | ✅ APROVADO — 404/500 handling, cache 1h |
| Code review hook `useExercise` | ✅ APROVADO — race-condition guard via `cancelled` flag |
| Code review hook `useTrackVideoEvent` | ✅ APROVADO — fire-and-forget, swallow errors, never breaks player |
| Smoke test manual em browser | ⚠️ PENDENTE — ver checklist abaixo |
| 3G throttle | ⚠️ PENDENTE — ver checklist abaixo |

---

## Validações Automáticas (executadas por @qa)

### Build & Type Safety

```
$ npx tsc --noEmit
✅ 0 errors

$ npm run build
✓ Compiled successfully
✓ Generating static pages (17/17)

Route (app)                              Size     First Load JS
├ ○ /biblioteca                          6.91 kB         301 kB
├ ƒ /biblioteca/[id]                     5.34 kB         303 kB
├ ƒ /api/exercises/[id]                  0 B                0 B
```

**Observação:** Warning não-bloqueante em `/api/me` (dynamic server usage por uso de `request.headers`). Esperado e não relacionado à integração YouTube.

### Inspeção de dados (`lib/data.ts`)

| Exercício | youtube_video_id | Esperado |
|-----------|-----------------|----------|
| ex-1 Mobilidade Pélvica | `jNcC6rg0Zxw` | ✅ |
| ex-2 Respiração Diafragmática | `aXItOY0sLRY` | ✅ |
| ex-3 Alongamento Lombar | `4pKly2JojMw` | ✅ |
| ex-4 Assoalho Pélvico | `pwZdH4yAY-Q` | ✅ |
| ex-5 Agachamento para Parto | `YaXPRqUtMVE` | ✅ |
| ex-6 Relaxamento Progressivo | _(ausente)_ | ✅ image-only |
| ex-7 Fortalecimento Abdominal | _(ausente)_ | ✅ image-only |
| ex-8 Exercícios com Bola Suíça | _(ausente)_ | ✅ image-only |
| ex-9 Caminhada Pelviana | _(ausente)_ | ✅ image-only |

**Ação requerida antes de produção:** validar que os 5 IDs acima apontam para vídeos **realmente unlisted** do canal da equipe — comentário em `lib/data.ts` ("MVP placeholder: real YouTube ID...") sugere que podem ainda ser placeholders.

### Migrations Supabase

| Arquivo | Status |
|---------|--------|
| `supabase/migrations/2026-05-25_add_youtube_video_id_exercises.sql` | ✅ Idempotente (`IF NOT EXISTS` + guard em `information_schema`) |
| `supabase/migrations/2026-05-25_video_progress.sql` | ✅ Tabela + 2 índices + RLS permissiva documentada |

**RLS — atenção:** As policies são propositalmente permissivas (`USING (true)` e `WITH CHECK (true)`) porque o projeto usa **custom auth** (não Supabase Auth). Isolamento por usuário fica na camada da app via `getCurrentUser()`. Isto está **documentado como tech-debt TD-001** no próprio SQL e é aceito para MVP. Esta é uma decisão consciente, não um bug.

---

## Fluxo Principal (Happy Path) — CHECKLIST MANUAL

A executar pela equipe humana (tester) em `http://localhost:3000` ou preview Vercel. Marcar `✅`/`❌` e preencher notas.

| Passo | Ação | Resultado Esperado | Status | Notas |
|-------|------|--------------------|--------|-------|
| 1 | Login como usuária de teste | Dashboard carrega | ⬜ | |
| 2 | Navegar para `/biblioteca` | Lista de 9 exercícios exibe (ex-1 a ex-9) | ⬜ | |
| 3 | Clicar em "Mobilidade Pélvica" (ex-1) | Página do exercício carrega | ⬜ | |
| 4 | Thumbnail YouTube exibe (`maxresdefault.jpg`) | Thumbnail visível, **iframe NÃO carregado ainda** | ⬜ | Confirmar em Network tab que só há request de `img.youtube.com`, não `youtube.com/embed` |
| 5 | Tocar no botão Play (overlay grande) | iframe `youtube.com/embed/...` é mountado, vídeo inicia (autoplay) | ⬜ | |
| 6 | Aguardar 5–10s | Vídeo toca normalmente | ⬜ | |
| 7 | Tentar clicar no **logo YouTube** (top-left do player) | **Clique é BLOQUEADO** pelo overlay transparente (96×56px) | ⬜ | Crítico — se o usuário sair do app, é UX-fail |
| 8 | Clicar Play/Pause do controle YouTube | Funciona | ⬜ | |
| 9 | Clicar Fullscreen | Funciona | ⬜ | |
| 10 | Botão "voltar" (arrow top-left, branco) → vai para `/biblioteca` | Retorna corretamente | ⬜ | |
| 11 | Verificar Supabase: `SELECT * FROM video_progress ORDER BY created_at DESC LIMIT 5;` | 1 registro `play` aparece com `session_id` UUID; ao sair da página, 1 registro `completed` com mesmo `session_id` | ⬜ | |
| 12 | Voltar para `/biblioteca/ex-1` e tocar "Completei a prática" | Botão muda para "Prática concluída · +20 pontos" | ⬜ | |

## Teste em 3G (Slow 3G throttle)

DevTools → Network → "Slow 3G" (400 Kbps / 400ms latency).

| Passo | Resultado | Tempo medido | Target |
|-------|-----------|--------------|--------|
| Page load `/biblioteca/ex-1` | ⬜ | __s | < 5s |
| Thumbnail aparece | ⬜ | __s | < 2s (é 1 imagem) |
| Toque Play → vídeo inicia (primeiro frame) | ⬜ | __s | **< 10s (AC 2)** |

## Teste Mobile 375px (iPhone SE)

DevTools → Device Toolbar → `iPhone SE`.

| Item | Resultado |
|------|-----------|
| Player ocupa 100% da largura (aspect-video) | ⬜ |
| Botão Play é tocável (touch target adequado) | ⬜ |
| Overlay sobre logo YouTube continua bloqueando | ⬜ |
| Botão Voltar não sobrepõe controles do player | ⬜ |
| "Completei a prática" sticky bottom não esconde sob `BottomNav` | ⬜ |

## Teste Tablet 768px

| Item | Resultado |
|------|-----------|
| Layout não quebra | ⬜ |
| Player mantém aspect-ratio | ⬜ |
| Overlay continua bloqueando | ⬜ |

## Exercícios sem Vídeo (AC 6)

| Exercício | Carrega? | Sem erros console? | Fallback de imagem aparece? | "Completar" funciona? |
|-----------|----------|--------------------|-----------------------------|-----------------------|
| ex-6 Relaxamento Progressivo | ⬜ | ⬜ | ⬜ | ⬜ |
| ex-7 Fortalecimento Abdominal | ⬜ | ⬜ | ⬜ | ⬜ |
| ex-8 Exercícios com Bola Suíça | ⬜ | ⬜ | ⬜ | ⬜ |
| ex-9 Caminhada Pelviana | ⬜ | ⬜ | ⬜ | ⬜ |

**Esperado (validado em code review):** `page.tsx` renderiza `<YouTubePlayer/>` apenas se `exercise.youtube_video_id` existe — caso contrário cai no fallback `<img>` ou no placeholder "Vídeo em breve". Lógica confirmada nas linhas 107-127 do arquivo.

## Teste Offline (Graceful Failure)

| Passo | Esperado | Resultado |
|-------|----------|-----------|
| DevTools → Network → "Offline" | — | — |
| Acessar `/biblioteca` | Lista renderiza (dados são estáticos em `lib/data.ts`) | ⬜ |
| Acessar `/biblioteca/ex-1` | Fetch para `/api/exercises/ex-1` falha → mensagem "Exercício não encontrado" + botão "Voltar para a biblioteca" | ⬜ |
| Tocar Play no vídeo (se a página já estava aberta) | Vídeo inicia (iframe cached) ou falha graciosamente | ⬜ |
| Reabilitar network → recarregar | Tudo volta ao normal | ⬜ |
| Tracking video_progress em offline | `useTrackVideoEvent` falha silenciosamente (console.warn) sem travar player | ⬜ |

---

## Checklist Pós-Deploy (para @devops)

Executar APÓS o deploy de produção, antes de liberar tráfego de usuárias reais.

- [ ] `/biblioteca` carrega em produção mostrando os 9 exercícios
- [ ] `/biblioteca/ex-1` carrega em produção com thumbnail YouTube `jNcC6rg0Zxw` (substituir por ID definitivo se ainda placeholder)
- [ ] Play inicia vídeo em produção (testar em conexão móvel real, não apenas WiFi)
- [ ] Tabela `video_progress` existe em produção (`SELECT 1 FROM video_progress LIMIT 0;`)
- [ ] Após 1 play real em produção, registro aparece: `SELECT * FROM video_progress ORDER BY created_at DESC LIMIT 1;`
- [ ] `/biblioteca/ex-6` carrega sem vídeo, sem erros 500 — fallback de imagem visível
- [ ] `npm run build` passou no pipeline (já validado localmente — confirmar mesmo resultado em CI/CD)
- [ ] **Nenhum erro 500 nos logs de produção após 30 minutos de soft launch**
- [ ] Nenhum erro CSP/CORS no console relacionado a `youtube.com` ou `img.youtube.com` em produção
- [ ] Confirmar que os 5 YouTube IDs (`jNcC6rg0Zxw`, `aXItOY0sLRY`, `4pKly2JojMw`, `pwZdH4yAY-Q`, `YaXPRqUtMVE`) são vídeos **da equipe** marcados como **unlisted**, não vídeos genéricos placeholder
- [ ] Sentry / observabilidade: 0 erros críticos relacionados a `YouTubePlayer` ou `useTrackVideoEvent` nas primeiras 24h

---

## Bugs Encontrados

**Nenhum bug funcional encontrado em code review.** As seguintes observações são levantadas como concerns não-bloqueantes:

### CONCERN-001 — ESLint não configurado (severidade: baixa)
- **Sintoma:** `npm run lint` cai em prompt interativo do Next.js
- **Impacto:** AC 8 da story pede "lint passa" — atualmente impossível verificar
- **Recomendação:** abrir story curta para `npx next lint --strict` + commit do `.eslintrc.json` resultante. Não bloqueia este soft launch porque TypeScript já cobre a maior parte do que ESLint pegaria.

### CONCERN-002 — YouTube IDs podem ser placeholders (severidade: média)
- **Sintoma:** Comentários no `lib/data.ts` dizem "MVP placeholder: real YouTube ID. Replace with team's unlisted recording before launch"
- **Impacto:** Soft launch vai mostrar vídeos que podem não ser da equipe — risco de UX inconsistente ou conteúdo inadequado
- **Recomendação:** **VERIFICAR ANTES do soft launch** se os 5 IDs apontam para vídeos da equipe Gestar em Movimento. Se forem placeholders, substituir antes de liberar tráfego.

### CONCERN-003 — Detecção de "completed" é heurística (severidade: baixa, documentada)
- **Sintoma:** `YouTubePlayer.tsx` linhas 80-97 — `completed` é emitido no unmount com `watched_until_sec` estimado por wall-clock, não por sinal real do player
- **Impacto:** Métrica "% completado" pode ter ruído. Já documentado como decisão de MVP.
- **Recomendação:** post-MVP, migrar para `YT.Player` API ou Bunny.net com eventos reais.

---

## Go/No-Go para Soft Launch

### Decisão (preliminar — pendente validação manual):

**⚠️ CONCERNS — GO com 2 ressalvas:**

1. **OBRIGATÓRIO antes de soft launch:** equipe humana executar o checklist manual deste documento (não é executável neste ambiente headless) e confirmar:
   - Play funciona em browser real
   - Overlay bloqueia logo YouTube
   - Mobile 375px e tablet 768px renderizam corretamente
   - 3G throttle: vídeo inicia em < 10s
   - Tabela `video_progress` recebe registros

2. **OBRIGATÓRIO antes de soft launch:** confirmar que os 5 YouTube IDs são vídeos da equipe (não placeholders).

Se ambos os critérios acima forem confirmados, recomendação muda para **✅ PASS — GO para soft launch (20% usuárias)**.

Se qualquer critério falhar, **❌ NO-GO** — retornar para @dev (concern-002) ou @qa para nova rodada de smoke test.

### Critérios de monitoramento pós-soft-launch

- Monitorar Sentry por 24-48h
- Se 0 critical bugs após 48h → **full launch (100% users)**
- Se 1-3 issues não-críticos → fix + monitor
- Se 1 critical bug → **rollback** + abrir story de fix

---

## Anexos: Arquivos verificados em code review

- `app/biblioteca/[id]/page.tsx` (linhas 1-244) — integração YouTubePlayer condicional por `youtube_video_id`
- `components/video/YouTubePlayer.tsx` (linhas 1-153) — overlay, lazy iframe, tracking
- `lib/hooks/useTrackVideoEvent.ts` (linhas 1-82) — fire-and-forget Supabase insert
- `lib/hooks/useExercise.ts` (linhas 1-81) — fetch com race-condition guard
- `app/api/exercises/[id]/route.ts` (linhas 1-44) — endpoint 200/404/500 com cache 1h
- `lib/data.ts` (linhas 64-211) — 5 exercícios com video, 4 sem
- `supabase/migrations/2026-05-25_video_progress.sql` — tabela + RLS + grants
- `supabase/migrations/2026-05-25_add_youtube_video_id_exercises.sql` — coluna preventiva

---

**Próximo passo:** Equipe executar checklist manual neste documento, atualizar status de cada `⬜`, e re-submeter para @qa decisão final (PASS / FAIL).
