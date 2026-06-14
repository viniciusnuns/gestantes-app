'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Props {
  userId: string
  userName: string
  onDismiss: () => void
}

export default function NPSCard({ userId, userName, onDismiss }: Props) {
  const [score, setScore] = useState<number | null>(null)
  const [testimonial, setTestimonial] = useState('')
  const [step, setStep] = useState<'score' | 'testimonial' | 'done'>('score')
  const [saving, setSaving] = useState(false)

  const handleScore = async (n: number) => {
    setScore(n)
    if (n >= 9) {
      setStep('testimonial')
    } else {
      // Salva a nota sem depoimento e encerra
      await save(n, null)
    }
  }

  const save = async (n: number, text: string | null) => {
    setSaving(true)
    await supabase.from('user_testimonials').insert({
      user_id: userId,
      type: 'nps',
      score: n,
      testimonial: text,
    })
    setSaving(false)
    setStep('done')
    setTimeout(onDismiss, 2000)
  }

  const handleSubmit = async () => {
    if (!testimonial.trim() || score === null) return
    await save(score, testimonial.trim())
  }

  if (step === 'done') return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100 text-center">
      <p className="text-3xl mb-2">💜</p>
      <p className="text-sm font-bold text-text-primary">Obrigada, {userName}!</p>
      <p className="text-xs text-text-secondary mt-1">Seu feedback foi salvo e nos ajuda muito.</p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
      <p className="text-sm font-bold text-text-primary mb-1">
        {step === 'score' ? '🌟 Quanto você recomendaria o app para uma amiga?' : '🎉 Pode escrever um comentário?'}
      </p>

      {step === 'score' && (
        <>
          <p className="text-xs text-text-secondary mb-4">De 0 (nada provável) a 10 (com certeza)</p>
          <div className="grid grid-cols-11 gap-1 mb-2">
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleScore(i)}
                disabled={saving}
                className={cn(
                  'h-9 rounded-lg text-xs font-bold transition-all disabled:opacity-50',
                  score === i
                    ? 'bg-primary-500 text-white scale-110'
                    : 'bg-warm-100 text-text-secondary hover:bg-primary-100 hover:text-primary-600'
                )}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-text-light mt-1 mb-3">
            <span>Não recomendaria</span>
            <span>Com certeza</span>
          </div>
          <button onClick={onDismiss} className="w-full text-xs text-text-light py-1">
            Agora não
          </button>
        </>
      )}

      {step === 'testimonial' && (
        <>
          <p className="text-xs text-text-secondary mb-3">
            Seu depoimento pode inspirar outras mamães a começar 💜
          </p>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            placeholder="Ex: O app me ajudou muito, os exercícios são práticos e seguros..."
            className="w-full border border-warm-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-primary-300 mb-3"
          />
          <button
            onClick={handleSubmit}
            disabled={!testimonial.trim() || saving}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 gradient-primary"
          >
            {saving ? 'Salvando...' : 'Enviar depoimento'}
          </button>
          <button onClick={onDismiss} className="w-full py-1.5 text-xs text-text-secondary mt-1">
            Pular
          </button>
        </>
      )}
    </div>
  )
}
