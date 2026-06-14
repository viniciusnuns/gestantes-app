'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const WHATSAPP_NUMBER = '5548988027824'

interface Props {
  userName: string
  onClose: () => void
}

export default function NPSModal({ userName, onClose }: Props) {
  const [score, setScore] = useState<number | null>(null)
  const [testimonial, setTestimonial] = useState('')
  const [step, setStep] = useState<'score' | 'testimonial' | 'done'>('score')

  const handleScore = (n: number) => {
    setScore(n)
    if (n >= 9) {
      setStep('testimonial')
    } else if (n <= 6) {
      const text = encodeURIComponent(`Olá! Sou ${userName}, usuária do Gestar em Movimento. Dei nota ${n} e gostaria de compartilhar minha experiência...`)
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
      setStep('done')
      setTimeout(onClose, 1500)
    } else {
      setStep('done')
      setTimeout(onClose, 1500)
    }
  }

  const handleSubmit = () => {
    if (!testimonial.trim()) return
    const text = encodeURIComponent(`⭐ Depoimento de ${userName}:\n\n"${testimonial}"`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setStep('done')
    setTimeout(onClose, 1500)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.55)' }}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-[11px] text-text-secondary uppercase tracking-widest mb-1">
              Sua opinião importa
            </p>
            <h2 className="text-base font-bold text-text-primary leading-snug">
              {step === 'score' && 'Quanto você recomendaria o app para uma amiga?'}
              {step === 'testimonial' && 'Que ótimo! 🎉 Pode escrever um comentário?'}
              {step === 'done' && 'Muito obrigada! 💜'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-text-light hover:text-text-secondary ml-3 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        {step === 'score' && (
          <>
            <p className="text-xs text-text-secondary mb-4">De 0 (nada provável) a 10 (com certeza)</p>
            <div className="grid grid-cols-11 gap-1 mb-2">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handleScore(i)}
                  className={cn(
                    'h-9 rounded-lg text-xs font-bold transition-all',
                    score === i
                      ? 'bg-primary-500 text-white scale-110'
                      : 'bg-warm-100 text-text-secondary hover:bg-primary-100 hover:text-primary-600'
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-text-light mt-1">
              <span>Não recomendaria</span>
              <span>Com certeza</span>
            </div>
          </>
        )}

        {step === 'testimonial' && (
          <>
            <textarea
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Ex: O app me ajudou muito, os exercícios são práticos e seguros..."
              className="w-full border border-warm-200 rounded-xl p-3 text-sm text-text-primary resize-none h-28 focus:outline-none focus:border-primary-300 mb-2"
            />
            <p className="text-[11px] text-text-secondary mb-4">
              Seu depoimento pode ajudar outras mamães a conhecer o app 💜
            </p>
            <button
              onClick={handleSubmit}
              disabled={!testimonial.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm text-white disabled:opacity-40 transition-all gradient-primary"
            >
              Enviar depoimento
            </button>
            <button onClick={onClose} className="w-full py-2 text-sm text-text-secondary mt-1">
              Pular
            </button>
          </>
        )}

        {step === 'done' && (
          <div className="text-center py-4">
            <p className="text-4xl mb-3">💜</p>
            <p className="text-text-secondary text-sm">Sua opinião faz o app melhor a cada dia!</p>
          </div>
        )}
      </div>
    </div>
  )
}
