'use client'

import { useSearchParams } from 'next/navigation'

export default function CancelledBanner() {
  const params = useSearchParams()
  if (params.get('motivo') !== 'acesso-cancelado') return null

  return (
    <div className="w-full mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
      Seu acesso foi cancelado após o estorno. Para reativar, entre em contato com o suporte.
    </div>
  )
}
