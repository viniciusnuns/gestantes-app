import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle, Star, Play } from 'lucide-react'
import PartoFAQ from '@/components/landing/PartoFAQ'
import PartoPixelTracker from '@/components/landing/PartoPixelTracker'

export default function PartoLandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF4F8' }}>
      <PartoPixelTracker />

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(253,244,248,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <Link
            href="/parto/checkout"
            className="text-sm font-bold text-white px-4 py-2 rounded-full"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
          >
            Quero me preparar agora →
          </Link>
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
                Chegue ao trabalho de parto preparada,<br />
                <span style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  confiante e sem surpresas.
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-4 md:mb-8" style={{ color: '#8B7B8B' }}>
                Aulas completas com a Dra. Fabiana Pinheiro — fisioterapeuta pélvica — cobrindo as fases do trabalho de parto, posições, respiração, parto normal, cesárea e orientações essenciais para o pós-parto.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 md:mb-8">
                {[
                  'Baseado em evidências clínicas',
                  'Parto normal e cesárea',
                  'Técnicas de respiração e posições',
                  'Inclui orientações pós-parto',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} style={{ color: '#7B5A94', flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/parto/checkout"
                className="inline-block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Quero me preparar agora
              </Link>
              <p className="text-xs mt-3" style={{ color: '#A89BA9' }}>
                🔒 Pagamento seguro · Acesso imediato
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
                    alt="Dra. Fabiana Pinheiro — Fisioterapeuta especializada em parto"
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
                    <span className="text-lg">🤱</span>
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#3E2828' }}>Aulas completas de parto</p>
                    <p className="text-xs" style={{ color: '#8B7B8B' }}>Fases do parto e orientações pós-parto</p>
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
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#B07070' }}>Quem já fez as aulas</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#3E2828' }}>
              O que elas estão dizendo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                text: 'Cecília nasceu de parto normal. Consegui fazer as respirações no expulsivo bem como treinamos. Não tive laceração — foi tudo perfeito.',
                name: 'Paciente anônima',
                detail: 'Mensagem enviada à Dra. Fabiana',
                initial: 'P',
              },
              {
                text: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores nas costas. Recomendo!',
                name: 'Letícia H.',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                initial: 'L',
              },
              {
                text: 'Adorei o acompanhamento da Fabiana Pinheiro. Super atenciosa, dedicada e muito profissional! Acompanhou toda a minha gestação com muito cuidado. Recomendo de olhos fechados!',
                name: 'Janine Turco',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                photo: '/testimonials/janine.webp',
                photoPosition: 'center 83%',
                initial: 'J',
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
                  {t.photo ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={t.photo}
                        alt={t.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: t.photoPosition }}
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                      {t.initial}
                    </div>
                  )}
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
            Você já se perguntou isso?
          </h2>
          <p className="text-lg" style={{ color: '#B07070' }}>Ou você já se pegou pensando...</p>
        </div>

        <div className="space-y-4">
          {[
            { quote: '"Posso me mover durante o trabalho de parto? Fico com medo de fazer algo errado e prejudicar meu bebê."' },
            { quote: '"Ninguém me contou o que acontece de verdade no trabalho de parto. Tenho medo do que não sei."' },
            { quote: '"E se eu precisar de cesárea? Não sei como funciona — e isso me assusta mais do que o parto normal."' },
            { quote: '"Quero estar preparada, mas não sei por onde começar. Sinto que o tempo está passando rápido."' },
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
            A culpa não é sua.
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#8B7B8B' }}>
            Ninguém te ensina o que esperar no trabalho de parto. O que você chama de medo, na maioria das vezes, é só falta de informação segura e confiável.
          </p>
          <p className="text-lg leading-relaxed mb-10" style={{ color: '#8B7B8B' }}>
            Quando você entende cada fase do trabalho de parto e sabe como agir, o medo dá lugar à confiança. É exatamente para isso que as <strong style={{ color: '#7B5A94' }}>Aulas de Parto</strong> foram criadas.
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
          Começa em menos de 1 minuto
        </h2>
        <p className="mb-16" style={{ color: '#8B7B8B' }}>Três passos para começar a cuidar de você</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido, acesso imediato a todo o conteúdo.', color: '#D4A5A5' },
            { n: '2', title: 'Assista as aulas', desc: 'Acesso imediato. Assista no celular, tablet ou computador — onde e quando quiser, no seu próprio ritmo.', color: '#C4A8D9' },
            { n: '3', title: 'Chegue preparada', desc: 'No dia do parto, você sabe o que esperar, o que fazer e como agir. Sem surpresas. No controle.', color: '#F5C89A' },
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

      {/* DOBRA 06 — O QUE VOCÊ VAI APRENDER */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>O que você recebe</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
              Aulas completas para cada fase do parto.
            </h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: '#8B7B8B' }}>
              Não é um resumo superficial. São aulas completas que cobrem do início ao fim — para você não ter dúvida nenhuma no grande dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { num: '01', title: 'Fase latente do Trabalho de Parto', desc: 'Reconheça o início do trabalho de parto e saiba exatamente como agir.', highlight: true },
              { num: '02', title: 'Fase ativa do Trabalho de Parto', desc: 'Entenda a progressão e como lidar com as contrações mais intensas.', highlight: true },
              { num: '03', title: 'Fase de transição', desc: 'A etapa mais intensa antes do expulsivo — sem surpresas, você chega preparada.', highlight: false },
              { num: '04', title: 'Período expulsivo', desc: 'O momento do nascimento: o que esperar, como respirar e como agir.', highlight: false },
              { num: '05', title: 'Posições para o expulsivo', desc: 'Conheça as opções e escolha a posição que mais facilita o seu parto.', highlight: false },
              { num: '06', title: 'Exercícios para o Trabalho de Parto', desc: 'Movimentos que aliviam a dor e ajudam na progressão durante o trabalho de parto.', highlight: false },
              { num: '07', title: 'Trabalho de Parto Cesárea', desc: 'Entenda o procedimento, o que esperar e como se preparar para a cesárea.', highlight: false },
              { num: '08', title: 'Formas de indução do parto', desc: 'Os métodos disponíveis, quando cada um é indicado e como acontece.', highlight: false },
              { num: '09', title: 'O papel do acompanhante', desc: 'Como o acompanhante pode apoiar ativamente em cada fase do parto.', highlight: true },
              { num: '10', title: 'Orientações pós-parto', desc: 'Cuidados essenciais com o corpo e o bebê nas primeiras semanas após o nascimento.', highlight: false },
            ].map((aula) => (
              <div key={aula.num}
                className="flex gap-4 p-5 rounded-2xl border"
                style={{
                  background: aula.highlight ? 'white' : 'rgba(255,255,255,0.6)',
                  borderColor: aula.highlight ? '#C4A8D9' : '#E8D5CF',
                  boxShadow: aula.highlight ? '0 4px 24px rgba(196,168,217,0.15)' : 'none',
                }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}>
                  {aula.num}
                </div>
                <div>
                  <p className="font-bold text-sm mb-1" style={{ color: '#3E2828' }}>{aula.title}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{aula.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOBRA 07 — PARA QUEM SERVE / NÃO SERVE */}
      <section className="py-14 md:py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Para quem é</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            Essas aulas são para você?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl p-7 border" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="font-bold text-base mb-5" style={{ color: '#7B5A94' }}>✅ É para você se...</p>
            <div className="space-y-3">
              {[
                'Quer entender cada fase do trabalho de parto — sem medo e sem surpresas',
                'Está com medo do parto e quer chegar confiante e preparada',
                'Quer aprender técnicas de respiração e posições que realmente ajudam',
                'Está indo para parto normal mas também quer entender a cesárea',
                'Quer preparar o acompanhante para apoiar no momento certo',
                'Busca informação de qualidade com uma profissional especializada',
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
                'Já fez um curso completo de parto e se sente 100% preparada',
                'Espera que o conteúdo substitua o acompanhamento do seu obstetra',
                'Não está disposta a assistir as aulas e colocar em prática',
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
              { item: '10 aulas completas de preparação para o parto', value: 'R$ 97' },
              { item: 'Exercícios para o Trabalho de Parto', value: 'R$ 57' },
              { item: 'Posições para o período expulsivo', value: 'R$ 47' },
              { item: 'Preparação para parto normal e cesárea', value: 'R$ 47' },
              { item: 'Orientações essenciais de pós-parto', value: 'R$ 37' },
              { item: 'Programa de conquistas e ranking semanal', value: 'R$ 47' },
              { item: 'Comunidade de mamães e suporte', value: 'R$ 47' },
              { item: 'Acesso imediato e revisão ilimitada', value: 'sem preço' },
            ].map((row) => (
              <div key={row.item} className="flex items-center justify-between px-5 py-3.5 rounded-xl border"
                style={{ background: 'white', borderColor: '#E8D5CF' }}>
                <span className="text-sm text-left" style={{ color: '#5C4C5C' }}>{row.item}</span>
                <span className="text-sm font-semibold line-through ml-4 flex-shrink-0" style={{ color: '#A89BA9' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 border-2" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="text-sm mb-3" style={{ color: '#8B7B8B' }}>Se vendido separado: <span className="line-through">R$ 322+</span></p>
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
          <p className="mb-10" style={{ color: '#8B7B8B' }}>Acesso imediato. Revise as aulas quantas vezes quiser.</p>

          <div className="relative rounded-3xl p-8 shadow-xl border-2 bg-white" style={{ borderColor: '#C4A8D9' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: '#9B6FB0' }}>12 parcelas de</p>
            <div className="mb-1">
              <span className="text-6xl font-bold" style={{ color: '#3E2828' }}>R$&nbsp;6,70</span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#A89BA9' }}>ou <strong style={{ color: '#3E2828' }}>R$ 67</strong> à vista no PIX</p>
            <p className="text-xs mb-8" style={{ color: '#A89BA9' }}>7 dias de garantia ou seu dinheiro de volta</p>

            <div className="space-y-3 mb-8 text-left">
              {[
                'Aulas completas de preparação para o parto',
                'Trabalho de parto normal e cesárea',
                'Técnicas de respiração e manejo da dor',
                'Posições para o período expulsivo',
                'Como preparar seu acompanhante',
                'Orientações essenciais de pós-parto',
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
              href="/parto/checkout"
              className="block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
              style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
            >
              Quero me preparar agora
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
            E se você não se preparar?
          </h2>

          <div className="space-y-4 mb-12 text-left">
            {[
              'Chegar ao trabalho de parto sem saber o que esperar — sem técnicas de respiração, sem posições, sem referência',
              'Sentir que perdeu o controle na hora mais importante — exatamente quando mais precisaria de segurança',
              'Seu acompanhante sem saber o que fazer — porque ninguém explicou o papel dele antes do grande dia',
              'A fase que poderia ser transformadora virar uma memória de medo e confusão',
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
              Aulas completas. Acesso imediato. Chegue ao parto preparada, confiante e no controle.
            </p>
          </div>

          <Link
            href="/parto/checkout"
            className="inline-block font-bold text-base px-10 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)', color: 'white' }}
          >
            Quero me preparar agora →
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
                Criou as Aulas de Parto para que você chegue ao trabalho de parto com a mesma qualidade de informação que as pacientes do consultório dela têm — com <strong style={{ color: '#9B5C5C' }}>segurança, clareza e confiança</strong>.
              </p>
              <div className="space-y-3">
                {[
                  'Conteúdo validado clinicamente',
                  'Cobre parto normal e cesárea',
                  'Linguagem clara, sem jargão médico',
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
            O parto mais preparado<br />começa agora.
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-xl mx-auto">
            Acesso imediato. Revise as aulas quando quiser — inclusive na véspera do parto.
          </p>
          <p className="text-white/70 text-base mb-2">12x de R$ 6,70 · ou R$ 67 à vista no PIX</p>
          <Link
            href="/parto/checkout"
            className="inline-block font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl mt-4"
            style={{ background: 'white', color: '#9B5C5C' }}
          >
            Quero me preparar agora →
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
          <PartoFAQ />
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
            <Link href="/parto/checkout" className="hover:text-primary-600 transition-colors">Comprar aulas</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
