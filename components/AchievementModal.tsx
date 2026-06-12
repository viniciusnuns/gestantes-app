'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Check, Download } from 'lucide-react'
import type { Achievement } from '@/lib/data'

interface Props {
  achievement: Achievement
  onClose: () => void
}

const MOTIVATIONAL: Record<string, string> = {
  'ach-6': 'Cada grande jornada começa com um único passo — e o seu foi lindo 🌱',
  'ach-7': 'Mamãe que se cuida e se conhece cria a base mais sólida para o bebê 🧠💜',
  'ach-1': 'Sete dias que seu bebê nunca vai esquecer — ele sentiu cada movimento 🌸',
  'ach-2': 'Trinta dias de amor puro. Seu corpo agradece e seu bebê celebra com você 🌺',
  'ach-3': 'Você prova todo dia que força e delicadeza podem caminhar juntas ✨',
  'ach-4': 'Sua voz aquece corações. Outras mamães se sentem menos sozinhas por sua causa 💜',
  'ach-5': 'Você acendeu uma luz aqui dentro. Bem-vinda ao nosso círculo de mamães 💬',
  'ach-8': 'Você se preparou com todo amor. O grande dia chegará e você estará pronta 🤱',
}

const SHARE_TEXT: Record<string, string> = {
  'ach-6': '🌱 Dei meu primeiro passo na jornada do Gestar em Movimento! Uma fase linda começa aqui.',
  'ach-7': '🧠 Me tornei uma Mamãe Bem Informada! Aprendi tudo sobre meu corpo e meu bebê. #GestarEmMovimento',
  'ach-1': '🌸 7 dias de amor em movimento! Conquistei minha Primeira Semana no Gestar em Movimento — e meu bebê sentiu cada um deles.',
  'ach-2': '🌺 30 dias florescendo! Um mês inteiro cuidando de mim e do meu bebê com o Gestar em Movimento.',
  'ach-3': '✨ 10 dias de pura força! Provei pra mim mesma que sou capaz — e meu bebê sabe disso.',
  'ach-4': '💜 Hoje me tornei Voz da Comunidade! Amei cada conversa com outras mamães incríveis.',
  'ach-5': '💬 Fiz meu primeiro post no Gestar em Movimento! Me sinto parte de algo muito especial.',
  'ach-8': '🤱 Conquista desbloqueada: Guerreira do Parto! Me preparei com amor para o dia mais importante da minha vida.',
}

const CONFETTI = [
  { color: '#f9a8d4', left: '8%',  delay: '0s',    size: 8,  round: true  },
  { color: '#c084fc', left: '18%', delay: '0.1s',  size: 10, round: false },
  { color: '#818cf8', left: '30%', delay: '0.05s', size: 7,  round: true  },
  { color: '#34d399', left: '42%', delay: '0.15s', size: 9,  round: false },
  { color: '#fbbf24', left: '55%', delay: '0s',    size: 8,  round: true  },
  { color: '#fb7185', left: '65%', delay: '0.2s',  size: 11, round: false },
  { color: '#a78bfa', left: '76%', delay: '0.08s', size: 7,  round: true  },
  { color: '#6ee7b7', left: '88%', delay: '0.12s', size: 9,  round: false },
]

const APP_URL = 'https://gestantes-app.vercel.app'
const DURATION = 6000

export default function AchievementModal({ achievement, onClose }: Props) {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied'>('idle')
  const pausedRef = useRef(false)
  const elapsedRef = useRef(0)
  const lastTickRef = useRef(Date.now())

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))

    const interval = setInterval(() => {
      if (pausedRef.current) {
        lastTickRef.current = Date.now()
        return
      }
      const now = Date.now()
      elapsedRef.current += now - lastTickRef.current
      lastTickRef.current = now
      const remaining = Math.max(0, 100 - (elapsedRef.current / DURATION) * 100)
      setProgress(remaining)
      if (remaining === 0) {
        clearInterval(interval)
        handleClose()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  const handleShare = async () => {
    pausedRef.current = true
    setShareState('loading')

    const shareText = SHARE_TEXT[achievement.id] ?? `${achievement.icon} Acabei de conquistar "${achievement.name}" no Gestar em Movimento! Estou arrasando nessa jornada 💜`
    const title = `${achievement.icon} ${achievement.name} — Gestar em Movimento`

    try {
      const res = await fetch(`/api/achievement-card?id=${achievement.id}`)
      const blob = await res.blob()
      const file = new File([blob], `conquista-${achievement.id}.png`, { type: 'image/png' })

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        // Share nativo com imagem — abre WhatsApp, Instagram, etc.
        await navigator.share({ files: [file], title, text: shareText })
      } else if (navigator.share) {
        // Fallback: share só texto (sem imagem)
        await navigator.share({ title, text: shareText, url: APP_URL })
      } else {
        // Desktop: baixa a imagem
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `conquista-${achievement.id}.png`
        a.click()
        URL.revokeObjectURL(url)
        setShareState('copied')
        setTimeout(() => setShareState('idle'), 2500)
        return
      }
    } catch {
      // Usuária cancelou — não faz nada
    } finally {
      setShareState('idle')
      pausedRef.current = false
      lastTickRef.current = Date.now()
    }
  }

  const motivational = MOTIVATIONAL[achievement.id] ?? 'Você está arrasando! 💜'

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ background: 'rgba(0,0,0,0.82)' }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Conquista desbloqueada: ${achievement.name}`}
    >
      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <div
          key={i}
          className="absolute top-8 pointer-events-none animate-bounce"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            borderRadius: c.round ? '50%' : '2px',
            animationDelay: c.delay,
            animationDuration: '0.9s',
          }}
        />
      ))}

      {/* Card */}
      <div
        className={`bg-white rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl transition-all duration-300 ${
          visible ? 'scale-100' : 'scale-75'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradiente */}
        <div className="gradient-primary p-8 text-center">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-5">
            ✨ Conquista Desbloqueada
          </p>
          <div className="text-6xl mb-4 inline-block animate-pulse">
            {achievement.icon}
          </div>
          <h2 className="text-white text-xl font-bold leading-tight">
            {achievement.name}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center">
          <p className="text-text-secondary text-sm leading-relaxed">
            {achievement.description}
          </p>
          <p className="text-primary-600 font-semibold text-sm mt-3">
            {motivational}
          </p>

          {/* Botões */}
          <div className="mt-5 flex gap-2">
            <button
              onClick={handleShare}
              disabled={shareState === 'loading'}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary-500 text-primary-600 font-semibold text-sm hover:bg-primary-50 transition-colors disabled:opacity-60"
            >
              {shareState === 'copied'
                ? <><Download size={16} /> Baixada!</>
                : shareState === 'loading'
                ? <><Share2 size={16} /> Preparando...</>
                : <><Share2 size={16} /> Compartilhar</>}
            </button>
            <button
              onClick={() => { handleClose(); router.push('/progresso') }}
              className="flex-1 py-3 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-colors"
            >
              Ver conquistas
            </button>
          </div>

          {/* Timer bar */}
          <div className="mt-4 h-1.5 bg-warm-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-secondary mt-2 opacity-60">
            Toque em qualquer lugar para fechar
          </p>
        </div>
      </div>
    </div>
  )
}
