'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'

type State = 'idle' | 'visible' | 'requesting' | 'denied' | 'unsupported' | 'ios-install'

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isStandalone() {
  return (
    (window.navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export default function PushPromptBanner() {
  const [state, setState] = useState<State>('idle')

  useEffect(() => {
    const user = getCurrentUser()
    if (!user?.id) return

    // iOS Safari no navegador: notificações só funcionam como PWA instalada
    if (isIOS() && !isStandalone()) {
      if (localStorage.getItem('push-ios-dismissed')) return
      const timer = setTimeout(() => setState('ios-install'), 5000)
      return () => clearTimeout(timer)
    }

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

  const markSubscribed = async () => {
    const user = getCurrentUser()
    if (!user?.id) return
    await supabase
      .from('users')
      .update({ push_subscribed: true, push_subscribed_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  const handleEnable = async () => {
    setState('requesting')
    try {
      const OneSignal = (window as any).OneSignal

      if (OneSignal?.User?.PushSubscription?.optIn) {
        await OneSignal.User.PushSubscription.optIn()
        const subscribed = OneSignal.User.PushSubscription.optedIn
        if (subscribed) {
          await markSubscribed()
          setState('idle')
        } else {
          setState('denied')
        }
      } else if ('Notification' in window) {
        const result = await Notification.requestPermission()
        if (result === 'granted') {
          await markSubscribed()
          setState('idle')
        } else {
          setState('denied')
        }
      } else {
        setState('unsupported')
      }
    } catch {
      setState('unsupported')
    }
  }

  if (state === 'idle') return null

  // iOS Safari — instrução para adicionar à tela inicial
  if (state === 'ios-install') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-warm-200 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-lg">
            🔔
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Ative os lembretes 🌸</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              No Safari, toque em{' '}
              <span className="font-semibold">compartilhar</span>{' '}
              <span className="text-base">⎙</span>{' '}
              e escolha{' '}
              <span className="font-semibold">&ldquo;Adicionar à Tela de Início&rdquo;</span>.
              Depois abra o app pela tela inicial para ativar notificações.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { localStorage.setItem('push-ios-dismissed', '1'); setState('idle') }}
            className="text-text-light hover:text-text-secondary flex-shrink-0"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (state === 'unsupported') {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-lg p-4 text-sm text-amber-800 flex items-center justify-between gap-2">
          <span>Seu navegador não suporta notificações push neste momento.</span>
          <button onClick={() => setState('idle')} className="underline whitespace-nowrap">Fechar</button>
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
            Vá em Safari → Preferências → Sites → Notificações e mude para &ldquo;Permitir&rdquo;.
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
