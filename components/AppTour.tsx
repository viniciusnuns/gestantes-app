'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ChevronRight, SkipForward } from 'lucide-react'
import { tourSteps } from '@/lib/tour-steps'
import { getCurrentUser } from '@/lib/customAuth'

const TOUR_DONE_KEY = 'app-tour-done'
const TOUR_STEP_KEY = 'app-tour-step'

export default function AppTour() {
  const router = useRouter()
  const pathname = usePathname()
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function tryStart() {
      const user = getCurrentUser()
      if (!user?.id) return
      if (localStorage.getItem(TOUR_DONE_KEY)) return

      const saved = localStorage.getItem(TOUR_STEP_KEY)
      const idx = saved ? parseInt(saved, 10) : 0
      setStepIndex(idx)
    }

    tryStart()
    window.addEventListener('gem:user-login', tryStart)
    return () => window.removeEventListener('gem:user-login', tryStart)
  }, [])

  useEffect(() => {
    if (stepIndex === null) return
    const step = tourSteps[stepIndex]
    if (!step) return

    if (pathname === step.route) {
      // Já está na rota certa — mostra o card
      const timer = setTimeout(() => setVisible(true), 400)
      return () => clearTimeout(timer)
    } else {
      // Navega para a rota do passo
      setVisible(false)
      router.push(step.route)
    }
  }, [stepIndex, pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    const nextIndex = (stepIndex ?? 0) + 1
    if (nextIndex >= tourSteps.length) {
      finish()
      return
    }
    const nextStep = tourSteps[nextIndex]
    setVisible(false)
    localStorage.setItem(TOUR_STEP_KEY, String(nextIndex))
    setStepIndex(nextIndex)
    if (nextStep.route !== pathname) {
      router.push(nextStep.route)
    }
  }

  const finish = () => {
    localStorage.setItem(TOUR_DONE_KEY, '1')
    localStorage.removeItem(TOUR_STEP_KEY)
    setVisible(false)
    setStepIndex(null)
    router.push('/home')
  }

  if (stepIndex === null || !visible) return null

  const step = tourSteps[stepIndex]
  if (!step || pathname !== step.route) return null

  const isLast = stepIndex === tourSteps.length - 1
  const progress = stepIndex + 1
  const total = tourSteps.length

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 z-[60] bg-black/50 pointer-events-none" />

      {/* Card do tour */}
      <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-8 pt-2 animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg mx-auto">

          {/* Barra de progresso */}
          <div className="h-1 bg-warm-100">
            <div
              className="h-1 bg-primary-400 transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{step.emoji}</span>
                <div>
                  <p className="text-[11px] text-text-light font-medium">
                    Passo {progress} de {total}
                  </p>
                  <h3 className="text-base font-bold text-text-primary leading-tight">
                    {step.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={finish}
                className="text-text-light hover:text-text-secondary p-1 flex-shrink-0"
                aria-label="Pular tour"
              >
                <X size={18} />
              </button>
            </div>

            {/* Descrição */}
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mb-4">
              {step.description}
            </p>

            {/* Hint (onde olhar) */}
            {step.hint && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-primary-600 font-medium">{step.hint}</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="flex items-center gap-1 text-xs text-text-light hover:text-text-secondary"
              >
                <SkipForward size={13} />
                Pular tour
              </button>
              <button
                onClick={next}
                className="flex items-center gap-2 bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {isLast ? 'Começar agora!' : 'Próximo'}
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
