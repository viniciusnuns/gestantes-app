'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'É seguro para mim e para o bebê?',
    a: 'Sim. Todos os exercícios foram criados e validados pela Dra. Fabiana Pinheiro, fisioterapeuta pélvica com mais de 10 anos de experiência em saúde da mulher. O programa é baseado em evidências clínicas e desenvolvido especificamente para o corpo da gestante — com adaptações para cada trimestre e foco total na segurança de você e do bebê.',
  },
  {
    q: 'Funciona em qualquer trimestre?',
    a: 'Sim, do 1º ao 3º trimestre. O app identifica sua fase e entrega os exercícios certos para o momento da sua gestação. Se você está chegando agora no 2º ou 3º trimestre, ainda vale muito começar — cada semana de preparo faz diferença para o seu corpo e para o parto.',
  },
  {
    q: 'Nunca fiz exercícios. Posso começar?',
    a: 'Pode, e o programa foi pensado exatamente para você. Não é preciso ter nenhuma experiência anterior. Os vídeos guiam cada movimento com explicações claras, no seu ritmo. Muitas mães que nunca se exercitaram começaram no Gestar em Movimento e mantiveram a rotina por toda a gestação.',
  },
  {
    q: 'Preciso de academia ou equipamentos?',
    a: 'Não. A grande maioria dos exercícios usa apenas o peso do próprio corpo. Alguns vídeos utilizam bola de pilates ou faixa elástica, mas todos têm versão alternativa sem nenhum equipamento. Você pratica de casa, no horário que quiser.',
  },
  {
    q: 'O programa ajuda a aliviar dores e preparar para o parto?',
    a: 'Sim, nos dois. Os exercícios trabalham diretamente o alívio de dores lombares, pélvicas e no quadril — queixas muito comuns na gestação. E o app inclui 10 aulas completas de preparação para o parto, cobrindo respiração, posições, fases do trabalho de parto e como seu corpo vai responder. Você chega no grande dia muito mais confiante.',
  },
  {
    q: 'Quanto tempo preciso por dia?',
    a: 'Apenas 15 minutos. O app já seleciona os exercícios do dia para você — não precisa planejar nada. É só abrir, seguir os vídeos e pronto. Simples o suficiente para encaixar em qualquer rotina, mesmo nos dias mais cansativos da gestação.',
  },
]

export default function FAQ() {
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
