'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Lock, CheckCircle, BookMarked, ShoppingCart } from 'lucide-react'
import { getCurrentUser } from '@/lib/customAuth'
import { supabase } from '@/lib/supabase'
import BottomNav from '@/components/nav/BottomNav'

const EBOOK_GESTACAO = {
  id: 'gestacao',
  title: 'Gestante Bem Informada',
  subtitle: 'Gestação',
  description: 'O guia completo para você entender tudo que acontece com o seu corpo durante a gravidez — da anatomia ao parto.',
  author: 'Dra. Fabiana Pinheiro da Silva',
  color: 'from-amber-100 to-yellow-200',
  textColor: 'text-amber-900',
  chapters: [
    'Anatomia feminina e a pelve',
    'Hormônios na gestação',
    'Pré-natal: o que esperar em cada consulta',
    'Vacinas e viagens durante a gestação',
    'Complicações mais comuns (diabetes gestacional, pré-eclâmpsia, placenta prévia e mais)',
    'Exercícios seguros no 1º trimestre',
    'Exercícios seguros no 2º trimestre',
    'Exercícios seguros no 3º trimestre',
    'Como aliviar dores lombares e pélvicas',
    'Massagem perineal e preparação para o parto',
    'Varizes e hemorroidas na gestação',
  ],
}

const EBOOK_PARTO = {
  id: 'parto',
  title: 'Gestante Bem Informada',
  subtitle: 'Parto',
  description: 'Tudo o que você precisa saber para chegar ao parto confiante, preparada e com menos medo.',
  author: 'Dra. Fabiana Pinheiro da Silva',
  color: 'from-rose-100 to-pink-200',
  textColor: 'text-rose-900',
  chapters: [
    'Mala de maternidade: o que levar',
    'Parto humanizado: seus direitos',
    'Como fazer seu plano de parto',
    'Parto normal: como funciona',
    'Indução do trabalho de parto',
    'Analgesia e opções de alívio da dor',
    'Parto na água',
    'Fases do trabalho de parto',
    'Período expulsivo',
    'A importância do acompanhante',
    'Parto cesárea: o que esperar',
  ],
}

export default function MeusEbooksPage() {
  const router = useRouter()
  const [hasGestacao, setHasGestacao] = useState<boolean | null>(null)
  const [hasParto, setHasParto] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [pdfTitle, setPdfTitle] = useState('')

  useEffect(() => {
    async function load() {
      const user = getCurrentUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data } = await supabase
        .from('users')
        .select('has_ebook_gestacao, has_ebook_parto, product_type')
        .eq('id', user.id)
        .single()

      setHasGestacao(data?.has_ebook_gestacao ?? false)
      setHasParto(data?.has_ebook_parto ?? false)
      setLoading(false)
    }
    load()
  }, [router])

  function openEbook(ebookId: string, title: string) {
    if (!userId) return
    setPdfTitle(title)
    window.open(`/api/ebooks/signed-url?ebook=${ebookId}&userId=${userId}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center pb-24">
        <p className="text-text-secondary">Carregando...</p>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-warm-50 pb-28">
        <header className="gradient-primary text-white px-5 pt-8 pb-10 rounded-b-3xl shadow-md">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <ArrowLeft size={22} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Meus Ebooks</h1>
              <p className="text-sm opacity-80">Criados pela Dra. Fabiana para você</p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-5 -mt-5 space-y-5">
          <EbookCard
            ebook={EBOOK_GESTACAO}
            hasAccess={hasGestacao === true}
            tag="Incluído no seu plano"
            buyUrl={!hasGestacao ? '/ebook-gestacao/checkout' : undefined}
            onRead={() => openEbook('gestacao', 'Gestante Bem Informada: Gestação')}
          />
          <EbookCard
            ebook={EBOOK_PARTO}
            hasAccess={hasParto === true}
            tag="Bônus exclusivo"
            buyUrl={!hasParto ? '/ebook-parto/checkout' : undefined}
            onRead={() => openEbook('parto', 'Gestante Bem Informada: Parto')}
          />
        </main>

        <BottomNav />
      </div>

    </>
  )
}

function EbookCard({
  ebook,
  hasAccess,
  tag,
  buyUrl,
  onRead,
}: {
  ebook: typeof EBOOK_GESTACAO
  hasAccess: boolean
  tag: string
  buyUrl?: string
  onRead: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-100 overflow-hidden">
      {/* Capa */}
      <div className={`bg-gradient-to-br ${ebook.color} px-6 py-8 flex items-center gap-5`}>
        <div className="w-16 h-20 bg-white/60 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
          <BookOpen size={28} className={ebook.textColor} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-wide opacity-60">{ebook.author}</p>
          <h2 className={`text-lg font-black leading-tight ${ebook.textColor}`}>{ebook.title}</h2>
          <p className={`text-sm font-semibold ${ebook.textColor} opacity-70`}>{ebook.subtitle}</p>
          {hasAccess ? (
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold bg-white/70 px-2 py-0.5 rounded-full text-emerald-700">
              <CheckCircle size={11} /> {tag}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 mt-2 text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full text-gray-500">
              <Lock size={11} /> Não incluído
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-5 py-4">
        <p className="text-sm text-text-secondary leading-relaxed mb-4">{ebook.description}</p>

        {hasAccess ? (
          <>
            <button
              onClick={() => setOpen(o => !o)}
              className="text-sm font-semibold text-primary-500 mb-3 flex items-center gap-1"
            >
              {open ? '▲' : '▼'} {open ? 'Ocultar' : 'Ver'} conteúdo ({ebook.chapters.length} capítulos)
            </button>

            {open && (
              <ul className="space-y-2 mb-4">
                {ebook.chapters.map((ch, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {ch}
                  </li>
                ))}
              </ul>
            )}

            <button
              onClick={onRead}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              <BookMarked size={18} />
              Ler agora
            </button>
          </>
        ) : buyUrl ? (() => {
          const isParto = ebook.id === 'parto'
          const bg = isParto ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
          const titleCls = isParto ? 'text-rose-900' : 'text-amber-900'
          const subtitleCls = isParto ? 'text-rose-700' : 'text-amber-700'
          const priceCls = isParto ? 'text-rose-900' : 'text-amber-900'
          const atVistaCls = isParto ? 'text-rose-600' : 'text-amber-600'
          const btnCls = isParto
            ? 'bg-rose-500 hover:bg-rose-600'
            : 'bg-amber-500 hover:bg-amber-600'
          return (
            <div className={`border rounded-xl px-4 py-4 ${bg}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={`text-sm font-bold ${titleCls}`}>Ebook {ebook.subtitle}</p>
                  <p className={`text-xs mt-0.5 ${subtitleCls}`}>Guia completo da Dra. Fabiana — add-on disponível</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black ${priceCls}`}>R$17</p>
                  <p className={`text-xs ${atVistaCls}`}>à vista</p>
                </div>
              </div>
              <a
                href={buyUrl}
                className={`flex items-center justify-center gap-2 w-full text-white font-bold py-3 rounded-xl transition-colors text-sm ${btnCls}`}
              >
                <ShoppingCart size={16} />
                Adquirir por R$17
              </a>
            </div>
          )
        })() : null}
      </div>
    </div>
  )
}
