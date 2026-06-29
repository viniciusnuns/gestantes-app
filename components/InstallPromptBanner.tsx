'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'

const DISMISSED_KEY = 'install-prompt-dismissed'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export default function InstallPromptBanner() {
  const [show, setShow] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return
    if (localStorage.getItem(DISMISSED_KEY)) return
    if (isStandalone()) return // já instalado

    const ios = isIOS()
    setIsIos(ios)

    if (ios) {
      // iOS: mostra instrução manual após 8s
      const timer = setTimeout(() => setShow(true), 8000)
      return () => clearTimeout(timer)
    }

    // Android/Chrome: captura o evento de instalação
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 8000)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setShow(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, '1')
    }
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  // iOS — instrução manual
  if (isIos) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-slide-up">
        <div className="bg-white rounded-2xl shadow-xl border border-warm-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📲</span>
              <p className="text-sm font-bold text-text-primary">Adicione à sua tela inicial</p>
            </div>
            <button onClick={dismiss} className="text-text-light hover:text-text-secondary p-1" aria-label="Fechar">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            Acesse o app com um toque, como um app nativo:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</div>
              <span>Toque em <Share size={12} className="inline mx-0.5 text-blue-500" /> <strong>Compartilhar</strong> na barra do Safari</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</div>
              <span>Escolha <Plus size={12} className="inline mx-0.5" /> <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</div>
              <span>Toque em <strong>Adicionar</strong> no canto superior direito</span>
            </div>
          </div>
          <button
            onClick={dismiss}
            className="mt-3 w-full text-xs text-text-light hover:text-text-secondary text-center"
          >
            Agora não
          </button>
        </div>
      </div>
    )
  }

  // Android/Chrome — prompt nativo
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto animate-slide-up">
      <div className="bg-white rounded-2xl shadow-xl border border-warm-200 p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
          📲
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">Adicione à sua tela inicial</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            Acesse o Gestar em Movimento com um toque, como um app nativo.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleInstall}
              className="text-xs font-semibold bg-primary-500 text-white px-3 py-1.5 rounded-lg"
            >
              Instalar
            </button>
            <button onClick={dismiss} className="text-xs text-text-light hover:text-text-secondary">
              Agora não
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-text-light hover:text-text-secondary flex-shrink-0" aria-label="Fechar">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
