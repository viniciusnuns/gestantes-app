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
  'ach-6': 'Você deu o primeiro passo — a jornada mais importante da sua vida começou 🌱',
  'ach-7': 'Mamãe que se conhece chega muito mais preparada. Parabéns! 📚',
  'ach-1': 'Uma semana inteira cuidando de você e do seu bebê. Continue assim! 🎖️',
  'ach-2': 'Trinta dias de prática! Seu corpo e seu bebê agradecem 🏅',
  'ach-9': 'Dois meses! Você transformou o movimento em um hábito de vida 🥈',
  'ach-10': 'Três meses de dedicação. Você é uma inspiração para todas as mamães 🏆',
  'ach-3': 'Dez dias de prática provam que você é consistente. Isso faz toda a diferença 💪',
  'ach-4': 'Você faz parte da comunidade e ajuda outras mamães sem perceber 🗣️',
  'ach-5': 'Seu primeiro post marca o início de muitas conexões especiais 💬',
  'ach-8': 'Você estudou, se preparou e está pronta. O grande dia vai ser incrível 🤱',
}

const SHARE_TEXT: Record<string, string> = {
  'ach-6': '🌱 Iniciei minha jornada no Gestar em Movimento! Meu primeiro passo rumo a uma gestação mais saudável.',
  'ach-7': '📚 Me tornei uma Mamãe Bem Informada no Gestar em Movimento! Aprendi tudo sobre meu corpo e minha gestação. #GestarEmMovimento',
  'ach-1': '🎖️ Completei minha primeira semana no Gestar em Movimento! 7 dias cuidando de mim e do meu bebê.',
  'ach-2': '🏅 30 dias de prática no Gestar em Movimento! Um mês inteiro dedicado à minha saúde na gestação.',
  'ach-9': '🥈 60 dias no Gestar em Movimento! Dois meses cuidando de mim e do meu bebê. #GestarEmMovimento',
  'ach-10': '🏆 90 dias no Gestar em Movimento! Três meses de dedicação à minha gestação. Que jornada incrível! #GestarEmMovimento',
  'ach-3': '💪 10 dias de consistência no Gestar em Movimento! Provei pra mim mesma que consigo manter o ritmo.',
  'ach-4': '🗣️ Entrei para a comunidade do Gestar em Movimento! Adoro trocar experiências com outras mamães.',
  'ach-5': '💬 Fiz meu primeiro post no Gestar em Movimento! Me sinto parte de algo especial.',
  'ach-8': '🤱 Conquista desbloqueada: Pronta para o Parto! Assisti todos os vídeos e me preparei para o grande dia.',
}

const PETALS = [
  { color: '#fda4af', left: '5%',  delay: '0s',    size: 14, duration: '2.8s', radius: '60% 40% 55% 45% / 45% 55% 45% 55%' },
  { color: '#fecdd3', left: '14%', delay: '0.2s',  size: 11, duration: '3.2s', radius: '50% 50% 40% 60% / 60% 40% 60% 40%' },
  { color: '#fb7185', left: '24%', delay: '0.05s', size: 16, duration: '2.5s', radius: '70% 30% 60% 40% / 40% 60% 40% 60%' },
  { color: '#f9a8d4', left: '35%', delay: '0.35s', size: 12, duration: '3.0s', radius: '55% 45% 50% 50% / 50% 50% 55% 45%' },
  { color: '#fda4af', left: '45%', delay: '0.15s', size: 15, duration: '2.7s', radius: '45% 55% 65% 35% / 55% 45% 55% 45%' },
  { color: '#fecdd3', left: '56%', delay: '0.4s',  size: 10, duration: '3.4s', radius: '65% 35% 45% 55% / 35% 65% 35% 65%' },
  { color: '#fb7185', left: '66%', delay: '0.1s',  size: 13, duration: '2.9s', radius: '50% 50% 60% 40% / 60% 40% 50% 50%' },
  { color: '#f9a8d4', left: '76%', delay: '0.25s', size: 11, duration: '3.1s', radius: '40% 60% 50% 50% / 50% 50% 40% 60%' },
  { color: '#fda4af', left: '86%', delay: '0.08s', size: 14, duration: '2.6s', radius: '60% 40% 40% 60% / 40% 60% 60% 40%' },
  { color: '#fecdd3', left: '93%', delay: '0.3s',  size: 12, duration: '3.3s', radius: '55% 45% 55% 45% / 45% 55% 45% 55%' },
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
      {/* Pétalas de rosa */}
      {PETALS.map((p, i) => (
        <div
          key={i}
          className="absolute top-0 pointer-events-none animate-petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.3,
            backgroundColor: p.color,
            borderRadius: p.radius,
            animationDelay: p.delay,
            animationDuration: p.duration,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.4)`,
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
