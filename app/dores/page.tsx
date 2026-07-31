import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle, Star, Play } from 'lucide-react'
import DoresPixelTracker from '@/components/landing/DoresPixelTracker'
import DoresFAQ from '@/components/landing/DoresFAQ'

export default function DoresLandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF4F8' }}>
      <DoresPixelTracker />

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(253,244,248,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
        </div>
      </nav>

      {/* DOBRA 01 — PROMESSA PRINCIPAL */}
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #E8C5D8 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-25 translate-x-1/3 -translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #C4A8D9 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 -translate-x-1/2 translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #F5C89A 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">

            {/* Esquerda — Copy */}
            <div className="order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 md:mb-8 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#D4A5A5', color: '#9B5C5C' }}>
                <Play size={13} className="fill-current" />
                Criado por Fisioterapeuta Pélvica
              </div>

              <h1 className="text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-tight mb-4 md:mb-6" style={{ color: '#3E2828' }}>
                Chega de sofrer com dores durante a gestação.<br />
                <span style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Seu alívio está aqui.
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-4 md:mb-8" style={{ color: '#8B7B8B' }}>
                Sequências de exercícios desenvolvidas pela Dra. Fabiana Pinheiro — fisioterapeuta pélvica — para aliviar as dores mais comuns da gestação: lombar, pelve, pescoço e baixo ventre.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 md:mb-8">
                {[
                  'Baseado em evidências clínicas',
                  'Exercícios seguros por trimestre',
                  'Resultados a partir da primeira sessão',
                  'Sem equipamentos especiais',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} style={{ color: '#7B5A94', flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/dores/checkout"
                className="inline-block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Quero aliviar minhas dores agora
              </Link>
              <p className="text-xs mt-3" style={{ color: '#A89BA9' }}>
                🔒 Pagamento seguro · Acesso imediato · R$67 à vista
              </p>
            </div>

            {/* Direita — Imagem */}
            <div className="order-2 flex justify-center">
              <div className="relative w-full max-w-sm flex flex-col gap-3">
                <div className="absolute inset-0 rounded-3xl rotate-3 scale-95 opacity-50"
                  style={{ background: 'linear-gradient(135deg, #E8C5D8, #C4A8D9)' }} />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
                  <Image
                    src="/dra-fabiana.webp"
                    alt="Dra. Fabiana Pinheiro — Fisioterapeuta especializada em gestação"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center top' }}
                    sizes="(max-width: 768px) calc(100vw - 40px), 480px"
                    priority
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(61,40,40,0.55) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-sm font-semibold opacity-80">Dra. Fabiana Pinheiro</p>
                    <p className="font-black text-lg">Fisioterapeuta Pélvica</p>
                  </div>
                </div>
                <div className="relative rounded-2xl p-4 flex items-center gap-3 shadow-lg mx-2"
                  style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    <span className="text-lg">💜</span>
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#3E2828' }}>Alívio de dores na gestação</p>
                    <p className="text-xs" style={{ color: '#8B7B8B' }}>6 sequências para as dores mais comuns</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOBRA 02 — PROVA SOCIAL */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-6 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#B07070' }}>Quem já fez os exercícios</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#3E2828' }}>
              O que elas estão dizendo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                text: 'Adorei o acompanhamento da Fabiana Pinheiro. Super atenciosa, dedicada e muito profissional! Acompanhou toda a minha gestação com muito cuidado. Recomendo de olhos fechados!',
                name: 'Janine Turco',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                initial: 'J',
              },
              {
                text: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores nas costas. Recomendo!',
                name: 'Letícia H.',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                initial: 'L',
              },
              {
                text: 'Excelente profissional! Me ajudou muito na fase final da gestação com dores e desconfortos. As orientações foram essenciais para eu me sentir mais confortável.',
                name: 'Mariana S.',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                initial: 'M',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border"
                style={{ background: 'white', borderColor: '#E8D5CF' }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: '#F5C89A', fill: '#F5C89A' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#5C4C5C' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#3E2828' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#A89BA9' }}>{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOBRA 03 — VOZES NA CABEÇA */}
      <section className="py-14 md:py-20 max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3E2828' }}>
            Você já se pegou pensando...
          </h2>
          <p className="text-lg" style={{ color: '#B07070' }}>Isso é mais comum do que você imagina</p>
        </div>

        <div className="space-y-4">
          {[
            { quote: '"Acordo com dor nas costas todo dia — e fico com medo de que só vai piorar com o crescimento da barriga."' },
            { quote: '"Sinto uma pressão enorme na pelve. Não sei se é normal ou se preciso me preocupar."' },
            { quote: '"Tentei exercícios que achei na internet, mas não sei se são seguros para gestantes. Fico com medo de fazer algo errado."' },
            { quote: '"As dores estão me impedindo de dormir, trabalhar e curtir a gestação. Eu mereço me sentir melhor do que isso."' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl px-6 py-5 border"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#E8D5CF' }}>
              <p className="text-base leading-relaxed font-medium" style={{ color: '#5C3A6B' }}>
                {item.quote}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DOBRA 04 — TRANSIÇÃO DOR → SOLUÇÃO */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 100%)' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#3E2828' }}>
            Não é frescura. É o seu corpo pedindo ajuda.
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#8B7B8B' }}>
            As dores da gestação são reais — e são causadas por mudanças profundas no seu corpo: o peso da barriga, a frouxidão ligamentar, a postura alterada. Nenhuma dessas dores é culpa sua.
          </p>
          <p className="text-lg leading-relaxed mb-10" style={{ color: '#8B7B8B' }}>
            Quando você trabalha as estruturas certas com exercícios adequados para gestantes, o alívio vem. É exatamente para isso que as <strong style={{ color: '#7B5A94' }}>Sequências para Alívio de Dores</strong> foram criadas.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border"
            style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
              <Shield size={18} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-left" style={{ color: '#3E2828' }}>
              Conteúdo criado e validado clinicamente por fisioterapeuta pélvica especializada em gestação
            </p>
          </div>
        </div>
      </section>

      {/* DOBRA 05 — PASSO A PASSO */}
      <section className="py-14 md:py-20 max-w-5xl mx-auto px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
          Comece em menos de 1 minuto
        </h2>
        <p className="mb-16" style={{ color: '#8B7B8B' }}>Três passos para começar a se sentir melhor</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido, acesso imediato a todas as sequências.', color: '#D4A5A5' },
            { n: '2', title: 'Escolha sua sequência', desc: 'Identifique onde está a dor e acesse a sequência certa — lombar, pelve, pescoço ou baixo ventre.', color: '#C4A8D9' },
            { n: '3', title: 'Sinta o alívio', desc: 'Exercícios guiados pela Dra. Fabiana, seguros e eficazes. A maioria das gestantes sente alívio já na primeira sessão.', color: '#F5C89A' },
          ].map((step) => (
            <div key={step.n} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}>
                {step.n}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#3E2828' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOBRA 06 — O QUE VOCÊ RECEBE */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>O que você recebe</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
              6 sequências para as dores mais comuns da gestação.
            </h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: '#8B7B8B' }}>
              Cada sequência foi desenvolvida para um tipo específico de dor — para você não precisar adivinhar o que fazer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { num: '01', title: 'Dor lombar', desc: 'Sequência completa para aliviar a dor lombar — exercícios deitada e em pé, para usar em qualquer fase da gestação.', highlight: true },
              { num: '02', title: 'Pelve anterior — sínfise púbica', desc: 'Movimentos suaves para aliviar a dor na sínfise, muito comum no 2º e 3º trimestre.', highlight: true },
              { num: '03', title: 'Pelve posterior e sacro', desc: 'Exercícios direcionados para dor na região sacra e glútea — aquela dor profunda que incomoda ao sentar e caminhar.', highlight: false },
              { num: '04', title: 'Pescoço e ombros', desc: 'Alívio das tensões no pescoço e ombros que aumentam com o peso da barriga e a mudança de postura.', highlight: false },
              { num: '05', title: 'Baixo ventre', desc: 'Sequência para a sensação de peso e dor no baixo ventre — mais frequente no 2º e 3º trimestre.', highlight: false },
              { num: '06', title: 'Dor lombar em pé', desc: 'Exercícios em pé para aliviar a lombar sem precisar deitar no chão — ideal para o dia a dia.', highlight: true },
            ].map((seq) => (
              <div key={seq.num}
                className="flex gap-4 p-5 rounded-2xl border"
                style={{
                  background: seq.highlight ? 'white' : 'rgba(255,255,255,0.6)',
                  borderColor: seq.highlight ? '#C4A8D9' : '#E8D5CF',
                  boxShadow: seq.highlight ? '0 4px 24px rgba(196,168,217,0.15)' : 'none',
                }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}>
                  {seq.num}
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: '#3E2828' }}>{seq.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{seq.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bônus */}
          <div className="mt-6 rounded-2xl p-5 border-2 shadow-sm flex items-start gap-4"
            style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-bold text-sm mb-1" style={{ color: '#7B5A94' }}>Bônus incluso: vídeos de boas-vindas</p>
              <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>
                Dois vídeos introdutórios com a Dra. Fabiana para você começar com o pé direito — apresentação do programa e orientações gerais de segurança para gestantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 07 — PARA QUEM É / NÃO É */}
      <section className="py-14 md:py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Para quem é</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            Esse programa é para você?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl p-7 border" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="font-bold text-base mb-5" style={{ color: '#7B5A94' }}>✅ É para você se...</p>
            <div className="space-y-3">
              {[
                'Sente dores nas costas, pelve, pescoço ou baixo ventre durante a gestação',
                'Quer exercícios seguros e criados especificamente para gestantes',
                'Já tentou se virar sozinha, mas não sabe o que realmente é seguro fazer',
                'Quer alívio rápido, sem precisar sair de casa',
                'Busca informação de qualidade com uma profissional especializada',
                'Quer voltar a dormir bem, trabalhar e curtir a gestação sem dor',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#7B5A94' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#5C4C5C' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-7 border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#E8D5CF' }}>
            <p className="font-bold text-base mb-5" style={{ color: '#9B5C5C' }}>❌ Não é para você se...</p>
            <div className="space-y-3">
              {[
                'Você sente dores agudas ou intensas que necessitam de avaliação presencial',
                'Espera que o conteúdo substitua o acompanhamento do seu médico ou fisioterapeuta',
                'Não está disposta a fazer os exercícios e colocar em prática',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: '#B07070' }}>✗</span>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 08 — ANCORAGEM DE VALOR */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 100%)' }}>
        <div className="max-w-2xl mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Antes de ver o preço</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            Veja o que você está recebendo
          </h2>
          <p className="text-lg mb-12" style={{ color: '#8B7B8B' }}>
            Cada parte do conteúdo, se vendida separada, custaria assim:
          </p>

          <div className="space-y-3 mb-8">
            {[
              { item: '6 sequências completas para alívio de dores', value: 'R$ 47 cada' },
              { item: 'Exercícios seguros organizados por trimestre', value: 'R$ 67' },
              { item: 'Vídeos de boas-vindas e orientações gerais', value: 'R$ 37' },
              { item: 'Programa de conquistas e ranking semanal', value: 'R$ 47' },
              { item: 'Acesso imediato pelo celular, tablet ou computador', value: 'sem preço' },
              { item: 'Revisão ilimitada — acesse quando precisar', value: 'sem preço' },
            ].map((row) => (
              <div key={row.item} className="flex items-center justify-between px-5 py-3.5 rounded-xl border"
                style={{ background: 'white', borderColor: '#E8D5CF' }}>
                <span className="text-sm text-left" style={{ color: '#5C4C5C' }}>{row.item}</span>
                <span className="text-sm font-semibold line-through ml-4 flex-shrink-0" style={{ color: '#A89BA9' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 border-2" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="text-sm mb-3" style={{ color: '#8B7B8B' }}>Se vendido separado: <span className="line-through">R$ 380+</span></p>
            <p className="text-sm font-semibold mb-1" style={{ color: '#9B6FB0' }}>Seu investimento</p>
            <p className="text-4xl font-bold mb-1" style={{ color: '#3E2828' }}>12x de R$ 6,70</p>
            <p className="text-sm" style={{ color: '#A89BA9' }}>ou <strong style={{ color: '#5C4C5C' }}>R$ 67</strong> à vista no PIX</p>
          </div>
        </div>
      </section>

      {/* DOBRA 09 — PREÇO + BOTÃO */}
      <section className="py-14 md:py-20" style={{ background: '#FDF4F8' }}>
        <div className="max-w-md mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3E2828' }}>Acesso completo, pagamento único</h2>
          <p className="mb-10" style={{ color: '#8B7B8B' }}>Acesso imediato. Revise as sequências quantas vezes precisar.</p>

          <div className="relative rounded-3xl p-8 shadow-xl border-2 bg-white" style={{ borderColor: '#C4A8D9' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#9B6FB0' }}>12 parcelas de</p>
            <div className="mb-1">
              <span className="text-6xl font-bold" style={{ color: '#3E2828' }}>R$&nbsp;6,70</span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#A89BA9' }}>ou <strong style={{ color: '#3E2828' }}>R$ 67</strong> à vista no PIX</p>
            <p className="text-xs mb-8" style={{ color: '#A89BA9' }}>7 dias de garantia</p>

            <div className="space-y-3 mb-8 text-left">
              {[
                '6 sequências completas para alívio de dores',
                'Dor lombar, pelve, pescoço e baixo ventre',
                'Exercícios seguros por trimestre',
                'Vídeos de boas-vindas incluídos',
                'Programa de conquistas e ranking semanal',
                'Acesso pelo celular, tablet ou computador',
                'Acesso imediato e revisão ilimitada',
              ].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/dores/checkout"
              className="block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
              style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
            >
              Quero aliviar minhas dores agora
            </Link>
            <p className="text-xs mt-4" style={{ color: '#A89BA9' }}>
              🔒 Pagamento seguro · Acesso imediato
            </p>
          </div>
        </div>
      </section>

      {/* DOBRA 10 — CUSTO DE FICAR PARADO */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #3E2828 0%, #5C3A6B 100%)' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4A5A5' }}>Pense bem</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
            Seja honesta com você mesma:
          </h2>

          <div className="space-y-4 mb-12 text-left">
            {[
              'Você já adiou buscar alívio achando que as dores iam passar sozinhas — mas elas só pioraram',
              'Você está dormindo mal por causa das dores, e isso está afetando o seu dia inteiro',
              'Você tentou exercícios que achou na internet, sem saber se eram seguros para a gestação',
              'Você sente que merece uma gestação mais confortável — e sabe que é possível',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="text-lg flex-shrink-0">😔</span>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-lg font-semibold text-white mb-2">Ou você pode fazer diferente.</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Sequências prontas. Acesso imediato. Criadas por quem cuida de gestantes todos os dias.
            </p>
          </div>

          <Link
            href="/dores/checkout"
            className="inline-block font-bold text-base px-10 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)', color: 'white' }}
          >
            Quero aliviar minhas dores agora →
          </Link>
        </div>
      </section>

      {/* DOBRA 11 — AUTORIDADE (Dra. Fabiana) */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[2.5rem] rotate-2"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', opacity: 0.4 }} />
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl"
                  style={{ width: 320, height: 420 }}>
                  <Image
                    src="/dra-fabiana.webp"
                    alt="Dra. Fabiana Pinheiro — Fisioterapeuta Pélvica"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center top' }}
                    sizes="320px"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
                  style={{ background: 'white', minWidth: 180 }}>
                  <p className="font-bold text-sm" style={{ color: '#3E2828' }}>Dra. Fabiana Pinheiro da Silva</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9B6FB0' }}>Fisioterapeuta · CREFITO 211253-F</p>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#C4A8D9', color: '#7B5A94' }}>
                <Shield size={13} />
                Especialista em saúde pélvica e gestacional
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
                Criado por quem cuida de gestantes todos os dias
              </h2>
              <p className="text-lg leading-relaxed mb-4" style={{ color: '#8B7B8B' }}>
                Mestre em Fisioterapia pela UDESC e especialista em Fisioterapia Pélvica, Fabiana atua há mais de 10 anos acompanhando gestantes, puérperas e mulheres em diferentes fases da vida.
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#8B7B8B' }}>
                Criou as Sequências para Alívio de Dores para que você tenha a mesma qualidade de orientação das pacientes do consultório dela — com <strong style={{ color: '#9B5C5C' }}>segurança, clareza e resultado</strong>.
              </p>
              <div className="space-y-3">
                {[
                  'Conteúdo validado clinicamente',
                  'Exercícios seguros por trimestre',
                  'Linguagem clara, direto ao ponto',
                  'Baseado em evidências científicas',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <span className="font-medium" style={{ color: '#5C4C5C' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOBRA 12 — REPETIR PREÇO + BOTÃO FINAL */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 60%, #B08BC4 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white leading-tight">
            A gestação mais confortável<br />começa agora.
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-xl mx-auto">
            Acesso imediato. Revise as sequências quando precisar — inclusive às 3 da manhã, quando a dor apertar.
          </p>
          <p className="text-white/70 text-base mb-2">12x de R$ 6,70 · ou R$ 67 à vista no PIX</p>
          <Link
            href="/dores/checkout"
            className="inline-block font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl mt-4"
            style={{ background: 'white', color: '#9B5C5C' }}
          >
            Quero aliviar minhas dores agora →
          </Link>
          <p className="text-sm text-white/60 mt-4">
            🔒 Garantia de 7 dias · Acesso imediato
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>Perguntas frequentes</h2>
          </div>
          <DoresFAQ />
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-12 max-w-2xl mx-auto px-5 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Shield size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-black" style={{ color: '#3E2828' }}>Garantia de 7 dias</h3>
          <p className="text-gray-600">
            Se por qualquer motivo não ficar satisfeita, devolvemos 100% do valor. Sem burocracia, sem perguntas.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/40" style={{ background: '#FDF4F8' }}>
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#A89BA9' }}>
          <span className="font-semibold" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">Termos de uso</Link>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacidade</Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors">Entrar</Link>
            <Link href="/dores/checkout" className="hover:text-primary-600 transition-colors">Comprar sequências</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
