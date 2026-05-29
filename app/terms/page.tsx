'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-warm-50 pb-20">
      {/* Header */}
      <header className="gradient-primary text-white px-5 pt-6 pb-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold">Termos de Uso & Disclaimer</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Disclaimer Principal */}
        <section className="bg-accent-50 border-l-4 border-accent-600 p-5 rounded-lg">
          <h2 className="text-lg font-bold text-accent-700 mb-3">⚠️ Importante: Leia Antes de Usar</h2>
          <div className="text-sm text-text-primary space-y-2">
            <p>
              <strong>Gestar em Movimento</strong> é um aplicativo de caráter <strong>educativo e de promoção de saúde</strong>.
            </p>
            <p>
              Este app <strong>NÃO SUBSTITUI</strong> avaliação individual realizada por profissional médico ou fisioterapêutico qualificado.
            </p>
            <p>
              Antes de iniciar qualquer atividade, <strong>consulte seu médico ou profissional de saúde</strong>.
            </p>
          </div>
        </section>

        {/* 1. Caráter do App */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">1. Caráter do Aplicativo</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Gestar em Movimento fornece informações e exercícios com propósito <strong>exclusivamente educativo e de promoção de bem-estar</strong> durante a gestação.
            </p>
            <p>
              O conteúdo é desenvolvido como orientação geral e não representa prescrição médica ou substituto de atendimento profissional.
            </p>
          </div>
        </section>

        {/* 2. Limitações */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">2. O que o App NÃO Faz</h2>
          <ul className="text-sm text-text-secondary space-y-2 list-disc list-inside">
            <li>Não realiza diagnóstico de condições médicas</li>
            <li>Não substitui avaliação individualizada por profissional</li>
            <li>Não substitui acompanhamento médico ou fisioterapêutico regular</li>
            <li>Não oferece prescrição de tratamentos</li>
            <li>Não trata condições de alto risco sem orientação profissional</li>
          </ul>
        </section>

        {/* 3. Responsabilidade do Usuário */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">3. Sua Responsabilidade</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Você é responsável por:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Consultar seu médico antes de usar este app</li>
              <li>Informar qualquer condição médica pré-existente</li>
              <li>Interromper qualquer exercício se sentir dor, tontura ou desconforto</li>
              <li>Seguir orientações médicas acima das orientações do app</li>
            </ul>
          </div>
        </section>

        {/* 4. Isenção de Responsabilidade */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">4. Isenção de Responsabilidade</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              A equipe de Gestar em Movimento não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Lesões, problemas de saúde ou complicações decorrentes do uso do app</li>
              <li>Dados incompletos ou desatualizados</li>
              <li>Reações adversas a exercícios ou informações</li>
              <li>Interrupções no serviço</li>
            </ul>
          </div>
        </section>

        {/* 5. Segurança na Comunidade */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">5. Comunidade & Segurança</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              A comunidade é um espaço de apoio e troca de experiências. <strong>Não é espaço para diagnóstico ou orientação médica</strong>.
            </p>
            <p>
              Qualquer informação médica deve ser validada com profissional de saúde qualificado.
            </p>
          </div>
        </section>

        {/* 6. Dados Pessoais & LGPD */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">6. Dados Pessoais e Privacidade</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Seus dados pessoais são protegidos conforme Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
            <p>
              Você pode:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Acessar seus dados a qualquer momento</li>
              <li>Solicitar correção de informações incorretas</li>
              <li>Solicitar exclusão de conta (soft-delete de dados)</li>
            </ul>
          </div>
        </section>

        {/* 7. Alterações */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">7. Alterações a Estes Termos</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Podemos atualizar estes termos a qualquer momento. Você será notificado de mudanças importantes via app.
            </p>
            <p>
              Continuar usando o app após notificação significa aceitar os novos termos.
            </p>
          </div>
        </section>

        {/* 8. Contato */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">8. Dúvidas?</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Para dúvidas sobre estes termos, entre em contato conosco através da comunidade ou enviando uma mensagem.
            </p>
          </div>
        </section>

        {/* Data */}
        <footer className="text-xs text-text-secondary pt-8 border-t border-warm-200">
          <p>Termos de Uso - Gestar em Movimento</p>
          <p>Última atualização: Maio 2026</p>
        </footer>
      </main>
    </div>
  )
}
