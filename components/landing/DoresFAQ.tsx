'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'Os exercícios são seguros em qualquer trimestre?',
    a: 'Sim. Todas as sequências foram desenvolvidas pela Dra. Fabiana Pinheiro especificamente para gestantes, com indicação clara do trimestre em cada vídeo. Você nunca vai ficar em dúvida sobre o que é seguro para a sua fase.',
  },
  {
    q: 'Vou sentir alívio logo nas primeiras sessões?',
    a: 'A maioria das gestantes relata alívio já na primeira sessão completa. Os exercícios trabalham as estruturas que realmente causam a dor — e não apenas mascaram o sintoma. O alívio tende a ser progressivo a cada sessão.',
  },
  {
    q: 'Preciso de algum equipamento especial?',
    a: 'Não. A maioria dos exercícios pode ser feita sem equipamentos. Em algumas sequências, um colchonete ou travesseiro ajuda no conforto — mas nada que você não tenha em casa.',
  },
  {
    q: 'Tenho dores muito fortes. Esse programa ainda é indicado?',
    a: 'As sequências foram pensadas para as dores comuns da gestação — lombar, pelve, pescoço e baixo ventre. Se você sente uma dor muito intensa, repentina ou diferente do habitual, sempre consulte seu médico antes de iniciar qualquer exercício. O programa não substitui atendimento presencial para casos mais complexos.',
  },
  {
    q: 'Posso fazer mesmo nos dias em que estou com mais dor?',
    a: 'Sim, mas sempre respeitando os limites do seu corpo. Os exercícios são suaves e progressivos. Se sentir desconforto além do esperado em algum movimento, pare e descanse. A Dra. Fabiana orienta sobre isso em cada sequência.',
  },
  {
    q: 'Como acesso após a compra?',
    a: 'Após o pagamento, você recebe os dados de acesso por e-mail. O acesso é pelo app Gestar em Movimento — disponível no celular, tablet e computador. Você pode assistir quando e onde quiser.',
  },
  {
    q: 'E se eu mudar de ideia? Tem garantia?',
    a: 'Tem. 7 dias de garantia incondicional. Se por qualquer motivo você não ficar satisfeita, devolvemos 100% do valor. Sem burocracia, sem perguntas.',
  },
]

export default function DoresFAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-sm">
          <button
            className="w-full flex items-center justify-between p-5 text-left hover:bg-white/90 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold pr-4" style={{ color: '#2E1B4E' }}>{item.q}</span>
            <ChevronDown
              size={20}
              className={`flex-shrink-0 transition-transform duration-200 ${open === i ? 'rotate-180' : ''}`}
              style={{ color: '#7B5A94' }}
            />
          </button>
          {open === i && (
            <div className="px-5 pb-5 bg-white/90">
              <p className="leading-relaxed" style={{ color: '#6B5B8B' }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
