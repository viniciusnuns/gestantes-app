'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Funciona para parto normal e cesárea?',
    a: 'Sim, as aulas cobrem os dois. Você vai aprender as fases do trabalho de parto vaginal — incluindo posições, respiração e técnicas de alívio da dor — e também vai entender o processo da cesárea: como funciona, o que esperar e como se preparar. Nenhuma gestante fica sem resposta.',
  },
  {
    q: 'Posso começar no 3º trimestre?',
    a: 'Pode e deve. O conteúdo foi pensado para ser aproveitado em qualquer momento da gestação. Se você está chegando agora no final, ainda dá tempo de absorver tudo o que precisa saber. Muitas mamães assistem as aulas nas últimas semanas e chegam ao parto muito mais confiantes.',
  },
  {
    q: 'As aulas ficam disponíveis por quanto tempo?',
    a: 'Você tem acesso imediato e pode assistir quantas vezes quiser, no seu ritmo. As aulas ficam disponíveis dentro do app — assista antes do parto, revise durante o trabalho de parto se quiser, ou compartilhe com o seu acompanhante.',
  },
  {
    q: 'O acompanhante também pode assistir?',
    a: 'Sim! Uma das aulas é dedicada justamente ao papel do acompanhante no trabalho de parto. Assistir juntos faz uma diferença enorme: o acompanhante sabe exatamente como ajudar, quando agir e o que esperar em cada fase.',
  },
  {
    q: 'Precisa de equipamentos ou materiais?',
    a: 'Não. As aulas são teóricas e práticas, mas não exigem nenhum equipamento. Você aprende pelo celular, tablet ou computador — onde e quando quiser.',
  },
  {
    q: 'Tem garantia?',
    a: 'Sim. 7 dias de garantia incondicional. Se por qualquer motivo você não ficar satisfeita, devolvemos 100% do valor. Sem burocracia, sem perguntas.',
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
