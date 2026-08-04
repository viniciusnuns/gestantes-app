'use client'

import { useState, useEffect, useRef } from 'react'
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
  | { type: 'result-page' }

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
  { type: 'result-page' },
]

const TOTAL_QUESTIONS = 7

// ─── Helpers de pontuação ─────────────────────────────────────────────────────

function getScore(answers: Record<number, { pts: number; value: string }>): number {
  return Object.values(answers).reduce((sum, a) => sum + a.pts, 0)
}

function getScore100(rawScore: number): number {
  const MIN = 50
  const MAX = 195
  return Math.max(0, Math.min(100, Math.round((rawScore - MIN) / (MAX - MIN) * 100)))
}

function getQuestionNumber(screenIndex: number): number {
  return SEQUENCE.slice(0, screenIndex + 1).filter(s => s.type === 'question').length
}

// ─── Helpers de resultado personalizado ──────────────────────────────────────

type RadarScores = {
  prepFisica: number
  respiracao: number
  mobilidade: number
  assoalho: number
  conhecimento: number
  confianca: number
}

function getRadarScores(answers: Record<number, { pts: number; value: string }>): RadarScores {
  const q3 = answers[3]?.value
  const q4 = answers[4]?.value
  const q5 = answers[5]?.value
  const q6 = answers[6]?.value
  const q7 = answers[7]?.value

  const prepFisica = ({ nunca: 15, 'as-vezes': 42, semana: 70, diario: 92 } as Record<string, number>)[q3] ?? 30
  const respiracao = ({ nunca: 12, ouvi: 30, conheco: 65, pratico: 92 } as Record<string, number>)[q6] ?? 25
  const timeScore = ({ '5min': 25, '10min': 45, '15min': 65, '30min': 85 } as Record<string, number>)[q5] ?? 35
  const mobilidade = Math.round(prepFisica * 0.6 + timeScore * 0.4)
  const assoalho = ({ nunca: 12, pouco: 32, conheco: 65, faco: 92 } as Record<string, number>)[q4] ?? 25
  const conhecimento = Math.round(assoalho * 0.4 + respiracao * 0.4 + prepFisica * 0.2)
  const confianca = ({ 'nao-sei': 12, talvez: 38, sim: 65, certeza: 92 } as Record<string, number>)[q7] ?? 30

  return { prepFisica, respiracao, mobilidade, assoalho, conhecimento, confianca }
}

function getScoreDescription(score100: number): string {
  if (score100 >= 65) return 'Você já tem uma boa base de preparação. Com os exercícios certos, vai chegar ao parto com ainda mais confiança e segurança.'
  if (score100 >= 40) return 'Você já começou sua preparação, mas ainda existem pontos importantes que podem fazer diferença até o parto.'
  return 'Sua gestação está avançando, mas você ainda não está aproveitando esse tempo da forma mais completa. Ainda dá tempo de mudar isso.'
}

function getWeeksEstimate(score100: number): number {
  if (score100 >= 65) return 4
  if (score100 >= 40) return 6
  return 8
}

function getPositives(answers: Record<number, { pts: number; value: string }>): string[] {
  const items: string[] = ['Você procura informações antes do parto']

  const q2 = answers[2]?.value
  if (q2 === 'tranquila') items.push('Você está tranquila e confiante com sua gestação')

  const q3 = answers[3]?.value
  if (q3 === 'semana' || q3 === 'diario') items.push('Você já mantém uma rotina de exercícios')

  const q4 = answers[4]?.value
  if (q4 === 'conheco' || q4 === 'faco') items.push('Você conhece e trabalha o assoalho pélvico')

  const q6 = answers[6]?.value
  if (q6 === 'conheco' || q6 === 'pratico') items.push('Você conhece técnicas de respiração para o parto')

  const q7 = answers[7]?.value
  if (q7 === 'sim' || q7 === 'certeza') items.push('Você acredita que pode se preparar')

  return items
}

