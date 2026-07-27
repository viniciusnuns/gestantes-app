'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Screen =
  | { type: 'intro' }
  | { type: 'info' }
  | { type: 'question'; id: number }
  | { type: 'curiosity'; id: number }
  | { type: 'loading' }
  | { type: 'gate' }
  | { type: 'result' }
  | { type: 'cta' }

// ─── Dados do quiz ────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: 1,
    text: 'Qual trimestre você está?',
    options: [
      { label: '🤍 Primeiro', value: 'primeiro', pts: 10 },
      { label: '💛 Segundo', value: 'segundo', pts: 20 },
      { label: '🧡 Terceiro', value: 'terceiro', pts: 15 },
    ],
  },
  {
    id: 2,
    text: 'Qual é sua maior preocupação hoje?',
    options: [
      { label: '😰 Sentir dores', value: 'dores', pts: 10 },
      { label: '😰 O parto em si', value: 'parto', pts: 10 },
      { label: '😰 Machucar o bebê fazendo exercícios', value: 'bebe', pts: 10 },
      { label: '😰 Não saber se estou fazendo o suficiente', value: 'suficiente', pts: 10 },
      { label: '😄 Estou tranquila', value: 'tranquila', pts: 25 },
    ],
  },
  {
    id: 3,
    text: 'Você pratica exercícios específicos para gestantes?',
    options: [
      { label: 'Nunca', value: 'nunca', pts: 5 },
      { label: 'Às vezes', value: 'as-vezes', pts: 15 },
      { label: 'Toda semana', value: 'semana', pts: 25 },
      { label: 'Quase todos os dias', value: 'diario', pts: 30 },
    ],
  },
  {
    id: 4,
    text: 'Você já ouviu falar no assoalho pélvico?',
    options: [
      { label: '😅 Nunca ouvi falar', value: 'nunca', pts: 5 },
      { label: '🙂 Já ouvi um pouco', value: 'pouco', pts: 10 },
      { label: '😊 Sim, conheço', value: 'conheco', pts: 20 },
      { label: '💪 Faço exercícios para ele', value: 'faco', pts: 30 },
    ],
  },
  {
    id: 5,
    text: 'Quanto tempo você consegue dedicar por dia para cuidar de você?',
    options: [
      { label: '5 minutos', value: '5min', pts: 10 },
      { label: '10 minutos', value: '10min', pts: 20 },
      { label: '15 minutos', value: '15min', pts: 25 },
      { label: '30 minutos ou mais', value: '30min', pts: 30 },
    ],
  },
  {
    id: 6,
    text: 'Você conhece técnicas de respiração para o parto?',
    options: [
      { label: 'Nunca ouvi falar', value: 'nunca', pts: 5 },
      { label: 'Já ouvi falar', value: 'ouvi', pts: 15 },
      { label: 'Conheço', value: 'conheco', pts: 20 },
      { label: 'Pratico regularmente', value: 'pratico', pts: 30 },
    ],
  },
  {
    id: 7,
    text: 'Você acredita que seu corpo pode ser preparado para um parto mais tranquilo?',
    options: [
      { label: 'Não sei.', value: 'nao-sei', pts: 5 },
      { label: 'Talvez.', value: 'talvez', pts: 15 },
      { label: 'Sim.', value: 'sim', pts: 20 },
      { label: 'Com certeza.', value: 'certeza', pts: 30 },
    ],
  },
]

const CURIOSITIES = [
  {
    id: 1,
    text: 'Muitas dores da gestação não acontecem apenas pelo peso da barriga. Mudanças na postura, mobilidade e força muscular também influenciam bastante.',
  },
  {
    id: 2,
    text: 'O assoalho pélvico funciona como uma rede de músculos que ajuda a sustentar o bebê e participa ativamente do trabalho de parto.',
  },
  {
    id: 3,
    text: 'Aprender a respirar corretamente pode ajudar a lidar melhor com as contrações e tornar o trabalho de parto mais eficiente.',
  },
]

// ─── Sequência de telas ───────────────────────────────────────────────────────
// intro → info → q1 → q2 → curiosity1 → q3 → q4 → curiosity2 → q5 → q6 → curiosity3 → q7 → loading → gate → result → cta

const SEQUENCE: Screen[] = [
  { type: 'intro' },
  { type: 'info' },
  { type: 'question', id: 1 },
  { type: 'question', id: 2 },
  { type: 'curiosity', id: 1 },
  { type: 'question', id: 3 },
  { type: 'question', id: 4 },
  { type: 'curiosity', id: 2 },
  { type: 'question', id: 5 },
  { type: 'question', id: 6 },
  { type: 'curiosity', id: 3 },
  { type: 'question', id: 7 },
  { type: 'loading' },
  { type: 'gate' },
  { type: 'result' },
  { type: 'cta' },
]

const TOTAL_QUESTIONS = 7

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getScore(answers: Record<number, number>): number {
  return Object.values(answers).reduce((sum, pts) => sum + pts, 0)
}

