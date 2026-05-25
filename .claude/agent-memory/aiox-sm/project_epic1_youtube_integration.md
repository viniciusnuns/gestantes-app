---
name: project-epic1-youtube-integration
description: Epic 1 Gestar em Movimento — integração YouTube unlisted para Biblioteca; 5 stories criadas em 2026-05-25; decisão MVP-first pelo PO
metadata:
  type: project
---

Gestar em Movimento adicionará reprodução de vídeo na Biblioteca via YouTube unlisted como MVP de validação. Stories criadas em 2026-05-25.

**Decisão do produto:** YouTube unlisted (barato, sem infra) para validar se gestantes assistem vídeos. Migração para Bunny.net/Mux após validação.

**Por quê:** Aria (@architect) recomendou Mux + HLS nativo em 2026-05-25, mas o PO decidiu pelo MVP mais barato. A recomendação de Mux está em [[project-video-integration-decision]] (memória do @architect).

**Como aplicar:** Se o PO pedir novas stories de vídeo, seguir o padrão YouTube unlisted até decisão explícita de migrar para Mux/Bunny.

**Stories do Epic 1:**
- `1.1.youtube-schema.story.md` — coluna `youtube_video_id` em `lib/data.ts` + migration SQL
- `1.2.api-exercises-youtube.story.md` — endpoint `GET /api/exercises/[id]` + hook `useExercise`
- `1.3.youtube-player-component.story.md` — `components/video/YouTubePlayer.tsx` + integração na página `/biblioteca/[id]`
- `1.4.video-tracking-basico.story.md` — tabela `video_progress` + fire-and-forget tracking de play/completed
- `1.5.testes-deploy-youtube.story.md` — smoke test documentado + checklist pós-deploy para @devops

**Localização das stories:** `docs/stories/` (criado em 2026-05-25)

**Why:** Performance é crítica para gestantes em mobile (rede 3G). Player lazy-load (iframe só no Play), thumbnails do YouTube API, sem carregamento no page load.
