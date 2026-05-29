---
name: project-gestar-em-movimento
description: Copy context for "Gestar em Movimento" — pregnancy-tracking app (femtech), audience, voice, and approved tone references for future copy work
metadata:
  type: project
---

App de acompanhamento gestacional "Gestar em Movimento" (Next.js, em produção, MVP). Público: gestantes brasileiras, ~8–12 usuárias/dia.

**Why:** Produto femtech em estágio MVP — toda copy serve para reduzir ansiedade ("o que é seguro fazer na gravidez?") e transmitir validação médica/cuidado, não para venda agressiva.

**How to apply:**
- Tom-alvo: caloroso, acolhedor, íntimo-profissional, validador. Evitar corporativo/médico-distante/assustador.
- Sempre 2ª pessoa ("você"/"seu"/"sua gestação"/"juntas"). O app inteiro fala assim.
- Sem jargão médico, sem rima, sem infantil (paleta rose/roxo é adulta/calma).
- Diagnóstico de copy (Schwartz): audiência é Problem-Aware, sofisticação de mercado BAIXA (estágio 1) — usuária já está logada e confia; trabalho é reassurance, NÃO persuasão pesada.
- Volume baixo (8–12/dia) = SEM poder estatístico para A/B. Recomendar copy de maior probabilidade base primeiro; só split-test após crescer tráfego.
- Estimativas de CTR são direcionais (padrões de copy), nunca prometer como medição real.

**Voz aprovada no código (fonte da verdade — usar como família de referência):**
- Home: "Olá, {name} 💗" / "Vamos acompanhar essa jornada juntas com exercícios personalizados e orientações especialistas."
- Biblioteca header: "Exercícios pensados para cada fase da sua gestação"
- Tela de detalhe do exercício: "Como praticar" (heading aprovado — usar como irmão de voz)
- Header semanal: "Você está na semana X" / "faltam X dias para o grande dia"
- Cards: "Meta semanal" / "Exercícios de hoje"

**Arquivos de copy relevantes:** app/page.tsx, app/biblioteca/page.tsx, app/biblioteca/[id]/page.tsx, app/calendario/[date]/page.tsx, REGRAS_APP.md
