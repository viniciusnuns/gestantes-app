'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'

type State = 'idle' | 'visible' | 'requesting' | 'denied' | 'unsupported'

export default function PushPromptBanner() {
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return
    if (!('Notification' in window)) {
      setState('unsupported')
      return
    }
    if (Notification.permission === 'granted') return
    if (Notification.permission === 'denied') {
      setState('denied')
      return
    }
    const timer = setTimeout(() => setState('visible'), 5000)
    return () => clearTimeout(timer)
  }, [])

  const handleEnable = async () => {
    setState('requesting')
    try {
      let result: NotificationPermission = 'default'
      const OneSignal = (window as any).OneSignal
      if (OneSignal?.Notifications?.requestPermission) {
        result = await OneSignal.Notifications.requestPermission()
      } else if ('Notification' in window) {
        result = await Notification.requestPermission()
      } else {
        setState('unsupported')
        return
      }
      if (result === 'granted') {
        setState('idle')
      } else {
        setState('denied')
      }
    } catch {
      setState('unsupported')
    }
  }

  if (state === 'idle') return null

  if (state === 'unsupported') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-4 text-sm text-amber-800">
          Seu navegador não suporta notificações push neste momento.
          <button onClick={() => setState('idle')} className="ml-2 underline">Fechar</button>
        </div>
      </div>
    )
  }

  if (state === 'denied') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-4">
          <p className="text-sm text-amber-800 font-semibold">Notificações bloqueadas</p>
          <p className="text-xs text-amber-700 mt-1">
            Vá em Safari → Preferências → Sites → Notificações e mude para "Permitir".
          </p>
          <button onClick={() => setState('idle')} className="mt-2 text-xs underline text-amber-700">Fechar</button>
        </div>
      </div>
    )
  }

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
            disabled={state === 'requesting'}
            className="mt-2 text-xs font-semibold text-primary-500 hover:text-primary-600 disabled:opacity-50"
          >
            {state === 'requesting' ? 'Aguarde...' : 'Ativar notificações'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="text-text-light hover:text-text-secondary flex-shrink-0"
          aria-label="Fechar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
