'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, Shield, Heart, Trophy, Users, CheckCircle, Star, Play, Sparkles } from 'lucide-react'

const faqs = [
  {
    q: 'É seguro fazer exercício durante a gestação?',
    a: 'Sim — desde que os exercícios sejam adequados para cada fase. Todos os vídeos do Gestar em Movimento foram criados e validados pela Dra. Fabiana Pinheiro, fisioterapeuta pélvica especializada em saúde da mulher, com foco em segurança para a mamãe e o bebê.',
  },
  {
    q: 'Precisa de equipamentos ou academia?',
    a: 'Não. A grande maioria dos exercícios utiliza apenas o peso do próprio corpo. Alguns vídeos usam bola de pilates ou faixa elástica, mas todos têm versão alternativa sem equipamento.',
  },
  {
    q: 'Serve para qual trimestre?',
    a: 'Para todos os três trimestres. O app identifica sua fase e entrega exercícios adequados para o momento certo da sua gestação — do primeiro ao terceiro trimestre, incluindo preparação completa para o parto.',
  },
  {
    q: 'Como funciona o período gratuito?',
    a: '7 dias com acesso completo a todo o conteúdo, sem precisar cadastrar cartão de crédito. Se gostar, assine por R$ 47/mês. Se não quiser continuar, não precisa fazer nada — o acesso encerra automaticamente.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Sem multa, sem burocracia. Cancele a qualquer momento diretamente pelo app ou pelo e-mail.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-sm">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/90 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-[#5C3A6B] pr-4">{item.q}</span>
            <ChevronDown
              size={20}
              className={`text-[#B07070] flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5 bg-white/90">
              <p className="text-[#8B7B8B] leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF4F8' }}>

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(253,244,248,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium" style={{ color: '#8B7B8B' }}>
              Entrar
            </Link>
            <Link
              href="/signup"
              className="text-sm font-bold px-5 py-2.5 rounded-xl text-white shadow-md transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #E8C5D8 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-25 translate-x-1/3 -translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #C4A8D9 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 -translate-x-1/2 translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #F5C89A 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Left — Copy */}
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#D4A5A5', color: '#9B5C5C' }}>
                <Shield size={13} />
                Criado por Fisioterapeuta Pélvica
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ color: '#3E2828' }}>
                Cuide de você.<br />
                <span style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Cuide do bebê.
                </span>
              </h1>

              <p className="text-lg leading-relaxed mb-8" style={{ color: '#8B7B8B' }}>
                Exercícios seguros e personalizados para cada fase da gestação —
                do primeiro trimestre até a preparação completa para o parto.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Link
                  href="/signup"
                  className="flex-1 sm:flex-none text-center font-bold text-lg px-8 py-4 rounded-2xl text-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
                >
                  Começar 7 dias grátis
                </Link>
                <Link
                  href="/login"
                  className="flex-1 sm:flex-none text-center font-semibold text-lg px-8 py-4 rounded-2xl border-2 transition-colors hover:bg-white"
                  style={{ borderColor: '#D4A5A5', color: '#9B5C5C', background: 'rgba(255,255,255,0.6)' }}
                >
                  Já tenho conta
                </Link>
              </div>

              <p className="text-sm" style={{ color: '#A89BA9' }}>
                Sem cartão de crédito · Cancele quando quiser
              </p>

              {/* Mini stats */}
              <div className="flex items-center gap-6 mt-10 pt-10 border-t" style={{ borderColor: '#E8D5CF' }}>
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#9B5C5C' }}>70+</p>
                  <p className="text-xs" style={{ color: '#A89BA9' }}>vídeos</p>
                </div>
                <div className="w-px h-8" style={{ background: '#E8D5CF' }} />
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#7B5A94' }}>3</p>
                  <p className="text-xs" style={{ color: '#A89BA9' }}>trimestres</p>
                </div>
                <div className="w-px h-8" style={{ background: '#E8D5CF' }} />
                <div>
                  <p className="text-2xl font-bold" style={{ color: '#D49442' }}>10</p>
                  <p className="text-xs" style={{ color: '#A89BA9' }}>aulas de parto</p>
                </div>
              </div>
            </div>

            {/* Right — Hero image / card */}
            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Decorative card behind */}
                <div className="absolute inset-0 rounded-3xl rotate-3 scale-95 opacity-50"
                  style={{ background: 'linear-gradient(135deg, #E8C5D8, #C4A8D9)' }} />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(160deg, #F0D4E8 0%, #DCC8ED 50%, #C8B8E8 100%)' }}>
                  <Image
                    src="/pregnant-yoga.webp"
                    alt="Gestante praticando exercícios com alegria"
                    width={480}
                    height={380}
                    className="w-full h-auto"
                    priority
                  />
                  {/* Floating badge */}
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="rounded-2xl p-4 flex items-center gap-3 shadow-lg"
                      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: '#3E2828' }}>Exercício do dia pronto</p>
                        <p className="text-xs" style={{ color: '#8B7B8B' }}>Personalizado para o seu trimestre</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            Tudo que você precisa em um só lugar
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: '#8B7B8B' }}>
            Da atividade física segura até a preparação para o grande dia — sua gestação acompanhada com cuidado.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: <Play size={22} className="text-white" />,
              bg: 'linear-gradient(135deg, #D4A5A5 0%, #B07070 100%)',
              title: 'Exercícios por trimestre',
              desc: 'Conteúdo certo para cada fase da gestação, distribuído automaticamente.',
            },
            {
              icon: <Heart size={22} className="text-white" />,
              bg: 'linear-gradient(135deg, #C4A8D9 0%, #9B6FB0 100%)',
              title: 'Preparação para o parto',
              desc: '10 aulas completas — trabalho de parto, posições, respiração e pós-parto.',
            },
            {
              icon: <Trophy size={22} className="text-white" />,
              bg: 'linear-gradient(135deg, #F5C89A 0%, #D49442 100%)',
              title: 'Conquistas e ranking',
              desc: 'Metas, conquistas compartilháveis e ranking semanal para você se motivar.',
            },
            {
              icon: <Users size={22} className="text-white" />,
              bg: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)',
              title: 'Comunidade',
              desc: 'Conecte-se com outras mamães, compartilhe experiências e apoie quem está na mesma jornada.',
            },
          ].map((b) => (
            <div key={b.title} className="rounded-3xl p-6 flex flex-col gap-4 shadow-sm border border-white"
              style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)' }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md" style={{ background: b.bg }}>
                {b.icon}
              </div>
              <h3 className="font-bold text-base" style={{ color: '#3E2828' }}>{b.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DRA. FABIANA */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            {/* Foto — retrato completo */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Aro decorativo */}
                <div className="absolute -inset-3 rounded-[2.5rem] rotate-2"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', opacity: 0.4 }} />
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl"
                  style={{ width: 320, height: 420 }}>
                  <Image
                    src="/dra-fabiana.jpg"
                    alt="Dra. Fabiana Pinheiro — Fisioterapeuta Pélvica"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center top' }}
                    sizes="320px"
                  />
                </div>
                {/* Badge flutuante */}
                <div className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
                  style={{ background: 'white', minWidth: 180 }}>
                  <p className="font-bold text-sm" style={{ color: '#3E2828' }}>Dra. Fabiana Pinheiro</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9B6FB0' }}>Fisioterapeuta Pélvica</p>
                </div>
              </div>
            </div>

            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#C4A8D9', color: '#7B5A94' }}>
                <Shield size={13} />
                Especialista em saúde da mulher
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
                Criado por quem cuida de gestantes todos os dias
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#8B7B8B' }}>
                A Dra. Fabiana Pinheiro é fisioterapeuta pélvica especializada em saúde da mulher.
                Cada exercício do app foi desenvolvido por ela com foco em <strong style={{ color: '#9B5C5C' }}>segurança, eficácia e bem-estar</strong> —
                para que você se mova com confiança em cada fase da gravidez.
              </p>
              <div className="space-y-3">
                {[
                  'Exercícios validados clinicamente',
                  'Adaptados para cada trimestre',
                  'Seguros para mamãe e bebê',
                  'Preparação completa para o parto',
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

      {/* HOW IT WORKS */}
      <section className="py-20 max-w-5xl mx-auto px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
          Começa em menos de 1 minuto
        </h2>
        <p className="mb-16" style={{ color: '#8B7B8B' }}>Três passos para começar a cuidar de você</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '1', title: 'Crie sua conta', desc: 'Sem cartão de crédito. 7 dias grátis para explorar tudo.', color: '#D4A5A5' },
            { n: '2', title: 'Informe seu trimestre', desc: 'O app personaliza os exercícios do dia para a sua fase.', color: '#C4A8D9' },
            { n: '3', title: 'Pratique com segurança', desc: 'Siga os vídeos no seu ritmo, de casa ou de onde estiver.', color: '#F5C89A' },
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

      {/* PRICING */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 100%)' }}>
        <div className="max-w-lg mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>Simples e sem surpresas</h2>
          <p className="mb-12" style={{ color: '#8B7B8B' }}>Um plano. Acesso completo. Cancele quando quiser.</p>

          <div className="relative rounded-3xl p-8 shadow-xl border border-white"
            style={{ background: 'white' }}>
            {/* Badge topo */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
              <span className="text-white text-xs font-bold px-5 py-2 rounded-full shadow-lg"
                style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                ✨ 7 DIAS GRÁTIS — SEM CARTÃO
              </span>
            </div>

            <div className="mt-4 mb-2">
              <span className="text-6xl font-bold" style={{ color: '#3E2828' }}>R$&nbsp;47</span>
              <span style={{ color: '#8B7B8B' }}>/mês</span>
            </div>
            <p className="text-sm mb-8" style={{ color: '#A89BA9' }}>após os 7 dias gratuitos</p>

            <div className="space-y-3 mb-8 text-left">
              {[
                'Todos os exercícios por trimestre',
                '10 aulas sobre o trabalho de parto',
                'Vídeos educativos sobre a gestação',
                'Conquistas e ranking semanal',
                'Comunidade de mamães',
                'Acesso pelo celular, sem instalar nada',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-sm" style={{ color: '#5C4C5C' }}>{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
              style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
            >
              Começar 7 dias grátis
            </Link>
            <p className="text-xs mt-3" style={{ color: '#A89BA9' }}>
              Cancele quando quiser · Sem burocracia
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="py-20 max-w-3xl mx-auto px-5 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={22} style={{ color: '#F5C89A', fill: '#F5C89A' }} />
          ))}
        </div>
        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-6" style={{ color: '#3E2828' }}>
          "Nunca imaginei que me movimentar na gravidez fosse tão gostoso.
          Os vídeos são claros, os exercícios são seguros e eu me sinto muito mais disposta."
        </blockquote>
        <p className="text-sm" style={{ color: '#A89BA9' }}>— Mamãe no 2º trimestre</p>
      </section>

      {/* FAQ */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>Perguntas frequentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 60%, #B08BC4 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white leading-tight">
            Sua gestação merece<br />o melhor cuidado.
          </h2>
          <p className="text-lg mb-10 text-white/80 max-w-xl mx-auto">
            Comece hoje, sem compromisso. 7 dias grátis para sentir a diferença no seu corpo e na sua energia.
          </p>
          <Link
            href="/signup"
            className="inline-block font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{ background: 'white', color: '#9B5C5C' }}
          >
            Começar agora gratuitamente →
          </Link>
          <p className="text-sm text-white/60 mt-4">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/40" style={{ background: '#FDF4F8' }}>
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#A89BA9' }}>
          <span className="font-semibold" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">Termos de uso</Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors">Entrar</Link>
            <Link href="/signup" className="hover:text-primary-600 transition-colors">Criar conta</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
