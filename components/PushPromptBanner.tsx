'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'

export default function PushPromptBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return

    // Só mostra se ainda não pediu permissão
    if (!('Notification' in window)) return
    if (Notification.permission !== 'default') return

    // Mostra após 5s
    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnable = async () => {
    setVisible(false)
    try {
      const OneSignal = (window as any).OneSignal
      if (OneSignal?.Notifications) {
        await OneSignal.Notifications.requestPermission()
      } else {
        await Notification.requestPermission()
      }
    } catch {
      // Silencioso se não suportado
    }
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-warm-200 p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Bell size={18} className="text-primary-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Ativar lembretes 🌸</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Receba avisos dos seus exercícios e conquistas.
          </p>
          <button
            type="button"
            onClick={handleEnable}
            className="mt-2 text-xs font-semibold text-primary-500 hover:text-primary-600"
          >
            Ativar notificações
          </button>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="text-text-light hover:text-text-secondary flex-shrink-0"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
