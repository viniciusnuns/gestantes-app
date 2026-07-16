import Link from 'next/link'
import Image from 'next/image'
import { Shield, CheckCircle, Star, Sparkles } from 'lucide-react'
import FAQ from '@/components/landing/FAQ'
import PixelTracker from '@/components/landing/PixelTracker'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#FDF4F8' }}>
      <PixelTracker />

      {/* NAV */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-white/40" style={{ background: 'rgba(253,244,248,0.85)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <span className="font-bold text-lg" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
        </div>
      </nav>

      {/* DOBRA 01 — PROMESSA PRINCIPAL */}
      <section className="relative overflow-hidden py-14 md:py-20">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-30 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #E8C5D8 0%, transparent 70%)' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-25 translate-x-1/3 -translate-y-1/3"
          style={{ background: 'radial-gradient(circle, #C4A8D9 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] rounded-full opacity-20 -translate-x-1/2 translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #F5C89A 0%, transparent 70%)' }} />

        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">

            {/* Esquerda — Copy */}
            <div className="order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 md:mb-8 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#D4A5A5', color: '#9B5C5C' }}>
                <Shield size={13} />
                Criado por Fisioterapeuta Pélvica
              </div>

              <h1 className="text-[2.25rem] md:text-[2.75rem] lg:text-[3.25rem] font-bold leading-tight mb-4 md:mb-6" style={{ color: '#3E2828' }}>
                Uma gestação mais<br />tranquila e segura.<br />
                <span style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Um parto mais preparado.
                </span>
              </h1>

              <p className="text-base leading-relaxed mb-4 md:mb-8" style={{ color: '#8B7B8B' }}>
                Exercícios, meditações, preparação para o parto e orientação profissional para cada fase da gestação, desenvolvidos por fisioterapeuta pélvica.
                Apenas 15 minutos por dia, onde e quando você quiser.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-6 md:mb-10">
                {[
                  'Seguro para você e para o bebê',
                  'Adaptado por trimestre',
                  'Em casa, no seu ritmo',
                  'Do 1º trimestre até o parto',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} style={{ color: '#7B5A94', flexShrink: 0 }} />
                    <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direita — Imagem */}
            <div className="order-2 flex justify-center">
              <div className="relative w-full max-w-sm flex flex-col gap-3">
                <div className="absolute inset-0 rounded-3xl rotate-3 scale-95 opacity-50"
                  style={{ background: 'linear-gradient(135deg, #E8C5D8, #C4A8D9)' }} />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl"
                  style={{ background: 'linear-gradient(160deg, #F0D4E8 0%, #DCC8ED 50%, #C8B8E8 100%)' }}>
                  <Image
                    src="/pregnant-yoga.webp"
                    alt="Gestante praticando exercícios com alegria"
                    width={480}
                    height={380}
                    className="w-full h-auto"
                    sizes="(max-width: 768px) calc(100vw - 40px), 480px"
                    priority
                  />
                </div>
                <div className="relative rounded-2xl p-4 flex items-center gap-3 shadow-lg mx-2"
                  style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-xs" style={{ color: '#3E2828' }}>Seu app completo de gestação</p>
                    <p className="text-xs" style={{ color: '#8B7B8B' }}>Exercícios · Meditações · Aulas de parto</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOBRA 02 — PROVA SOCIAL */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-6 md:mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#B07070' }}>Quem já está no app</p>
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#3E2828' }}>
              O que elas estão dizendo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                text: 'Adorei o acompanhamento da Fabiana Pinheiro. Super atenciosa, dedicada e muito profissional! Acompanhou toda a minha gestação com muito cuidado. Recomendo de olhos fechados!',
                name: 'Janine Turco',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                photo: '/testimonials/janine.webp',
                photoPosition: 'center 83%',
              },
              {
                text: 'Estou fazendo os exercícios com a Fabiana durante a gestação e está sendo ótimo! Além de preparar para o parto, auxilia nas dores nas costas e nos exercícios em casa. Recomendo!',
                name: 'Letícia H.',
                detail: 'Avaliação Google · ⭐⭐⭐⭐⭐',
                photo: null,
                photoPosition: '',
              },
              {
                text: 'Cecília nasceu de parto normal. Consegui fazer as respirações no expulsivo bem como treinamos. Não tive laceração — foi tudo perfeito.',
                name: 'Paciente anônima',
                detail: 'Mensagem enviada à Dra. Fabiana',
                photo: null,
                photoPosition: '',
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl p-6 shadow-sm border"
                style={{ background: 'white', borderColor: '#E8D5CF' }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} style={{ color: '#F5C89A', fill: '#F5C89A' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#5C4C5C' }}>
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2">
                  {t.photo ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={t.photo}
                        alt={t.name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: t.photoPosition }}
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold" style={{ color: '#3E2828' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: '#A89BA9' }}>{t.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOBRA 03 — VOZES NA CABEÇA */}
      <section className="py-14 md:py-20 max-w-3xl mx-auto px-5">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Você já se perguntou isso?</p>
          <h2 className="text-3xl md:text-4xl font-bold" style={{ color: '#3E2828' }}>
            Conheço bem esse pensamento.
          </h2>
        </div>

        <div className="space-y-4">
          {[
            { quote: '"Exercício na gravidez é realmente seguro? E se machucar o bebê?"' },
            { quote: '"Não tenho energia pra nada — entre o enjoo e o cansaço, não sobra nada."' },
            { quote: '"Já tentei me exercitar antes, mas tenho medo. Não sei se consigo."' },
            { quote: '"Meu médico disse que posso, mas não explicou O QUE fazer. Fico com medo de errar."' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl px-6 py-5 border"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#E8D5CF' }}>
              <p className="text-base leading-relaxed font-medium" style={{ color: '#5C3A6B' }}>
                {item.quote}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* DOBRA 04 — TRANSIÇÃO DOR → SOLUÇÃO */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 100%)' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#3E2828' }}>
            A culpa não é sua.
          </h2>
          <p className="text-lg leading-relaxed mb-6" style={{ color: '#8B7B8B' }}>
            Ninguém te ensina como cuidar do corpo na gestação. O que você chama de medo, muitas vezes é só falta de uma orientação segura e confiável.
          </p>
          <p className="text-lg leading-relaxed mb-10" style={{ color: '#8B7B8B' }}>
            Você não precisa descobrir sozinha o que é seguro, o que é adequado para o seu trimestre, ou como se preparar para o parto. É exatamente para isso que o <strong style={{ color: '#7B5A94' }}>Gestar em Movimento</strong> foi criado.
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border"
            style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
              <Shield size={18} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-left" style={{ color: '#3E2828' }}>
              Cada exercício validado clinicamente por fisioterapeuta pélvica especializada em gestação
            </p>
          </div>
        </div>
      </section>

      {/* DOBRA 05 — PASSO A PASSO */}
      <section className="py-14 md:py-20 max-w-5xl mx-auto px-5 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
          Começa em menos de 1 minuto
        </h2>
        <p className="mb-16" style={{ color: '#8B7B8B' }}>Três passos para começar a cuidar de você</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { n: '1', title: 'Crie sua conta', desc: 'Cadastro rápido, acesso imediato a todo o conteúdo.', color: '#D4A5A5' },
            { n: '2', title: 'Informe seu trimestre', desc: 'O app personaliza os exercícios do dia para a sua fase.', color: '#C4A8D9' },
            { n: '3', title: 'Pratique com segurança', desc: 'Siga os vídeos no seu ritmo, de casa ou de onde estiver.', color: '#F5C89A' },
          ].map((step) => (
            <div key={step.n} className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl mb-5 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}>
                {step.n}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#3E2828' }}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOBRA 06 — TUDO QUE VAI RECEBER */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>O que você recebe</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
              Tudo que você precisa em um só lugar
            </h2>
            <p className="max-w-2xl mx-auto text-lg" style={{ color: '#8B7B8B' }}>
              Não é um curso que você assiste e esquece. É um companheiro que te acompanha do primeiro ao nono mês.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: '📅',
                title: 'Exercício do dia, todo dia',
                desc: 'O app distribui automaticamente os melhores exercícios para o seu trimestre. Você não precisa decidir o que fazer — é só praticar.',
                highlight: true,
              },
              {
                icon: '🤱',
                title: '10 aulas completas de preparação para o parto',
                desc: 'Trabalho de parto, posições, respiração, fase ativa e pós-parto — tudo dentro do mesmo app. Chegue preparada para o grande dia.',
                highlight: true,
              },
              {
                icon: '📈',
                title: 'Conteúdo que evolui com você',
                desc: 'Do 1º ao 3º trimestre, os exercícios se adaptam à sua fase. Não é um módulo fixo — é um programa vivo que cresce com a sua barriga.',
                highlight: false,
              },
              {
                icon: '🏆',
                title: 'Conquistas e ranking semanal',
                desc: 'Metas, conquistas compartilháveis e ranking. Nenhum curso de gestação tem esse sistema de motivação e engajamento.',
                highlight: false,
              },
              {
                icon: '📱',
                title: 'Acesso no celular, sem baixar nada',
                desc: 'Funciona pelo navegador de qualquer celular. Sem ocupar espaço, sem atualização obrigatória, sem complicação.',
                highlight: false,
              },
              {
                icon: '👩‍👩‍👧',
                title: 'Comunidade de gestantes',
                desc: 'Troque experiências com mães que estão na mesma fase que você. Tire dúvidas, compartilhe conquistas e saiba que não está sozinha nessa jornada.',
                highlight: false,
              },
            ].map((item) => (
              <div key={item.title}
                className="flex gap-4 p-6 rounded-2xl border"
                style={{
                  background: item.highlight ? 'white' : 'rgba(255,255,255,0.6)',
                  borderColor: item.highlight ? '#C4A8D9' : '#E8D5CF',
                  boxShadow: item.highlight ? '0 4px 24px rgba(196,168,217,0.15)' : 'none',
                }}>
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-base mb-1" style={{ color: '#3E2828' }}>{item.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DOBRA 07 — PARA QUEM SERVE / NÃO SERVE */}
      <section className="py-14 md:py-20 max-w-5xl mx-auto px-5">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Para quem é</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            O Gestar em Movimento é para você?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl p-7 border" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="font-bold text-base mb-5" style={{ color: '#7B5A94' }}>✅ É para você se...</p>
            <div className="space-y-3">
              {[
                'Quer se movimentar na gestação mas tem medo de fazer algo errado',
                'Sente dores nas costas, quadril ou pelve e quer aliviar com exercícios seguros',
                'Não tem tempo para academia mas quer manter o corpo ativo',
                'Está no início da gestação e não sabe por onde começar',
                'Quer chegar ao parto mais preparada, confiante e com menos medo',
                'Sabe que cuidar de si mesma é a melhor forma de cuidar do bebê',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#7B5A94' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#5C4C5C' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-7 border" style={{ background: 'rgba(255,255,255,0.6)', borderColor: '#E8D5CF' }}>
            <p className="font-bold text-base mb-5" style={{ color: '#9B5C5C' }}>❌ Não é para você se...</p>
            <div className="space-y-3">
              {[
                'Tem restrição médica total para atividade física na gestação',
                'Quer um programa de alta intensidade ou musculação pesada',
                'Espera que o app substitua o acompanhamento do seu obstetra ou fisioterapeuta',
                'Não está disposta a dedicar ao menos 10 minutos por dia para você',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: '#B07070' }}>✗</span>
                  <p className="text-sm leading-relaxed" style={{ color: '#8B7B8B' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 08 — ANCORAGEM DE VALOR */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 100%)' }}>
        <div className="max-w-2xl mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B07070' }}>Antes de ver o preço</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
            Veja o que você está recebendo
          </h2>
          <p className="text-lg mb-12" style={{ color: '#8B7B8B' }}>
            Cada parte do app, se vendida separada, custaria assim:
          </p>

          <div className="space-y-3 mb-8">
            {[
              { item: '80+ exercícios em vídeo por trimestre', value: 'R$ 127' },
              { item: '10 aulas completas de preparação para o parto', value: 'R$ 97' },
              { item: 'Meditações guiadas de preparação para gestantes', value: 'R$ 67' },
              { item: 'Exercícios para acabar com dores (lombar, pélvica e mais)', value: 'R$ 57' },
              { item: 'Programa de conquistas e ranking semanal', value: 'R$ 47' },
              { item: 'Comunidade de mamães e suporte', value: 'R$ 27' },
              { item: '🎁 Ebook Gestante Bem Informada: Gestação', value: 'R$ 47' },
              { item: 'Acesso imediato por toda a gestação', value: 'sem preço' },
            ].map((row) => (
              <div key={row.item} className="flex items-center justify-between px-5 py-3.5 rounded-xl border"
                style={{ background: 'white', borderColor: '#E8D5CF' }}>
                <span className="text-sm text-left" style={{ color: '#5C4C5C' }}>{row.item}</span>
                <span className="text-sm font-semibold line-through ml-4 flex-shrink-0" style={{ color: '#A89BA9' }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 border-2" style={{ background: 'white', borderColor: '#C4A8D9' }}>
            <p className="text-sm mb-3" style={{ color: '#8B7B8B' }}>Se vendido separado: <span className="line-through">R$ 469+</span></p>
            <p className="text-sm font-semibold mb-1" style={{ color: '#9B6FB0' }}>Seu investimento</p>
            <p className="text-4xl font-bold mb-1" style={{ color: '#3E2828' }}>12x de R$ 19,90</p>
            <p className="text-sm" style={{ color: '#A89BA9' }}>ou <strong style={{ color: '#5C4C5C' }}>R$ 197</strong> à vista no PIX</p>
          </div>
        </div>
      </section>

      {/* BÔNUS EXCLUSIVO — Ebook Gestação */}
      <section className="py-14 md:py-20 max-w-4xl mx-auto px-5">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-bold border"
            style={{ background: '#FFFBF0', borderColor: '#F5C89A', color: '#996B00' }}>
            🎁 Bônus exclusivo incluído
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3E2828' }}>
            Você leva isso junto, sem pagar nada a mais
          </h2>
          <p className="text-base" style={{ color: '#8B7B8B' }}>Criado pela própria Dra. Fabiana para completar sua jornada</p>
        </div>

        <div className="rounded-3xl p-7 border-2 flex flex-col md:flex-row gap-8 items-center"
          style={{ background: 'white', borderColor: '#F5C89A', borderStyle: 'dashed' }}>

          <div className="flex-shrink-0 text-center">
            <div className="w-36 h-48 rounded-2xl flex flex-col items-center justify-center shadow-lg mx-auto"
              style={{ background: 'linear-gradient(160deg, #F5E6C8 0%, #E8C87A 100%)' }}>
              <span className="text-4xl mb-2">📖</span>
              <p className="text-xs font-bold px-3 text-center leading-snug" style={{ color: '#6B4C2A' }}>Gestante Bem Informada</p>
              <p className="text-xs px-3 text-center mt-1 font-medium" style={{ color: '#8B6A3E' }}>Gestação</p>
            </div>
            <p className="text-xs line-through mt-2" style={{ color: '#A89BA9' }}>R$ 47</p>
            <p className="text-sm font-bold" style={{ color: '#7B5A94' }}>🎁 Grátis para você</p>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2" style={{ color: '#3E2828' }}>
              Ebook: Gestante Bem Informada — Gestação
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#8B7B8B' }}>
              O guia completo criado pela Dra. Fabiana para você entender tudo que acontece com o seu corpo durante a gravidez — da anatomia ao parto, passando por complicações comuns e como cuidar de você em cada fase.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Anatomia e hormônios da gestação',
                'Pré-natal: o que esperar em cada consulta',
                'Complicações mais comuns por trimestre',
                'Exercícios seguros em cada fase',
                'Como acabar com dores lombares e pélvicas',
                'Massagem perineal e preparação para o parto',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle size={13} style={{ color: '#7B5A94', flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: '#5C4C5C' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DOBRA 09 — PREÇO + BOTÃO (1ª aparição) */}
      <section className="py-14 md:py-20" style={{ background: '#FDF4F8' }}>
        <div className="max-w-md mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: '#3E2828' }}>Acesso completo, pagamento único</h2>
          <p className="mb-10" style={{ color: '#8B7B8B' }}>Acesso imediato. Pague uma vez e acompanhe toda a sua gestação.</p>

          <div className="relative rounded-3xl p-8 shadow-xl border-2 bg-white" style={{ borderColor: '#C4A8D9' }}>

            <p className="text-sm font-semibold mb-1" style={{ color: '#9B6FB0' }}>12 parcelas de</p>
            <div className="mb-1">
              <span className="text-6xl font-bold" style={{ color: '#3E2828' }}>R$&nbsp;19,90</span>
            </div>
            <p className="text-sm mb-1" style={{ color: '#A89BA9' }}>ou <strong style={{ color: '#3E2828' }}>R$ 197</strong> à vista no PIX</p>
            <p className="text-xs mb-8" style={{ color: '#A89BA9' }}>7 dias de garantia ou seu dinheiro de volta</p>

            <div className="space-y-3 mb-8 text-left">
              {[
                'Todos os exercícios por trimestre',
                '10 aulas completas de preparação para o parto',
                'Meditações guiadas de preparação',
                'Exercícios para acabar com dores (lombar, pélvica e mais)',
                'Vídeos educativos',
                'Conquistas e ranking semanal',
                'Acesso imediato por toda a gestação',
                '🎁 Ebook Gestante Bem Informada: Gestação',
              ].map((label) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                    <CheckCircle size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#5C4C5C' }}>{label}</span>
                </div>
              ))}
            </div>

            <Link
              href="/checkout"
              className="block w-full text-white font-bold text-lg py-4 rounded-2xl shadow-md hover:opacity-90 transition-all hover:-translate-y-0.5 text-center"
              style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)' }}
            >
              Quero acessar agora
            </Link>
            <p className="text-xs mt-4" style={{ color: '#A89BA9' }}>
              🔒 Pagamento seguro · Acesso imediato
            </p>
          </div>
        </div>
      </section>

      {/* DOBRA 10 — CUSTO DE FICAR PARADO */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #3E2828 0%, #5C3A6B 100%)' }}>
        <div className="max-w-3xl mx-auto px-5 text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4A5A5' }}>Pense bem</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white leading-tight">
            E se você não fizer nada?
          </h2>

          <div className="space-y-4 mb-12 text-left">
            {[
              'Dores nas costas e no quadril que poderiam ser prevenidas com exercícios simples',
              'Chegar ao parto sem saber o que esperar — sem técnicas de respiração, sem posições, sem preparação',
              'Meses de gestação sem se cuidar, com corpo sem tônus e energia cada vez mais baixa',
              'Recuperação mais lenta no pós-parto por falta de preparo do assoalho pélvico',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.08)' }}>
                <span className="text-lg flex-shrink-0">😔</span>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6 mb-8" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <p className="text-lg font-semibold text-white mb-2">Ou você pode fazer diferente.</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              15 minutos por dia. Exercícios seguros. Uma gestação mais leve, um parto mais preparado.
            </p>
          </div>

          <Link
            href="/checkout"
            className="inline-block font-bold text-base px-10 py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 100%)', color: 'white' }}
          >
            Quero me preparar agora →
          </Link>
        </div>
      </section>

      {/* DOBRA 11 — AUTORIDADE (Dra. Fabiana) */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-[2.5rem] rotate-2"
                  style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)', opacity: 0.4 }} />
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl"
                  style={{ width: 320, height: 420 }}>
                  <Image
                    src="/dra-fabiana.webp"
                    alt="Dra. Fabiana Pinheiro — Fisioterapeuta Pélvica"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'center top' }}
                    sizes="320px"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
                  style={{ background: 'white', minWidth: 180 }}>
                  <p className="font-bold text-sm" style={{ color: '#3E2828' }}>Dra. Fabiana Pinheiro da Silva</p>
                  <p className="text-xs mt-0.5" style={{ color: '#9B6FB0' }}>Fisioterapeuta · CREFITO 211253-F</p>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-bold border"
                style={{ background: 'rgba(255,255,255,0.8)', borderColor: '#C4A8D9', color: '#7B5A94' }}>
                <Shield size={13} />
                Especialista em saúde da mulher
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>
                Criado por quem cuida de gestantes todos os dias
              </h2>
              <p className="text-lg leading-relaxed mb-4" style={{ color: '#8B7B8B' }}>
                Mestre em Fisioterapia pela UDESC e especialista em Fisioterapia Pélvica, Fabiana atua há mais de 10 anos acompanhando gestantes, puérperas e mulheres em diferentes fases da vida.
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{ color: '#8B7B8B' }}>
                Criou o Gestar em Movimento para oferecer exercícios seguros, orientação baseada em evidências e preparação real para o parto — para que você viva a gestação com mais <strong style={{ color: '#9B5C5C' }}>confiança, conforto e bem-estar</strong>.
              </p>
              <div className="space-y-3">
                {[
                  'Exercícios validados clinicamente',
                  'Adaptados para cada trimestre',
                  'Seguros para mamãe e bebê',
                  'Preparação completa para o parto',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #D4A5A5, #C4A8D9)' }}>
                      <CheckCircle size={14} className="text-white" />
                    </div>
                    <span className="font-medium" style={{ color: '#5C4C5C' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DOBRA 12 — REPETIR PREÇO + BOTÃO */}
      <section className="py-14 md:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C4A8D9 60%, #B08BC4 100%)' }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, white, transparent)', transform: 'translate(-30%, 30%)' }} />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5 text-white leading-tight">
            Sua gestação merece<br />o melhor cuidado.
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-xl mx-auto">
            Acesso imediato. Acompanhe toda a sua gestação.
          </p>
          <p className="text-white/70 text-base mb-2">12x de R$ 19,90 · ou R$ 197 à vista no PIX</p>
          <Link
            href="/checkout"
            className="inline-block font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl mt-4"
            style={{ background: 'white', color: '#9B5C5C' }}
          >
            Quero acessar agora →
          </Link>
          <p className="text-sm text-white/60 mt-4">
            🔒 Garantia de 7 dias · Acesso imediato
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 md:py-20" style={{ background: 'linear-gradient(135deg, #F5EBF7 0%, #FAF0F4 50%, #F5EBE7 100%)' }}>
        <div className="max-w-2xl mx-auto px-5">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#3E2828' }}>Perguntas frequentes</h2>
          </div>
          <FAQ />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/40" style={{ background: '#FDF4F8' }}>
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#A89BA9' }}>
          <span className="font-semibold" style={{ color: '#7B5A94' }}>Gestar em Movimento</span>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-primary-600 transition-colors">Termos de uso</Link>
            <Link href="/privacy" className="hover:text-primary-600 transition-colors">Privacidade</Link>
            <Link href="/login" className="hover:text-primary-600 transition-colors">Entrar</Link>
            <Link href="/checkout" className="hover:text-primary-600 transition-colors">Criar conta</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
