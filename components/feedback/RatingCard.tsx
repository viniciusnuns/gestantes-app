'use client'

import { useState } from 'react'
import { Star, X } from 'lucide-react'

const WHATSAPP_NUMBER = '5548988027824'

interface Props {
  userName: string
  onDismiss: () => void
}

export default function RatingCard({ userName, onDismiss }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [testimonial, setTestimonial] = useState('')
  const [step, setStep] = useState<'stars' | 'testimonial' | 'support' | 'done'>('stars')

  const handleRate = (n: number) => {
    setRating(n)
    if (n >= 4) {
      setStep('testimonial')
    } else {
      setStep('support')
    }
  }

  const handleSubmitTestimonial = () => {
    const text = encodeURIComponent(`⭐ Depoimento de ${userName}:\n\n"${testimonial}"`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setStep('done')
    setTimeout(onDismiss, 1500)
  }

  const handleSupport = () => {
    const text = encodeURIComponent(`Olá! Sou ${userName}, usuária do Gestar em Movimento. Gostaria de compartilhar meu feedback...`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank')
    setStep('done')
    setTimeout(onDismiss, 1500)
  }

  if (step === 'done') return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100 text-center">
      <p className="text-3xl mb-2">💜</p>
      <p className="text-sm font-semibold text-text-primary">Obrigada pelo seu feedback!</p>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100">
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-bold text-text-primary">
          {step === 'stars' && '💜 Está gostando do app?'}
          {step === 'testimonial' && '🎉 Pode deixar um comentário?'}
          {step === 'support' && 'Nos conta o que podemos melhorar'}
        </p>
        <button onClick={onDismiss} className="p-1 text-text-light hover:text-text-secondary flex-shrink-0">
          <X size={15} />
        </button>
      </div>

      {step === 'stars' && (
        <>
          <p className="text-xs text-text-secondary mb-4">
            Sua opinião ajuda outras mamães a conhecer o app
          </p>
          <div className="flex gap-2 justify-center mb-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleRate(n)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={34}
                  className={n <= (hover || rating) ? 'text-accent-400' : 'text-warm-200'}
                  fill={n <= (hover || rating) ? 'currentColor' : 'none'}
                />
              </button>
            ))}
          </div>
          <button onClick={onDismiss} className="w-full text-xs text-text-light py-1">
            Agora não
          </button>
        </>
      )}

      {step === 'testimonial' && (
        <>
          <p className="text-xs text-text-secondary mb-3">
            Seu depoimento pode inspirar outras mamães 💜
          </p>
          <textarea
            value={testimonial}
            onChange={(e) => setTestimonial(e.target.value)}
            placeholder="Ex: Os exercícios são práticos e me sinto muito mais preparada..."
            className="w-full border border-warm-200 rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:border-primary-300 mb-3"
          />
          <button
            onClick={handleSubmitTestimonial}
            disabled={!testimonial.trim()}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 gradient-primary"
          >
            Enviar depoimento
          </button>
          <button onClick={onDismiss} className="w-full py-1.5 text-xs text-text-secondary mt-1">
            Pular
          </button>
        </>
      )}

      {step === 'support' && (
        <>
          <p className="text-xs text-text-secondary mb-3">
            Queremos melhorar! Conta pra gente o que pode ser melhor 💬
          </p>
          <button
            onClick={handleSupport}
            className="w-full py-2.5 rounded-xl font-bold text-sm text-white gradient-primary mb-1"
          >
            Falar com suporte
          </button>
          <button onClick={onDismiss} className="w-full py-1.5 text-xs text-text-secondary">
            Agora não
          </button>
        </>
      )}
    </div>
  )
}
