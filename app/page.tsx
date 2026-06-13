'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { ChevronDown, Play, Shield, Heart, Trophy, Users, CheckCircle, Star } from 'lucide-react'

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
    a: 'Para todos os três trimestres. O app identifica sua fase e entrega exercícios adequados para o momento da sua gestação — do primeiro ao terceiro trimestre, incluindo preparação completa para o parto.',
  },
  {
    q: 'Como funciona o período gratuito?',
    a: '7 dias com acesso completo a todo o conteúdo, sem precisar cadastrar cartão de crédito. Se gostar, assine por R$ 47/mês. Se não quiser continuar, não precisa fazer nada — o acesso encerra automaticamente.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. Sem multa, sem burocracia. Cancele a qualquer momento diretamente pelo app ou pelo email.',
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="border border-warm-300 rounded-2xl overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-warm-50 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-text-primary pr-4">{item.q}</span>
            <ChevronDown
              size={20}
              className={`text-primary-500 flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5 bg-white">
              <p className="text-text-secondary leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-warm-50 text-text-primary">

      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-warm-200">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-lg text-primary-700">Gestar em Movimento</span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-primary-600 transition-colors">
              Entrar
            </Link>
            <Link
              href="/signup"
              className="bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="relative max-w-5xl mx-auto px-5 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-primary-200 rounded-full px-4 py-1.5 mb-8 shadow-sm">
            <Shield size={14} className="text-primary-500" />
            <span className="text-xs font-semibold text-primary-700">Criado por Fisioterapeuta Pélvica</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-text-primary">
            Cuide de você.<br />
            <span className="text-primary-600">Cuide do seu bebê.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed mb-10">
            Exercícios seguros e personalizados para cada fase da sua gestação —
            do primeiro trimestre até a preparação completa para o parto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/signup"
              className="w-full sm:w-auto gradient-primary text-white font-bold text-lg px-10 py-4 rounded-2xl shadow-lg hover:opacity-90 transition-opacity text-center"
            >
              Começar 7 dias grátis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto bg-white border-2 border-warm-300 text-text-secondary font-semibold text-lg px-10 py-4 rounded-2xl hover:border-primary-300 transition-colors text-center"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="text-sm text-text-light">
            Sem cartão de crédito · 7 dias grátis · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-y border-warm-200 py-8">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary-600">70+</p>
              <p className="text-sm text-text-secondary mt-1">vídeos de exercícios</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">3</p>
              <p className="text-sm text-text-secondary mt-1">trimestres cobertos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-600">10</p>
              <p className="text-sm text-text-secondary mt-1">aulas sobre o parto</p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa em um só lugar
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Do primeiro exercício até o grande dia — sua gestação acompanhada com segurança e carinho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mb-5">
              <Play size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">Exercícios por trimestre</h3>
            <p className="text-text-secondary leading-relaxed">
              Cada fase da gestação tem exercícios específicos. O app distribui automaticamente os melhores exercícios para o seu momento.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm">
            <div className="w-12 h-12 gradient-secondary rounded-2xl flex items-center justify-center mb-5">
              <Heart size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">Preparação para o parto</h3>
            <p className="text-text-secondary leading-relaxed">
              10 aulas completas sobre trabalho de parto, posições, respiração, fase ativa, cesárea e orientações pós-parto.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm">
            <div className="w-12 h-12 bg-accent-300 rounded-2xl flex items-center justify-center mb-5">
              <Trophy size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">Conquistas e progresso</h3>
            <p className="text-text-secondary leading-relaxed">
              Desbloqueie conquistas, suba no ranking semanal e compartilhe seus marcos com amigas e família.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-warm-200 shadow-sm">
            <div className="w-12 h-12 bg-secondary-300 rounded-2xl flex items-center justify-center mb-5">
              <Users size={22} className="text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">Comunidade de mamães</h3>
            <p className="text-text-secondary leading-relaxed">
              Compartilhe experiências, tire dúvidas e encontre apoio de outras mamães que estão na mesma jornada.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-20 border-y border-warm-200">
        <div className="max-w-4xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
          <p className="text-text-secondary mb-14">Três passos para começar a cuidar de você</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { n: '1', title: 'Crie sua conta', desc: 'Cadastro em menos de 1 minuto. Sem cartão de crédito para começar.' },
              { n: '2', title: 'Informe seu trimestre', desc: 'O app personaliza os exercícios do dia para a fase certa da sua gestação.' },
              { n: '3', title: 'Pratique com segurança', desc: 'Siga os vídeos no seu ritmo, de onde estiver, quando quiser.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-center">
                <div className="w-14 h-14 gradient-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-5 shadow-md">
                  {step.n}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRA. FABIANA */}
      <section className="py-20 max-w-5xl mx-auto px-5">
        <div className="bg-white rounded-3xl border border-warm-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="relative h-80 md:h-auto">
              <Image
                src="/dra-fabiana.jpg"
                alt="Dra. Fabiana Pinheiro — Fisioterapeuta Pélvica"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-full px-3 py-1 mb-6 w-fit">
                <Shield size={13} className="text-primary-500" />
                <span className="text-xs font-semibold text-primary-700">Criado por especialista</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Dra. Fabiana Pinheiro
              </h2>
              <p className="text-primary-600 font-semibold mb-5">Fisioterapeuta Pélvica</p>
              <p className="text-text-secondary leading-relaxed mb-6">
                Especializada em saúde da mulher durante a gestação, Dra. Fabiana criou cada exercício com foco em
                segurança, eficácia e bem-estar — para que você se mova com confiança em cada fase da gravidez.
              </p>
              <div className="space-y-2">
                {[
                  'Exercícios validados clinicamente',
                  'Adaptados para cada trimestre',
                  'Seguros para mamãe e bebê',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-primary-500 flex-shrink-0" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="bg-white border-y border-warm-200 py-20">
        <div className="max-w-xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simples e sem surpresas</h2>
          <p className="text-text-secondary mb-12">Um plano. Acesso completo. Cancele quando quiser.</p>

          <div className="bg-warm-50 border-2 border-primary-300 rounded-3xl p-8 shadow-sm relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="gradient-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow">
                7 DIAS GRÁTIS
              </span>
            </div>

            <div className="mt-2 mb-6">
              <span className="text-5xl font-bold text-text-primary">R$ 47</span>
              <span className="text-text-secondary">/mês</span>
            </div>

            <div className="space-y-3 mb-8 text-left">
              {[
                'Acesso a todos os exercícios',
                'Vídeos de preparação para o parto',
                'Conteúdos educativos sobre a gestação',
                'Conquistas e ranking',
                'Comunidade de mamães',
                'Acesso pelo celular, sem instalar nada',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-primary-500 flex-shrink-0" />
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>

            <Link
              href="/signup"
              className="block w-full gradient-primary text-white font-bold text-lg py-4 rounded-2xl hover:opacity-90 transition-opacity text-center shadow-md"
            >
              Começar 7 dias grátis
            </Link>
            <p className="text-xs text-text-light mt-3">
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 max-w-5xl mx-auto px-5 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={20} className="text-accent-500 fill-accent-400" />
          ))}
        </div>
        <blockquote className="text-xl md:text-2xl font-medium text-text-primary max-w-2xl mx-auto mb-6 leading-relaxed">
          "Nunca imaginei que me movimentar na gravidez fosse tão gostoso. Os vídeos são claros, os exercícios são seguros e eu me sinto muito mais disposta."
        </blockquote>
        <p className="text-text-secondary text-sm">— Mamãe no 2º trimestre</p>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-warm-200 py-20">
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Perguntas frequentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 max-w-4xl mx-auto px-5 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-5 leading-tight">
          Sua gestação merece<br />
          <span className="text-primary-600">o melhor cuidado.</span>
        </h2>
        <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
          Comece hoje, sem compromisso. 7 dias grátis para sentir a diferença no seu corpo e na sua energia.
        </p>
        <Link
          href="/signup"
          className="inline-block gradient-primary text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl hover:opacity-90 transition-opacity"
        >
          Começar agora gratuitamente →
        </Link>
        <p className="text-sm text-text-light mt-4">
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-warm-200 py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-text-light">
          <span className="font-semibold text-text-secondary">Gestar em Movimento</span>
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
