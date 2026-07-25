'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'As aulas servem mesmo se eu acabar fazendo uma cesárea?',
    a: 'Sim, as aulas cobrem os dois. Você vai aprender as fases do trabalho de parto vaginal — incluindo posições e técnicas de alívio da dor — e também vai entender o processo da cesárea: como funciona, o que esperar e como se preparar. Nenhuma gestante fica sem resposta.',
  },
  {
    q: 'Estou no final da gestação. Ainda dá tempo de me preparar?',
    a: 'Dá sim. O conteúdo foi pensado para ser aproveitado em qualquer momento da gestação. Se você está chegando agora no final, ainda dá tempo de absorver tudo o que precisa saber. Muitas mamães assistem as aulas nas últimas semanas e chegam ao parto muito mais confiantes.',
  },
  {
    q: 'Vou aprender técnicas para aliviar a dor das contrações?',
    a: 'Sim. As aulas ensinam técnicas práticas de respiração, movimentos e posições que ajudam a lidar com as contrações em cada fase do trabalho de parto. Você aprende o que fazer com o seu corpo — e chega preparada para usar no momento certo.',
  },
  {
    q: 'Nunca tive um filho. Essas aulas são para mim?',
    a: 'São exatamente para você. As aulas foram criadas para gestantes que querem entender o que vai acontecer no parto — sem precisar de conhecimento prévio. A Dra. Fabiana explica tudo do zero, com linguagem clara e direta.',
  },
  {
    q: 'Meu acompanhante pode assistir comigo?',
    a: 'Sim! Uma das aulas é dedicada justamente ao papel do acompanhante no trabalho de parto. Assistir juntos faz uma diferença enorme: ele sabe exatamente como ajudar, quando agir e o que esperar em cada fase.',
  },
  {
    q: 'E se eu mudar de ideia? Tem garantia?',
    a: 'Tem. 7 dias de garantia incondicional. Se por qualquer motivo você não ficar satisfeita, devolvemos 100% do valor. Sem burocracia, sem perguntas.',
  },
]

export default function PartoFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-sm">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/90 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-[#5C3A6B] pr-4">{item.q}</span>
            <ChevronDown
              size={20}
              className={`text-[#B07070] flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5 bg-white/90">
              <p className="text-[#8B7B8B] leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