function getLevel(score: number): { label: string; color: string; description: string; icon: string } {
  if (score >= 130) {
    return {
      icon: '🌟',
      label: 'Você está no caminho certo',
      color: '#7B5A94',
      description: 'Você já tem uma boa base de preparação. Com as aulas certas, vai chegar ao parto com ainda mais confiança e segurança.',
    }
  }
  if (score >= 80) {
    return {
      icon: '🌱',
      label: 'Você tem potencial para evoluir muito',
      color: '#C48A8A',
      description: 'Você já se preocupa com a preparação — e isso é ótimo. Mas ainda há pontos importantes que podem fazer grande diferença no seu parto.',
    }
  }
  return {
    icon: '💛',
    label: 'Você precisa de atenção agora',
    color: '#D49442',
    description: 'Seu corpo está se preparando, mas você ainda não está aproveitando esse tempo da forma mais completa. Ainda dá tempo de mudar isso.',
  }
}

function getQuestionNumber(screenIndex: number): number {
  return SEQUENCE.slice(0, screenIndex + 1).filter(s => s.type === 'question').length
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function QuizPage() {
  const [screenIndex, setScreenIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [visible, setVisible] = useState(true)

  const currentScreen = SEQUENCE[screenIndex]

  // Animação de entrada/saída entre telas
  function goTo(index: number) {
    setVisible(false)
    setTimeout(() => {
      setScreenIndex(index)
      setVisible(true)
    }, 220)
  }

  function next() {
    goTo(screenIndex + 1)
  }

  function handleAnswer(questionId: number, pts: number) {
    setAnswers(prev => ({ ...prev, [questionId]: pts }))
    next()
  }

  // Loading animado (tela 13)
  useEffect(() => {
    if (currentScreen.type !== 'loading') return
    const steps = [500, 1000, 1500, 2000, 2500]
    const timers = steps.map((delay, i) =>
      setTimeout(() => setLoadingStep(i + 1), delay)
    )
    const finalTimer = setTimeout(() => next(), 3200)
    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finalTimer)
    }
  }, [currentScreen.type])

  async function handleGateSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setSubmitting(true)
    try {
      await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, score: getScore(answers), answers }),
      })
    } catch {}
    setSubmitting(false)
    next()
  }

  // Progresso: apenas telas de pergunta contam
  const answeredCount = Object.keys(answers).length
  const progressPct = (answeredCount / TOTAL_QUESTIONS) * 100

  const score = getScore(answers)
  const level = getLevel(score)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FDF4F8 0%, #F5EBF7 100%)' }}
    >
      {/* Barra de progresso — só aparece durante as perguntas */}
      {(currentScreen.type === 'question' || currentScreen.type === 'curiosity') && (
        <div className="w-full h-1.5 bg-white/50">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #D4A5A5, #C4A8D9)',
            }}
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div
        className="flex-1 flex items-center justify-center px-5 py-10"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >
        <div className="w-full max-w-md">

          {/* ── TELA 1: Intro ── */}
          {currentScreen.type === 'intro' && (
            <div className="text-center space-y-6">
              <div className="relative w-full h-56 rounded-3xl overflow-hidden mb-2">
                <Image
                  src="/pregnant-yoga.webp"
                  alt="Gestante se preparando"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold leading-snug" style={{ color: '#5C4C5C' }}>
                Você realmente está preparada para o parto?
              </h1>
              <p className="text-base leading-relaxed" style={{ color: '#8B7B8B' }}>
                A maioria das gestantes acredita que sim... até descobrir que alguns pequenos hábitos podem fazer toda a diferença.
              </p>
              <button
                onClick={next}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Descobrir meu nível →
              </button>
              <p className="text-xs" style={{ color: '#A89BA9' }}>Leva menos de 2 minutos</p>
            </div>
          )}

          {/* ── TELA 2: Info ── */}
          {currentScreen.type === 'info' && (
            <div className="space-y-6">
              <p className="text-center text-sm font-medium" style={{ color: '#9B6FB0' }}>
                Apenas 7 perguntas. No final você vai descobrir:
              </p>
              <div className="space-y-3">
                {[
                  { icon: '📊', text: 'Seu nível real de preparação' },
                  { icon: '💪', text: 'Seus pontos fortes' },
                  { icon: '🎯', text: 'O que pode melhorar agora' },
                  { icon: '✨', text: 'Recomendações personalizadas' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-medium" style={{ color: '#5C4C5C' }}>{item.text}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={next}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Começar agora →
              </button>
            </div>
          )}

          {/* ── TELAS DE PERGUNTA ── */}
          {currentScreen.type === 'question' && (() => {
            const q = QUESTIONS.find(q => q.id === currentScreen.id)!
            const qNum = getQuestionNumber(screenIndex)
            return (
              <div className="space-y-5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(196,168,217,0.2)', color: '#9B6FB0' }}
                  >
                    Pergunta {qNum} de {TOTAL_QUESTIONS}
                  </span>
                </div>
                <h2 className="text-xl font-bold leading-snug" style={{ color: '#5C4C5C' }}>
                  {q.text}
                </h2>
                <div className="space-y-3">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(q.id, opt.pts)}
                      className="w-full text-left p-4 rounded-2xl font-medium transition-all active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        color: '#5C4C5C',
                        border: '2px solid transparent',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#C4A8D9'
                        e.currentTarget.style.background = 'rgba(255,255,255,1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.background = 'rgba(255,255,255,0.8)'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })()}

          {/* ── TELAS DE CURIOSIDADE ── */}
          {currentScreen.type === 'curiosity' && (() => {
            const c = CURIOSITIES.find(c => c.id === currentScreen.id)!
            return (
              <div className="space-y-6">
                <div
                  className="p-6 rounded-3xl space-y-4"
                  style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(196,168,217,0.3)' }}
                >
                  <div className="text-3xl">💡</div>
                  <p className="text-base leading-relaxed font-medium" style={{ color: '#5C4C5C' }}>
                    {c.text}
                  </p>
                </div>
                <button
                  onClick={next}
                  className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
                >
                  Continuar →
                </button>
              </div>
            )
          })()}

          {/* ── TELA 13: Loading ── */}
          {currentScreen.type === 'loading' && (
            <div className="text-center space-y-8">
              <div className="text-4xl animate-pulse">✨</div>
              <div>
                <h2 className="text-xl font-bold mb-2" style={{ color: '#5C4C5C' }}>
                  Analisando suas respostas...
                </h2>
                <p className="text-sm" style={{ color: '#8B7B8B' }}>Estamos preparando seu diagnóstico</p>
              </div>
              <div className="space-y-3 text-left">
                {[
                  'Mobilidade e postura',
                  'Nível de exercício',
                  'Respiração e técnicas',
                  'Preparação para o parto',
                  'Resultado final',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                      style={{
                        background: loadingStep > i ? 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' : 'rgba(0,0,0,0.08)',
                        color: loadingStep > i ? 'white' : 'transparent',
                      }}
                    >
                      ✓
                    </div>
                    <span
                      className="text-sm font-medium transition-colors duration-300"
                      style={{ color: loadingStep > i ? '#5C4C5C' : '#C4BDBA' }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TELA 14: Gate (captura) ── */}
          {currentScreen.type === 'gate' && (
            <form onSubmit={handleGateSubmit} className="space-y-5">
              <div className="text-center space-y-2">
                <div className="text-4xl">📊</div>
                <h2 className="text-xl font-bold" style={{ color: '#5C4C5C' }}>
                  Seu resultado está pronto.
                </h2>
                <p className="text-sm" style={{ color: '#8B7B8B' }}>
                  Para onde enviamos seu diagnóstico completo?
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(196,168,217,0.4)',
                    color: '#5C4C5C',
                  }}
                />
                <input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    border: '2px solid rgba(196,168,217,0.4)',
                    color: '#5C4C5C',
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                {submitting ? 'Salvando...' : 'Ver meu resultado →'}
              </button>
              <p className="text-center text-xs" style={{ color: '#A89BA9' }}>
                Sem spam. Só conteúdo útil para sua gestação.
              </p>
            </form>
          )}

          {/* ── TELA 15: Resultado ── */}
          {currentScreen.type === 'result' && (
            <div className="space-y-5">
              <div className="text-center space-y-3">
                <div className="text-5xl">{level.icon}</div>
                <h2 className="text-xl font-bold leading-snug" style={{ color: level.color }}>
                  {level.label}
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>
                  {level.description}
                </p>
              </div>

              <div
                className="p-5 rounded-3xl space-y-3"
                style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(196,168,217,0.3)' }}
              >
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9B6FB0' }}>
                  O que o programa trabalha
                </p>
                {[
                  '✔ Exercícios específicos para cada trimestre',
                  '✔ Mobilidade da pelve e postura',
                  '✔ Assoalho pélvico na prática',
                  '✔ Técnicas de respiração para o parto',
                  '✔ Preparação física e mental completa',
                ].map((item, i) => (
                  <p key={i} className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{item}</p>
                ))}
              </div>

              <button
                onClick={next}
                className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Quero me preparar →
              </button>
            </div>
          )}

          {/* ── TELA 16: CTA ── */}
          {currentScreen.type === 'cta' && (
            <div className="text-center space-y-6">
              <div className="text-4xl">🤰</div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold leading-snug" style={{ color: '#5C4C5C' }}>
                  Imagine chegar ao parto sabendo exatamente o que fazer.
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>
                  Foi pensando nisso que nasceu o Gestar em Movimento — um programa completo de preparação para a gestação e o parto.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { icon: '🎥', text: 'Aulas guiadas em vídeo' },
                  { icon: '🤰', text: 'Exercícios seguros por trimestre' },
                  { icon: '🫶', text: 'Preparação completa para o parto' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{item.text}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/"
                className="block w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg text-center active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
              >
                Quero começar minha preparação →
              </Link>

              <p className="text-xs" style={{ color: '#A89BA9' }}>
                🔒 Acesso imediato · 7 dias de garantia
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
