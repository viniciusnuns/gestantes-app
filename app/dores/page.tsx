import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle, Star, Play } from 'lucide-react'
import DoresPixelTracker from '@/components/landing/DoresPixelTracker'

export default function DoresLandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#F3F0FF' }}>
      <DoresPixelTracker />

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(243,240,255,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
        </div>
      </nav>

      {/* DOBRA 01 — PROMESSA PRINCIPAL */}
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #C4A8D9 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-25 translate-x-1/3 -translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #E8C5D8 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">

            {/* Esquerda — Copy */}
            <div className="order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 md:mb-8 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#C4A8D9', color: '#7B5A94' }}>
                <Play size={13} className="fill-current" />
                Criado por Fisioterapeuta Pélvica
              </div>

              <h1 className="text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-tight mb-4 md:mb-6" style={{ color: '#2E1B4E' }}>
                Chega de sofrer com dores durante a gestação.<br />
                <span style={{ background: 'linear-gradient(135deg, #7B5A94, #C4A8D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Seu alívio está aqui.
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-4 md:mb-8" style={{ color: '#6B5B8B' }}>
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
                    <span className="text-sm font-medium" style={{ color: '#5C4C7C' }}>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/dores/checkout"
                className="inline-block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
                style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}
              >
                Quero aliviar minhas dores agora
              </Link>
              <p className="text-xs mt-3" style={{ color: '#A89BC9' }}>
                🔒 Pagamento seguro · Acesso imediato · R$67 à vista
              </p>
            </div>

            {/* Direita — Imagem */}
            <div className="order-2 flex justify-center">
              <div className="relative w-full max-w-sm flex flex-col gap-3">
                <div className="absolute inset-0 rounded-3xl rotate-3 scale-95 opacity-50"
                  style={{ background: 'linear-gradient(135deg, #C4A8D9, #E8C5D8)' }} />
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
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(46,27,78,0.55) 0%, transparent 55%)' }} />
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p className="text-sm font-semibold opacity-80">Dra. Fabiana Pinheiro</p>
                    <p className="font-black text-lg">Fisioterapeuta Pélvica</p>
                  </div>
                </div>
                <div className="relative rounded-2xl p-4 flex items-center gap-3 shadow-lg mx-2"
                  style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7B5A94, #C4A8D9)' }}>
                    <span className="text-lg">💜</span>
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#2E1B4E' }}>Alívio de dores na gestação</p>
                    <p className="text-xs" style={{ color: '#8B7B8B' }}>6 sequências para as dores mais comuns</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOBRA 02 — PROVA SOCIAL */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #EDE9FF 0%, #F5EBF7 50%, #F3F0FF 100%)' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-6 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#7B5A94' }}>Quem já fez as aulas</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#2E1B4E' }}>
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
              <div key={t.name} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #7B5A94, #C4A8D9)' }}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOBRA 03 — O QUE ESTÁ INCLUÍDO */}
      <section className="py-14 md:py-20" style={{ background: '#F3F0FF' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#7B5A94' }}>Conteúdo completo</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#2E1B4E' }}>
              6 sequências para as dores mais comuns
            </h2>
            <p className="text-sm mt-3" style={{ color: '#6B5B8B' }}>
              Cada sequência foi criada para um tipo específico de dor, com exercícios seguros e eficazes para gestantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { emoji: '🔵', title: 'Dor lombar', desc: 'Sequência completa para aliviar a dor lombar — exercícios deitada e em pé.' },
              { emoji: '🟣', title: 'Pelve anterior (sínfise púbica)', desc: 'Movimentos suaves para aliviar a dor na sínfise — muito comum no 2º e 3º trimestre.' },
              { emoji: '🟤', title: 'Pelve posterior e sacro', desc: 'Exercícios direcionados para dor na região sacra e glútea.' },
              { emoji: '🔴', title: 'Pescoço e ombros', desc: 'Alívio das tensões no pescoço e ombros que aumentam com o peso do bebê.' },
              { emoji: '🟡', title: 'Baixo ventre', desc: 'Sequência para sensação de peso e dor no baixo ventre no 2º e 3º trimestre.' },
              { emoji: '🟢', title: 'Dor lombar em pé', desc: 'Exercícios em pé para aliviar a lombar sem precisar deitar no chão.' },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-purple-100">
                <span className="text-2xl mt-0.5">{item.emoji}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bônus */}
          <div className="mt-6 bg-white rounded-2xl p-5 border-2 shadow-sm flex items-start gap-3" style={{ borderColor: '#C4A8D9' }}>
            <span className="text-2xl">🎁</span>
            <div>
              <p className="font-bold text-sm" style={{ color: '#7B5A94' }}>Incluso: vídeos de boas-vindas</p>
              <p className="text-xs text-gray-500 mt-1">Dois vídeos introdutórios com a Dra. Fabiana para começar com o pé direito — boas-vindas e apresentação do programa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 04 — PREÇO E CTA */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #EDE9FF 0%, #F5EBF7 100%)' }}>
        <div className="max-w-lg mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7B5A94' }}>Investimento</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#2E1B4E' }}>
            Acesso completo por apenas
          </h2>
          <div className="my-6">
            <p className="text-6xl font-black" style={{ color: '#7B5A94' }}>R$67</p>
            <p className="text-sm mt-1" style={{ color: '#6B5B8B' }}>ou 12x de R$6,70 · Acesso imediato</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100 text-left mb-6 space-y-2">
            {[
              '6 sequências para as dores mais comuns da gestação',
              'Vídeos de boas-vindas incluídos',
              'Exercícios seguros para cada trimestre',
              'Acesso pelo celular, tablet ou computador',
              'Desenvolvido por fisioterapeuta pélvica',
              'Garantia de 7 dias ou seu dinheiro de volta',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2.5">
                <CheckCircle size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600">{f}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dores/checkout"
            className="inline-block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
            style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}
          >
            Quero aliviar minhas dores agora
          </Link>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Shield size={14} style={{ color: '#7B5A94' }} />
            <p className="text-xs" style={{ color: '#6B5B8B' }}>Garantia de 7 dias — se não funcionar, devolvemos 100%</p>
          </div>
        </div>
      </section>

      {/* DOBRA 05 — FAQ */}
      <section className="py-14 md:py-20" style={{ background: '#F3F0FF' }}>
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#2E1B4E' }}>Dúvidas frequentes</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'Precisa de algum equipamento?',
                a: 'Não. A maioria dos exercícios pode ser feita sem equipamentos. Em alguns você pode usar um colchonete ou travesseiro para conforto.',
              },
              {
                q: 'É seguro em qualquer trimestre?',
                a: 'Sim, os exercícios foram desenvolvidos pela Dra. Fabiana Pinheiro especificamente para gestantes, com indicação de trimestre em cada sequência.',
              },
              {
                q: 'Como acesso após a compra?',
                a: 'Após o pagamento você recebe os dados de acesso por e-mail. O acesso é pelo app Gestar em Movimento — disponível no celular, tablet e computador.',
              },
              {
                q: 'Posso fazer upgrade para o app completo depois?',
                a: 'Sim! Se quiser acesso a todo o programa — parto, meditação, respiração, mobilidade e mais de 60 aulas — você pode fazer o upgrade por R$147.',
              },
            ].map((item) => (
              <div key={item.q} className="bg-white rounded-2xl p-5 shadow-sm border border-purple-100">
                <p className="font-bold text-sm mb-2" style={{ color: '#2E1B4E' }}>{item.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-10" style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}>
        <div className="max-w-lg mx-auto px-5 text-center">
          <p className="text-white/80 text-sm mb-2">Pare de sofrer com dores durante a gravidez</p>
          <Link
            href="/dores/checkout"
            className="inline-block bg-white font-bold text-lg py-4 px-10 rounded-2xl shadow-md hover:opacity-90 transition-all"
            style={{ color: '#7B5A94' }}
          >
            Começar agora por R$67
          </Link>
        </div>
      </section>
    </div>
  )
}