function getAttentionItems(answers: Record<number, { pts: number; value: string }>): string[] {
  const items: string[] = []

  const q2 = answers[2]?.value
  if (q2 === 'dores') items.push('Com a preparação certa, as dores da gestação diminuem bastante')
  else if (q2 === 'parto') items.push('Sua preparação para o parto ainda não está completa')
  else if (q2 === 'bebe') items.push('O receio de exercitar pode estar te impedindo de se preparar')
  else if (q2 === 'suficiente') items.push('Falta clareza sobre o que fazer em cada semana da gestação')

  const q3 = answers[3]?.value
  if (q3 === 'nunca') items.push('Seu corpo ainda não está sendo preparado com exercícios específicos')
  else if (q3 === 'as-vezes') items.push('A irregularidade nos exercícios reduz muito os benefícios para o parto')
  else if (q3 === 'semana') items.push('Aumentar a frequência dos treinos pode acelerar sua preparação')

  const q4 = answers[4]?.value
  if (q4 === 'nunca') items.push('O assoalho pélvico é a chave do parto — e você ainda pode prepará-lo')
  else if (q4 === 'pouco') items.push('Seu assoalho pélvico precisa de atenção mais regular')
  else if (q4 === 'conheco') items.push('Você conhece o assoalho pélvico, mas ainda não pratica com regularidade')

  const q5 = answers[5]?.value
  if (q5 === '5min') items.push('Pequenos ajustes na sua rotina podem fazer uma diferença enorme')
  else if (q5 === '10min') items.push('Seu tempo de prática ainda é curto para os resultados que você merece')
  else if (q5 === '15min') items.push('Mais alguns minutos por dia fariam grande diferença na sua preparação')

  const q6 = answers[6]?.value
  if (q6 === 'nunca') items.push('Aprender a respirar corretamente pode tornar o parto muito mais tranquilo')
  else if (q6 === 'ouvi') items.push('Você conhece a respiração para o parto, mas ainda não colocou em prática')
  else if (q6 === 'conheco') items.push('Sua respiração está no caminho certo — praticar todo dia faz a diferença')

  const q7 = answers[7]?.value
  if (q7 === 'nao-sei') items.push('A insegurança que você sente hoje pode virar confiança com a orientação certa')
  else if (q7 === 'talvez') items.push('Você ainda tem dúvidas sobre sua capacidade de se preparar')
  else if (q7 === 'sim') items.push('Sua confiança pode crescer ainda mais com a preparação certa')

  if (items.length === 0) items.push('Sua mobilidade e flexibilidade ainda têm espaço para evoluir')

  return items
}

function getRecommendationBullets(answers: Record<number, { pts: number; value: string }>): string[] {
  const bullets: string[] = []

  const q2 = answers[2]?.value
  if (q2 === 'dores') bullets.push('Sente dores com frequência na gestação')
  else if (q2 === 'parto') bullets.push('Quer se preparar para o parto')
  else if (q2 === 'bebe') bullets.push('Quer exercitar com segurança para o bebê')
  else if (q2 === 'suficiente') bullets.push('Busca clareza sobre o que fazer em cada semana')
  else bullets.push('Busca uma preparação completa para a gestação')

  const q4 = answers[4]?.value
  if (q4 === 'nunca' || q4 === 'pouco') bullets.push('Ainda não está trabalhando o assoalho pélvico')
  else bullets.push('Quer aprofundar o trabalho do assoalho pélvico')

  const q6 = answers[6]?.value
  if (q6 === 'nunca' || q6 === 'ouvi') bullets.push('Ainda não domina técnicas de respiração para o parto')
  else bullets.push('Quer aperfeiçoar sua respiração para o parto')

  return bullets
}

// ─── Máscara de telefone BR ───────────────────────────────────────────────────

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// ─── Pixel helpers ────────────────────────────────────────────────────────────

function fbqTrack(event: string, params?: object) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, params)
  }
}

function fbqCustom(event: string, params?: object) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', event, params)
  }
}

// ─── ScoreGauge ───────────────────────────────────────────────────────────────

