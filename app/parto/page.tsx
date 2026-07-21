import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle, Star, Play } from 'lucide-react'
import PartoPixelTracker from '@/components/landing/PartoPixelTracker'

const AULAS = [
  { num: '01', title: 'Fase latente do Trabalho de Parto', desc: 'Reconheça o início do trabalho de parto e saiba como agir.' },
  { num: '02', title: 'Fase ativa do Trabalho de Parto', desc: 'Entenda a progressão e como lidar com as contrações mais intensas.' },
  { num: '03', title: 'Fase de transição', desc: 'A etapa mais intensa antes do período expulsivo — sem surpresas.' },
  { num: '04', title: 'Período expulsivo', desc: 'O momento do nascimento: o que esperar e como agir.' },
  { num: '05', title: 'Posições para o período expulsivo', desc: 'Conheça as opções e escolha a que melhor se adapta ao seu parto.' },
  { num: '06', title: 'Exercícios para o Trabalho de Parto', desc: 'Movimentos que aliviam a dor e ajudam na progressão do parto.' },
  { num: '07', title: 'Trabalho de Parto Cesárea', desc: 'Entenda o procedimento e como se preparar para a cesárea.' },
  { num: '08', title: 'Formas de indução do parto', desc: 'Os métodos disponíveis e quando cada um é indicado.' },
  { num: '09', title: 'O papel do acompanhante', desc: 'Como seu acompanhante pode apoiar ativamente no trabalho de parto.' },
  { num: '10', title: 'Orientações pós-parto', desc: 'Cuidados essenciais com o corpo e o bebê nas primeiras semanas.' },
]

const DEPOIMENTOS = [
  { name: 'Paciente anônima', texto: 'Cecília nasceu de parto normal. Consegui fazer as respirações no expulsivo bem como treinamos. Não tive laceração — foi tudo perfeito.', stars: 5 },
  { name: 'Letícia H.', texto: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores. Recomendo!', stars: 5 },
]

export default function PartoLandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF4F8' }}>
      <PartoPixelTracker />

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(253,244,248,0.85)' }}>
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <Link href="/parto/checkout"
            className="text-sm font-bold text-white px-4 py-2 rounded-full"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}>
            Quero me preparar →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-5 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: '#F3E8FF', color: '#7B5A94' }}>
              <Play size={13} className="fill-current" />
              10 aulas com fisioterapeuta especializada
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight" style={{ color: '#3D2B4F' }}>
              Tudo o que você precisa saber sobre o trabalho de parto
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: '#6B5B7B' }}>
              Chegue ao parto preparada, confiante e sem surpresas. A Dra. Fabiana Pinheiro te guia por cada fase — do início ao pós-parto.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}</div>
              <span className="text-sm font-medium" style={{ color: '#8B7B9B' }}>Avaliado por gestantes</span>
            </div>
            <div className="space-y-3">
              <Link href="/parto/checkout"
                className="inline-flex items-center justify-center w-full gap-2 text-white font-black text-lg py-4 rounded-2xl shadow-lg transition-all hover:opacity-90 hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}>
                Quero as aulas por R$67
              </Link>
              <p className="text-center text-sm" style={{ color: '#A89BA9' }}>
                ou 12x de R$6,70 · 🔒 Pagamento seguro · Acesso imediato
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/5]">
              <Image src="/pregnant-yoga.webp" alt="Preparação para o parto" fill className="object-cover" priority />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(61,43,79,0.6) 0%, transparent 60%)' }} />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <p className="text-sm font-semibold opacity-80">Dra. Fabiana Pinheiro</p>
                <p className="font-black text-lg">Fisioterapeuta Pélvica</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AS 10 AULAS */}
      <section className="py-16 md:py-20" style={{ background: '#F9F3FC' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#3D2B4F' }}>
              O que você vai aprender
            </h2>
            <p className="text-lg" style={{ color: '#6B5B7B' }}>
              10 aulas cobrindo cada fase do trabalho de parto — do início ao pós-parto.
            </p>
          </div>
          <div className="space-y-3">
            {AULAS.map((aula) => (
              <div key={aula.num} className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-white/60">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)', color: '#fff' }}>
                  {aula.num}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{aula.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{aula.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-5">
        <h2 className="text-3xl font-black text-center mb-10" style={{ color: '#3D2B4F' }}>
          Para quem é este curso?
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Grávidas em qualquer trimestre que querem entender o parto',
            'Quem quer chegar ao parto sem medo e sem surpresas',
            'Gestantes que preferem parto normal mas também querem entender a cesárea',
            'Quem quer preparar o acompanhante para apoiar no momento certo',
            'Mulheres que buscam informação de qualidade com profissional especializada',
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-start gap-3 shadow-sm border border-white/60">
              <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DRA. FABIANA */}
      <section className="py-16 md:py-20" style={{ background: '#F9F3FC' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 shadow-lg">
              <Image src="/dra-fabiana.webp" alt="Dra. Fabiana Pinheiro" width={128} height={128} className="object-cover w-full h-full" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#C4A8D9' }}>Sua professora</p>
              <h3 className="text-2xl font-black mb-3" style={{ color: '#3D2B4F' }}>Dra. Fabiana Pinheiro</h3>
              <p className="text-gray-600 leading-relaxed">
                Fisioterapeuta especializada em saúde pélvica e gestacional. Acompanha gestantes há anos no consultório e criou o Gestar em Movimento para levar esse conhecimento para todas as mamães — de onde estiverem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-16 md:py-20 max-w-4xl mx-auto px-5">
        <h2 className="text-3xl font-black text-center mb-10" style={{ color: '#3D2B4F' }}>
          O que as mamães dizem
        </h2>
        <div className="grid md:grid-cols-2 gap-5">
          {DEPOIMENTOS.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex mb-3">{[...Array(d.stars)].map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}</div>
              <p className="text-gray-700 leading-relaxed text-sm mb-4">&ldquo;{d.texto}&rdquo;</p>
              <p className="text-xs font-bold text-gray-500">{d.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PREÇO + CTA */}
      <section className="py-16 md:py-20" style={{ background: 'linear-gradient(135deg, #3D2B4F 0%, #5B3D7A 100%)' }}>
        <div className="max-w-2xl mx-auto px-5 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Chegue ao parto preparada
          </h2>
          <p className="text-white/80 text-lg">
            10 aulas completas com fisioterapeuta especializada por menos do que uma consulta.
          </p>
          <div className="bg-white/10 rounded-2xl p-6 inline-block">
            <p className="text-white/60 text-sm mb-1">Acesso imediato às 10 aulas</p>
            <p className="text-5xl font-black text-white">R$67</p>
            <p className="text-white/70 text-sm mt-1">ou 12x de R$6,70</p>
          </div>
          <Link href="/parto/checkout"
            className="inline-flex items-center justify-center w-full gap-2 font-black text-xl py-5 rounded-2xl shadow-xl transition-all hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)', color: '#fff' }}>
            Quero me preparar agora →
          </Link>
          <p className="text-white/50 text-sm">🔒 Pagamento seguro · Acesso imediato · Garantia de 7 dias</p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-12 max-w-2xl mx-auto px-5 text-center">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Shield size={28} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-black" style={{ color: '#3D2B4F' }}>Garantia de 7 dias</h3>
          <p className="text-gray-600">
            Se por qualquer motivo não ficar satisfeita, devolvemos 100% do valor. Sem burocracia, sem perguntas.
          </p>
        </div>
      </section>

    </div>
  )
}
