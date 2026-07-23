'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, ChevronRight, SkipForward, Share } from 'lucide-react'
import { tourSteps } from '@/lib/tour-steps'
import { partoTourSteps } from '@/lib/parto-tour-steps'
import { getCurrentUser } from '@/lib/customAuth'
import { useActivityStore } from '@/lib/stores/activityStore'

const tourDoneKey = (userId: string) => `app-tour-done-${userId}`
const tourStepKey = (userId: string) => `app-tour-step-${userId}`

function isIOS() {
  return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    (typeof window !== 'undefined' && (window.navigator as any).standalone === true) ||
    (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)
  )
}

export default function AppTour() {
  const router = useRouter()
  const pathname = usePathname()
  const [stepIndex, setStepIndex] = useState<number | null>(null)
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notifRequesting, setNotifRequesting] = useState(false)
  const [installDone, setInstallDone] = useState(false)
  const [notifDone, setNotifDone] = useState(false)
  const skipRef = useRef(false)

  const userProfile = useActivityStore(s => s.userProfile)
  const isPartoOnly = userProfile?.product_type === 'parto'
  const steps = isPartoOnly ? partoTourSteps : tourSteps

  // Captura o evento de instalação do Android/Chrome
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  // Inicia o tour somente após onboarding concluído
  useEffect(() => {
    function tryStart() {
      const user = getCurrentUser()
      if (!user?.id) return
      if (localStorage.getItem(tourDoneKey(user.id))) return
      if (localStorage.getItem('onboarding_completed') !== 'true') return

      const saved = localStorage.getItem(tourStepKey(user.id))
      const idx = saved ? parseInt(saved, 10) : 0
      setStepIndex(idx)
    }

    function handleRestart() {
      setStepIndex(null)
      setVisible(false)
      setTimeout(() => setStepIndex(0), 50)
    }

    tryStart()
    window.addEventListener('gem:user-login', tryStart)
    window.addEventListener('gem:onboarding-completed', tryStart)
    window.addEventListener('gem:restart-tour', handleRestart)
    return () => {
      window.removeEventListener('gem:user-login', tryStart)
      window.removeEventListener('gem:onboarding-completed', tryStart)
      window.removeEventListener('gem:restart-tour', handleRestart)
    }
  }, [])

  // Navega para a rota do passo e mostra o card
  useEffect(() => {
    if (stepIndex === null) return
    const step = steps[stepIndex]
    if (!step) return

    // Auto-skip: passo de instalar se já está em modo standalone
    if (step.type === 'install' && isStandalone() && !skipRef.current) {
      skipRef.current = true
      advanceTo(stepIndex + 1)
      return
    }

    // Auto-skip: passo de notificações se já concedido
    if (step.type === 'notifications' && typeof Notification !== 'undefined' && Notification.permission === 'granted' && !skipRef.current) {
      skipRef.current = true
      advanceTo(stepIndex + 1)
      return
    }

    skipRef.current = false

    if (pathname === step.route) {
      const timer = setTimeout(() => setVisible(true), 400)
      return () => clearTimeout(timer)
    } else {
      const PUBLIC_PAGES = ['/', '/login', '/signup', '/onboarding', '/checkout', '/privacy', '/terms', '/reset-password']
      if (PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))) return
      setVisible(false)
      router.push(step.route)
    }
  }, [stepIndex, pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  function advanceTo(idx: number) {
    if (idx >= steps.length) {
      finish()
      return
    }
    const nextStep = steps[idx]
    setInstallDone(false)
    setNotifDone(false)
    setVisible(false)
    const u = getCurrentUser()
    if (u?.id) localStorage.setItem(tourStepKey(u.id), String(idx))
    setStepIndex(idx)
    if (nextStep.route !== pathname) {
      router.push(nextStep.route)
    }
  }

  const next = () => advanceTo((stepIndex ?? 0) + 1)

  const finish = async () => {
    const u = getCurrentUser()
    if (u?.id) {
      localStorage.setItem(tourDoneKey(u.id), '1')
      localStorage.removeItem(tourStepKey(u.id))
    }
    setVisible(false)
    setStepIndex(null)
    router.push('/home')

    try {
      const { supabase } = await import('@/lib/supabase')
      const user = getCurrentUser()
      if (user?.id) {
        await supabase
          .from('users')
          .update({ tour_completed_at: new Date().toISOString() })
          .eq('id', user.id)
      }
    } catch { /* não bloqueia o fluxo */ }
  }

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      setDeferredPrompt(null)
      if (outcome === 'accepted') {
        try {
          const { supabase } = await import('@/lib/supabase')
          const user = getCurrentUser()
          if (user?.id) {
            await supabase
              .from('users')
              .update({ pwa_installed_at: new Date().toISOString() })
              .eq('id', user.id)
          }
        } catch { /* ignora */ }
      }
    }
    setInstallDone(true)
    setTimeout(() => next(), 800)
  }

  const handleNotifications = async () => {
    if (!('Notification' in window)) { next(); return }
    setNotifRequesting(true)
    try {
      const permission = await Notification.requestPermission()
      setNotifRequesting(false)
      if (permission === 'granted') {
        void (async () => {
          try {
            const OneSignal = (window as any).OneSignal
            if (OneSignal?.User?.PushSubscription?.optIn) {
              await OneSignal.User.PushSubscription.optIn()
            }
            const { supabase } = await import('@/lib/supabase')
            const user = getCurrentUser()
            if (user?.id) {
              await supabase
                .from('users')
                .update({ push_subscribed: true, push_subscribed_at: new Date().toISOString() })
                .eq('id', user.id)
            }
          } catch { /* silencioso */ }
        })()
        setNotifDone(true)
        setTimeout(() => next(), 800)
      } else {
        next()
      }
    } catch {
      setNotifRequesting(false)
      next()
    }
  }

  if (stepIndex === null || !visible) return null

  const step = steps[stepIndex]
  if (!step || pathname !== step.route) return null

  const isLast = stepIndex === steps.length - 1
  const progress = stepIndex + 1
  const total = steps.length
  const ios = isIOS()
  const standalone = isStandalone()

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 pointer-events-none" />

      <div className="fixed bottom-0 left-0 right-0 z-[70] px-4 pb-8 pt-2 animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg mx-auto">

          {/* Barra de progresso */}
          <div className="h-1 bg-warm-100">
            <div
              className="h-1 transition-all duration-500"
              style={{
                width: `${(progress / total) * 100}%`,
                background: isPartoOnly ? 'linear-gradient(90deg, #D4A5A5, #C4A8D9)' : undefined,
              }}
              {...(!isPartoOnly ? { className: 'h-1 bg-primary-400 transition-all duration-500' } : {})}
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

            {/* Hint */}
            {step.hint && (
              <div className="bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 mb-4">
                <p className="text-xs text-primary-600 font-medium">{step.hint}</p>
              </div>
            )}

            {/* Passo especial: instalar */}
            {step.type === 'install' && (
              <div className="mb-4">
                {installDone ? (
                  <p className="text-sm font-semibold text-emerald-600 text-center">✅ Instalado!</p>
                ) : ios && !standalone ? (
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                      <span>Toque em <Share size={11} className="inline mx-0.5 text-blue-500" /> <strong>Compartilhar</strong> no Safari</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                      <span>Escolha <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                      <span>Toque em <strong>Adicionar</strong></span>
                    </div>
                  </div>
                ) : deferredPrompt ? (
                  <button
                    onClick={handleInstall}
                    className="w-full bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
                  >
                    📲 Instalar app
                  </button>
                ) : (
                  <p className="text-xs text-text-secondary text-center">App já disponível na sua tela inicial.</p>
                )}
              </div>
            )}

            {/* Passo especial: notificações */}
            {step.type === 'notifications' && !notifDone && (
              <button
                onClick={handleNotifications}
                disabled={notifRequesting}
                className="w-full mb-4 bg-primary-400 hover:bg-primary-500 disabled:opacity-60 text-white text-sm font-semibold py-3 rounded-xl transition-colors"
              >
                {notifRequesting ? 'Aguarde...' : '🔔 Permitir notificações'}
              </button>
            )}
            {step.type === 'notifications' && notifDone && (
              <p className="text-sm font-semibold text-emerald-600 text-center mb-4">✅ Notificações ativadas!</p>
            )}

            {/* Passo especial: upgrade (parto) */}
            {step.type === 'upgrade' && (
              <a
                href="/upgrade"
                className="block w-full text-center text-sm font-black text-white py-3 rounded-xl mb-4 transition-all"
                style={{ background: 'linear-gradient(135deg, #7B5A94 0%, #C4A8D9 100%)' }}
                onClick={finish}
              >
                Conhecer o app completo →
              </a>
            )}

            {/* Botões de navegação */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={finish}
                className="flex items-center gap-1 text-xs text-text-light hover:text-text-secondary"
              >
                <SkipForward size={13} />
                Pular tour
              </button>

              {step.type === 'install' && ios && !standalone ? (
                <div className="flex gap-2">
                  <button onClick={next} className="text-xs text-text-light hover:text-text-secondary">
                    Agora não
                  </button>
                  <button
                    onClick={() => { setInstallDone(true); setTimeout(() => next(), 600) }}
                    className="flex items-center gap-2 bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Já adicionei ✓
                  </button>
                </div>
              ) : step.type === 'install' || step.type === 'notifications' ? (
                <button
                  onClick={next}
                  className="text-xs font-medium text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl border border-warm-200"
                >
                  {installDone || notifDone ? 'Continuar →' : 'Agora não'}
                </button>
              ) : step.type === 'upgrade' ? (
                <button
                  onClick={finish}
                  className="text-xs font-medium text-text-secondary hover:text-text-primary px-4 py-2.5 rounded-xl border border-warm-200"
                >
                  Agora não
                </button>
              ) : (
                <button
                  onClick={isLast ? finish : next}
                  className="flex items-center gap-2 bg-primary-400 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  {isLast ? 'Começar agora!' : 'Próximo'}
                  {!isLast && <ChevronRight size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