function ScoreGauge({ score100 }: { score100: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const duration = 1200
    const tick = () => {
      const elapsed = Date.now() - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(eased * score100))
      if (t < 1) requestAnimationFrame(tick)
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [score100])

  const r = 55
  const cx = 80
  const cy = 72
  const totalLength = Math.PI * r
  const progressLength = (display / 100) * totalLength

  return (
    <div className="relative mx-auto" style={{ width: 160, height: 88 }}>
      <svg width="160" height="88" viewBox="0 0 160 88" className="block">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A5A5" />
            <stop offset="100%" stopColor="#C4A8D9" />
          </linearGradient>
        </defs>
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(196,168,217,0.2)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progressLength} ${totalLength}`}
        />
      </svg>
      <div className="absolute inset-x-0 flex items-baseline justify-center gap-1" style={{ bottom: 2 }}>
        <span className="text-5xl font-bold leading-none" style={{ color: '#5C4C5C' }}>{display}</span>
        <span className="text-lg font-medium" style={{ color: '#8B7B8B' }}>/100</span>
      </div>
    </div>
  )
}

// ─── RadarChart ───────────────────────────────────────────────────────────────

const RADAR_AXES = [
  { key: 'prepFisica' as keyof RadarScores, label: ['Preparação', 'física'], angle: -90, anchor: 'middle' as const },
  { key: 'respiracao' as keyof RadarScores, label: ['Respiração'], angle: -30, anchor: 'start' as const },
  { key: 'mobilidade' as keyof RadarScores, label: ['Mobilidade'], angle: 30, anchor: 'start' as const },
  { key: 'assoalho' as keyof RadarScores, label: ['Assoalho', 'pélvico'], angle: 90, anchor: 'middle' as const },
  { key: 'conhecimento' as keyof RadarScores, label: ['Conhecimento'], angle: 150, anchor: 'end' as const },
  { key: 'confianca' as keyof RadarScores, label: ['Confiança'], angle: 210, anchor: 'end' as const },
]

function RadarChart({ scores }: { scores: RadarScores }) {
  const cx = 180
  const cy = 132
  const r = 80
  const labelR = 110

  function pt(angleDeg: number, radius: number) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function toPoints(values: number[]) {
    return RADAR_AXES.map((a, i) => {
      const p = pt(a.angle, (values[i] / 100) * r)
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`
    }).join(' ')
  }

  const userVals = RADAR_AXES.map(a => scores[a.key])
  const idealVals = RADAR_AXES.map(() => 85)
  const gridLevels = [25, 50, 75, 100]

  return (
    <svg width="100%" viewBox="0 0 360 272" className="block mx-auto" style={{ maxWidth: 360 }}>
      {/* Grid rings */}
      {gridLevels.map(lvl => (
        <polygon
          key={lvl}
          points={toPoints(RADAR_AXES.map(() => lvl))}
          fill="none"
          stroke="rgba(196,168,217,0.25)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {RADAR_AXES.map(a => {
        const p = pt(a.angle, r)
        return (
          <line
            key={a.key}
            x1={cx} y1={cy}
            x2={p.x.toFixed(1)} y2={p.y.toFixed(1)}
            stroke="rgba(196,168,217,0.25)"
            strokeWidth="1"
          />
        )
      })}

      {/* Ideal polygon */}
      <polygon
        points={toPoints(idealVals)}
        fill="rgba(212,165,165,0.08)"
        stroke="#D4A5A5"
        strokeWidth="1.5"
        strokeDasharray="4 3"
      />

      {/* User polygon */}
      <polygon
        points={toPoints(userVals)}
        fill="rgba(123,90,148,0.18)"
        stroke="#7B5A94"
        strokeWidth="2"
      />

      {/* Dots on user polygon */}
      {RADAR_AXES.map(a => {
        const p = pt(a.angle, (scores[a.key] / 100) * r)
        return <circle key={a.key} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#7B5A94" />
      })}

      {/* Labels */}
      {RADAR_AXES.map(a => {
        const p = pt(a.angle, labelR)
        return (
          <text key={a.key} textAnchor={a.anchor} fontSize="10" fill="#8B7B8B">
            {a.label.map((line, i) => (
              <tspan
                key={i}
                x={p.x.toFixed(1)}
                y={(p.y + (i - (a.label.length - 1) / 2) * 13).toFixed(1)}
              >
                {line}
              </tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function QuizPage() {
  const [screenIndex, setScreenIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { pts: number; value: string }>>({})
  const [name, setName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [whatsappError, setWhatsappError] = useState('')
  const [loadingStep, setLoadingStep] = useState(0)
  const [visible, setVisible] = useState(true)

  const utmRef = useRef<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    const utms: Record<string, string> = {}
    keys.forEach(k => { const v = params.get(k); if (v) utms[k] = v })
    if (Object.keys(utms).length) {
      utmRef.current = utms
      sessionStorage.setItem('utm_data', JSON.stringify(utms))
    } else {
      const stored = sessionStorage.getItem('utm_data')
      if (stored) utmRef.current = JSON.parse(stored)
    }
  }, [])

  const currentScreen = SEQUENCE[screenIndex]

  useEffect(() => {
    if (currentScreen.type === 'info') fbqCustom('QuizStart')
    if (currentScreen.type === 'result-page') {
      fbqTrack('ViewContent', { content_name: 'Quiz Resultado' })
    }
  }, [screenIndex])

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

  function handleAnswer(questionId: number, pts: number, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: { pts, value } }))
    next()
  }

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
    const whatsappDigits = whatsapp.replace(/\D/g, '')
    if (whatsappDigits.length < 11) {
      setWhatsappError('Número incompleto. Verifique o DDD.')
      return
    }
    setWhatsappError('')
    setSubmitting(true)
    try {
      await fetch('/api/quiz-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, whatsapp, score: getScore(answers), answers, ...utmRef.current }),
      })
      const phone = whatsapp.replace(/\D/g, '')
      fbqTrack('Lead', { content_name: 'Quiz GEM', ...(phone && { ph: phone }) })
    } catch {}
    setSubmitting(false)
    next()
  }

  const answeredCount = Object.keys(answers).length
  const progressPct = (answeredCount / TOTAL_QUESTIONS) * 100
  const score = getScore(answers)
  const score100 = getScore100(score)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #FDF4F8 0%, #F5EBF7 100%)' }}
    >
      {/* Barra de progresso */}
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

      {/* Animação de entrada/saída */}
      <div
        className="flex-1 flex flex-col"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.22s ease, transform 0.22s ease',
        }}
      >

        {/* ── TELA 1: Intro ── */}
        {currentScreen.type === 'intro' && (
          <div className="flex flex-col flex-1 w-full max-w-md mx-auto px-6">
            <div className="pt-8 pb-5 flex items-center justify-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="Gestar em Movimento"
                style={{ height: 36, width: 'auto', mixBlendMode: 'multiply' }}
              />
              <span className="text-base font-bold tracking-tight">
                <span style={{ color: '#2E1B4E' }}>Gestar em </span>
                <span style={{ color: '#C4607A' }}>Movimento</span>
              </span>
            </div>
            <div className="text-center">
              <h1 className="text-[1.9rem] font-bold leading-tight mb-4" style={{ color: '#2E1B4E' }}>
                Você realmente<br />está preparada<br />para o parto?
              </h1>
              <p className="text-sm leading-relaxed px-2" style={{ color: '#8B7B8B' }}>
                A maioria das gestantes acredita que sim... até descobrir que alguns pequenos hábitos podem fazer toda a diferença.
              </p>
            </div>
            <div className="flex-1 relative mt-2 -mx-6 min-h-72">
              <Image
                src="/quiz-capa.png"
                alt="Gestante cuidando da barriga"
                fill
                className="object-cover object-[50%_42%] sm:object-[50%_40%]"
                priority
              />
              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <button
                  onClick={() => { fbqCustom('QuizInicio'); next() }}
                  className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl active:scale-95 transition-transform"
                  style={{ background: 'linear-gradient(135deg, #E8678A 0%, #C4A8D9 50%, #9B6FB0 100%)' }}
                >
                  Descobrir meu nível →
                </button>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>⏱ Leva menos de 2 minutos</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Telas centralizadas (não-intro, não-result-page) ── */}
        {currentScreen.type !== 'intro' && currentScreen.type !== 'result-page' && (
          <div className="flex-1 flex items-center justify-center px-5 py-10">
            <div className="w-full max-w-md">

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
                const q = QUESTIONS.find(q => q.id === (currentScreen as { type: 'question'; id: number }).id)!
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
                          onClick={() => handleAnswer(q.id, opt.pts, opt.value)}
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
                const c = CURIOSITIES.find(c => c.id === (currentScreen as { type: 'curiosity'; id: number }).id)!
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

              {/* ── TELA: Loading ── */}
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
                    {['Mobilidade e postura', 'Nível de exercício', 'Respiração e técnicas', 'Preparação para o parto', 'Resultado final'].map((item, i) => (
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

              {/* ── TELA: Gate (captura) ── */}
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
                      style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(196,168,217,0.4)', color: '#5C4C5C' }}
                    />
                    <div>
                      <input
                        type="tel"
                        placeholder="WhatsApp (com DDD)"
                        value={whatsapp}
                        onChange={e => {
                          setWhatsapp(formatPhone(e.target.value))
                          setWhatsappError('')
                        }}
                        required
                        className="w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.9)',
                          border: `2px solid ${whatsappError ? '#f87171' : 'rgba(196,168,217,0.4)'}`,
                          color: '#5C4C5C',
                        }}
                      />
                      {whatsappError && (
                        <p className="text-xs mt-1.5 px-1" style={{ color: '#ef4444' }}>{whatsappError}</p>
                      )}
                    </div>
                    <input
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 rounded-2xl text-base outline-none"
                      style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(196,168,217,0.4)', color: '#5C4C5C' }}
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

            </div>
          </div>
        )}

        {/* ── RESULT PAGE: Scroll contínuo ── */}
        {currentScreen.type === 'result-page' && (() => {
          const radarScores = getRadarScores(answers)
          const scoreDesc = getScoreDescription(score100)
          const weeks = getWeeksEstimate(score100)
          const positives = getPositives(answers)
          const attentionItems = getAttentionItems(answers)
          const recoBullets = getRecommendationBullets(answers)

          return (
            <div className="w-full">

              {/* ── Seção 1: Score + Nível ── */}
              <section className="max-w-lg mx-auto px-5 pt-10 pb-8">
                <p className="text-center text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#9B6FB0' }}>
                  Seu nível de preparação
                </p>
                <ScoreGauge score100={score100} />
                <p className="text-center text-sm leading-relaxed mt-5 mb-6 px-2" style={{ color: '#5C4C5C' }}>
                  {scoreDesc}
                </p>

                {/* A boa notícia */}
                <div
                  className="rounded-2xl p-4 text-center mb-8"
                  style={{ background: 'rgba(212,165,165,0.12)', border: '1px solid rgba(212,165,165,0.3)' }}
                >
                  <p className="font-bold text-sm" style={{ color: '#C4607A' }}>A boa notícia?</p>
                  <p className="text-sm mt-1 font-medium leading-relaxed" style={{ color: '#5C4C5C' }}>
                    Você ainda está em tempo<br />de melhorar esses pontos. 💜
                  </p>
                </div>

                {/* Pontos fortes */}
                <div className="mb-6">
                  <p className="text-sm font-bold mb-3" style={{ color: '#5A8A5A' }}>
                    O que já está indo muito bem
                  </p>
                  <div className="space-y-3">
                    {positives.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 text-base mt-0.5">✅</span>
                        <p className="text-sm leading-relaxed" style={{ color: '#5C4C5C' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pontos de atenção */}
                <div>
                  <p className="text-sm font-bold mb-3" style={{ color: '#C4906A' }}>
                    Pontos que merecem atenção
                  </p>
                  <div className="space-y-3">
                    {attentionItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 text-base mt-0.5">⚠️</span>
                        <p className="text-sm leading-relaxed" style={{ color: '#5C4C5C' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="mx-5 border-t" style={{ borderColor: 'rgba(196,168,217,0.3)' }} />

              {/* ── Seção 2: Radar Chart ── */}
              <section className="max-w-lg mx-auto px-5 py-10">
                <h2 className="text-center text-lg font-bold mb-6" style={{ color: '#5C4C5C' }}>
                  Seu panorama de preparação
                </h2>
                <RadarChart scores={radarScores} />

                {/* Legenda */}
                <div className="flex items-center justify-center gap-8 mt-2 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-2.5 rounded-full" style={{ background: '#7B5A94' }} />
                    <span className="text-xs" style={{ color: '#8B7B8B' }}>Você</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg width="32" height="10"><line x1="0" y1="5" x2="32" y2="5" stroke="#D4A5A5" strokeWidth="1.5" strokeDasharray="4 3" /></svg>
                    <span className="text-xs" style={{ color: '#8B7B8B' }}>Ideal</span>
                  </div>
                </div>

                {/* Índice de preparação */}
                <div
                  className="rounded-2xl p-5 mb-6"
                  style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(196,168,217,0.3)' }}
                >
                  <p className="text-sm font-bold mb-4" style={{ color: '#5C4C5C' }}>Índice de Preparação</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm" style={{ color: '#8B7B8B' }}>Você:</span>
                    <span className="text-2xl font-black" style={{ color: '#9B6FB0' }}>{score100}</span>
                  </div>
                  {(() => {
                    const meta = score100 >= 65 ? 95 : 85
                    return (
                      <>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-sm" style={{ color: '#8B7B8B' }}>Meta: {meta}</span>
                        </div>
                        <div className="relative w-full h-3 rounded-full" style={{ background: 'rgba(196,168,217,0.2)' }}>
                          <div
                            className="absolute left-0 top-0 h-full rounded-full"
                            style={{ width: `${score100}%`, background: 'linear-gradient(90deg, #7B5A94, #C4A8D9)' }}
                          />
                          <div
                            className="absolute top-0 h-full w-0.5 bg-pink-300"
                            style={{ left: `${meta}%` }}
                          />
                        </div>
                      </>
                    )
                  })()}
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#C4BDBA' }}>
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Semanas + pilares */}
                <p className="text-center text-sm leading-relaxed mb-6" style={{ color: '#5C4C5C' }}>
                  Em aproximadamente <strong>{weeks} semanas</strong> de prática você pode evoluir bastante nesses pilares:
                </p>
                <div className="flex items-start justify-center gap-4">
                  {[
                    { emoji: '🏃', label: ['Mobilidade'] },
                    { emoji: '🫁', label: ['Respiração'] },
                    { emoji: '🦋', label: ['Assoalho', 'pélvico'] },
                    { emoji: '🤸', label: ['Alongamentos'] },
                    { emoji: '💪', label: ['Exercícios'] },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl"
                        style={{ background: 'rgba(196,168,217,0.18)' }}
                      >
                        {item.emoji}
                      </div>
                      <p className="text-[10px] text-center leading-tight" style={{ color: '#8B7B8B' }}>
                        {item.label.map((l, j) => <span key={j} className="block">{l}</span>)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mx-5 border-t" style={{ borderColor: 'rgba(196,168,217,0.3)' }} />

              {/* ── Seção 3: Imagine chegar ao parto ── */}
              <section className="max-w-lg mx-auto px-5 py-10">
                <h2 className="text-center text-xl font-bold mb-8" style={{ color: '#5C4C5C' }}>
                  Imagine chegar ao parto...
                </h2>
                <div className="space-y-5">
                  {[
                    'Sabendo exatamente como respirar durante as contrações.',
                    'Entendendo cada fase do trabalho de parto.',
                    'Sentindo menos dores durante a gestação.',
                    'Com seu assoalho pélvico fortalecido.',
                    'Sabendo quais exercícios fazer em cada semana.',
                    'Chegando mais confiante para viver esse momento.',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">💜</span>
                      <p className="text-base leading-relaxed pt-0.5" style={{ color: '#5C4C5C' }}>{item}</p>
                    </div>
                  ))}
                </div>
                <div
                  className="mt-8 rounded-2xl p-5 text-center"
                  style={{ background: 'rgba(212,165,165,0.12)', border: '1px solid rgba(212,165,165,0.3)' }}
                >
                  <p className="font-bold text-sm leading-relaxed" style={{ color: '#C4607A' }}>
                    Isso não acontece por sorte.<br />
                    Acontece quando existe preparação.
                  </p>
                  <p className="mt-3 text-xl">🩷</p>
                </div>
              </section>

              {/* ── Seção 4: Você sabia? + Recomendação + Alternativas ── */}
              <section className="w-full py-10" style={{ background: 'rgba(255,255,255,0.6)' }}>
                <div className="max-w-5xl mx-auto px-5">

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                    {/* Coluna esquerda: Você sabia? */}
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(196,168,217,0.25)' }}
                    >
                      <div className="p-5 text-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-xl"
                          style={{ background: 'rgba(123,90,148,0.12)' }}
                        >
                          💡
                        </div>
                        <h3 className="text-base font-bold mb-4" style={{ color: '#5C4C5C' }}>Você sabia?</h3>
                        <div className="rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3', position: 'relative' }}>
                          <Image src="/quiz-voce-sabia.webp" alt="Gestante" fill className="object-cover" />
                        </div>
                        <p className="text-sm leading-relaxed mb-4" style={{ color: '#8B7B8B' }}>
                          Gestantes que mantêm uma rotina de exercícios seguros durante a gestação costumam relatar maior confiança para lidar com o trabalho de parto e melhor bem-estar ao longo da gravidez.
                        </p>
                        <p className="text-sm font-medium" style={{ color: '#5C4C5C' }}>
                          💜 É exatamente por isso que criamos o <strong>Gestar em Movimento</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Coluna central: Recomendação principal */}
                    <div>
                      <p className="text-center text-sm font-medium mb-4" style={{ color: '#5C4C5C' }}>
                        Com base nas suas respostas,<br />nossa principal recomendação para você é:
                      </p>
                      <div
                        className="rounded-2xl overflow-hidden shadow-sm"
                        style={{ background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(196,168,217,0.35)' }}
                      >
                        <div className="px-5 pt-5 pb-1">
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-amber-400">⭐</span>
                            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#9B6FB0' }}>
                              Recomendado para você
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-black mb-3" style={{ color: '#2E1B4E' }}>
                                Gestar em Movimento Completo
                              </h3>
                              <p className="text-sm font-semibold mb-2" style={{ color: '#8B7B8B' }}>
                                Ideal porque você respondeu que:
                              </p>
                              <div className="space-y-1.5">
                                {recoBullets.map((b, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <span className="text-emerald-500 text-sm flex-shrink-0 mt-px">✓</span>
                                    <p className="text-sm leading-relaxed" style={{ color: '#5C4C5C' }}>{b}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <Image
                                src="/app-mockup.webp"
                                alt="App Gestar em Movimento"
                                width={120}
                                height={113}
                                className="w-28 h-auto"
                              />
                            </div>
                          </div>

                          {/* Ícones de features */}
                          <div
                            className="grid grid-cols-5 gap-1 py-3 border-t border-b mb-5"
                            style={{ borderColor: 'rgba(196,168,217,0.2)' }}
                          >
                            {[
                              { emoji: '📅', label: ['Exercícios', 'por trimestre'] },
                              { emoji: '🤱', label: ['Preparação', 'para o parto'] },
                              { emoji: '💆', label: ['Alívio de', 'dores'] },
                              { emoji: '🦋', label: ['Assoalho', 'pélvico'] },
                              { emoji: '🧘', label: ['Meditações', 'e respiração'] },
                            ].map((item, i) => (
                              <div key={i} className="flex flex-col items-center gap-1">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                                  style={{ background: 'rgba(196,168,217,0.18)' }}
                                >
                                  {item.emoji}
                                </div>
                                <p className="text-[9px] text-center leading-tight" style={{ color: '#8B7B8B' }}>
                                  {item.label.map((l, j) => <span key={j} className="block">{l}</span>)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Preço */}
                          <div className="text-center mb-4">
                            <p className="text-2xl font-black" style={{ color: '#2E1B4E' }}>12x de R$ 19,90</p>
                            <p className="text-xs mt-1" style={{ color: '#8B7B8B' }}>ou R$ 197,00 à vista</p>
                          </div>

                          {/* Botão principal */}
                          <Link
                            href="/checkout"
                            onClick={() => fbqTrack('InitiateCheckout', { content_name: 'Programa Completo GEM', value: 197.00, currency: 'BRL' })}
                            className="block w-full text-center py-4 rounded-xl text-white font-bold text-base shadow-md active:scale-95 transition-transform"
                            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
                          >
                            Quero seguir meu plano<br />personalizado →
                          </Link>
                          <p className="text-center text-xs mt-2 mb-4" style={{ color: '#A89BA9' }}>
                            🔒 Compra 100% segura
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Coluna direita: Foco específico */}
                    <div>
                      <p className="text-center text-sm font-medium mb-4" style={{ color: '#5C4C5C' }}>
                        Ou escolha um foco específico:
                      </p>
                      <div className="space-y-4">

                        {/* Parto */}
                        <div
                          className="rounded-2xl p-5"
                          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(196,168,217,0.3)' }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0 text-white"
                              style={{ background: '#7B5A94' }}
                            >
                              ▶
                            </div>
                            <h4 className="font-bold text-sm" style={{ color: '#7B5A94' }}>Programa Aulas sobre Parto</h4>
                          </div>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: '#8B7B8B' }}>
                            Ideal para quem quer focar apenas na preparação para o nascimento do bebê.
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#5C4C5C' }}>12x de R$ 6,70</p>
                          <p className="text-xs mb-3" style={{ color: '#A89BA9' }}>ou R$ 67,00 à vista</p>
                          <Link
                            href="/parto/checkout"
                            onClick={() => fbqTrack('InitiateCheckout', { content_name: 'Programa Parto GEM', value: 67.00, currency: 'BRL' })}
                            className="block w-full text-center py-3 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform"
                            style={{ background: '#7B5A94' }}
                          >
                            Quero este foco →
                          </Link>
                        </div>

                        {/* Dores */}
                        <div
                          className="rounded-2xl p-5"
                          style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(196,168,217,0.3)' }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                              style={{ background: '#7B5A94' }}
                            >
                              🌸
                            </div>
                            <h4 className="font-bold text-sm" style={{ color: '#7B5A94' }}>Programa Livre de Dores</h4>
                          </div>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: '#8B7B8B' }}>
                            Ideal para quem deseja reduzir os desconfortos da gestação.
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#5C4C5C' }}>10x de R$ 5,70</p>
                          <p className="text-xs mb-3" style={{ color: '#A89BA9' }}>ou R$ 47,00 à vista</p>
                          <Link
                            href="/dores/checkout"
                            onClick={() => fbqTrack('InitiateCheckout', { content_name: 'Programa Movimento GEM', value: 47.00, currency: 'BRL' })}
                            className="block w-full text-center py-3 rounded-xl text-white font-bold text-sm active:scale-95 transition-transform"
                            style={{ background: '#7B5A94' }}
                          >
                            Quero este foco →
                          </Link>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Trust bar — desktop */}
                  <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t"
                    style={{ borderColor: 'rgba(196,168,217,0.3)' }}
                  >
                    {[
                      { emoji: '⚡', label: ['Acesso imediato', 'após a compra'] },
                      { emoji: '🛡️', label: ['7 dias de garantia', 'incondicional'] },
                      { emoji: '⏰', label: ['Conteúdo disponível', '24h por dia'] },
                      { emoji: '💬', label: ['Suporte humanizado', 'e especializado'] },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 text-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                          style={{ background: 'rgba(196,168,217,0.18)' }}
                        >
                          {item.emoji}
                        </div>
                        <p className="text-xs leading-tight" style={{ color: '#8B7B8B' }}>
                          {item.label.map((l, j) => <span key={j} className="block">{l}</span>)}
                        </p>
                      </div>
                    ))}
                  </div>

                </div>
              </section>

              {/* Footer legal */}
              <footer className="py-6 mt-4 border-t" style={{ borderColor: 'rgba(196,168,217,0.3)' }}>
                <div className="max-w-2xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#A89BA9' }}>
                  <span className="font-semibold" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
                  <div className="flex items-center gap-4">
                    <a href="/terms" target="_blank" className="hover:text-primary-500 transition-colors">Termos de uso</a>
                    <a href="/privacy" target="_blank" className="hover:text-primary-500 transition-colors">Privacidade</a>
                  </div>
                </div>
              </footer>

            </div>
          )
        })()}

      </div>
    </div>
  )
}
