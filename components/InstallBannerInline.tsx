'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus, Download } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'

const DISMISSED_KEY = 'install-banner-dismissed-at'
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000 // 24 horas

function wasDismissedRecently() {
  const ts = localStorage.getItem(DISMISSED_KEY)
  if (!ts) return false
  return Date.now() - Number(ts) < DISMISS_TTL_MS
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export default function InstallBannerInline() {
  const [show, setShow] = useState(false)
  const [ios, setIos] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return
    if (isStandalone()) return
    if (wasDismissedRecently()) return

    const iosDevice = isIOS()
    setIos(iosDevice)

    if (iosDevice) {
      setShow(true)
      return
    }

    // Mostra imediatamente no desktop/Android (botão aparece; prompt nativo capturado se disponível)
    setShow(true)

    // Captura evento nativo do Chrome/Android para instalar via prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setShow(false)
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    setShow(false)
    setDeferredPrompt(null)
  }

  if (!show) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Fechar"
      >
        <X size={15} />
      </button>

      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0 shadow-sm text-lg">
        📱
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-semibold text-gray-800 mb-0.5">
          Rápido e fácil — seu app em 1 toque
        </p>

        {/* iOS */}
        {ios && (
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[9px] flex-shrink-0">1</span>
              <span>Toque em <Share size={10} className="inline mx-0.5 text-blue-500" /> <strong>Compartilhar</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[9px] flex-shrink-0">2</span>
              <span>Toque em <Plus size={10} className="inline mx-0.5" /> <strong>Adicionar à Tela de Início</strong></span>
            </div>
          </div>
        )}

        {/* Android */}
        {!ios && (
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-transform"
            >
              <Download size={12} />
              Instalar app
            </button>
            <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Agora não
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
