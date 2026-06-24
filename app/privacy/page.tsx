'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
          <h1 className="text-2xl font-bold">Política de Privacidade</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">

        <section className="text-sm text-text-secondary">
          <p>
            Esta Política de Privacidade descreve como o <strong>Gestar em Movimento</strong>, de
            titularidade de <strong>Fabiana Pinheiro da Silva</strong>, coleta, usa e protege seus
            dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº
            13.709/2018).
          </p>
        </section>

        {/* 1. Dados coletados */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">1. Dados que Coletamos</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>Coletamos os seguintes dados quando você cria uma conta ou realiza uma compra:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Dados de cadastro:</strong> nome completo, endereço de e-mail e senha</li>
              <li><strong>Dados de pagamento:</strong> CPF e telefone (necessários para processar o pagamento via Asaas)</li>
              <li><strong>Dados de uso:</strong> trimestre gestacional, exercícios realizados, progresso e conquistas dentro do app</li>
              <li><strong>Dados de navegação:</strong> endereço IP, tipo de dispositivo e páginas visitadas, coletados automaticamente para fins de análise</li>
            </ul>
            <p className="mt-2">
              <strong>Não coletamos</strong> dados de cartão de crédito diretamente — esses dados são processados
              exclusivamente pela Asaas Pagamentos S.A., nosso parceiro de pagamentos.
            </p>
          </div>
        </section>

        {/* 2. Como usamos */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">2. Como Usamos seus Dados</h2>
          <ul className="text-sm text-text-secondary list-disc list-inside space-y-2">
            <li>Criar e gerenciar sua conta de acesso ao app</li>
            <li>Processar seu pagamento e confirmar seu acesso</li>
            <li>Personalizar os exercícios de acordo com o seu trimestre gestacional</li>
            <li>Enviar notificações de lembrete e comunicações sobre o programa (com sua autorização)</li>
            <li>Melhorar o funcionamento e o conteúdo do app com base no uso agregado</li>
          </ul>
        </section>

        {/* 3. Compartilhamento */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">3. Compartilhamento de Dados</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>Seus dados são compartilhados somente com os parceiros necessários para o funcionamento do serviço:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Asaas Pagamentos S.A.</strong> — processamento de pagamentos (PIX, cartão de crédito e boleto)</li>
              <li><strong>Supabase Inc.</strong> — armazenamento seguro dos dados da sua conta</li>
              <li><strong>Vercel Inc.</strong> — hospedagem da plataforma</li>
              <li><strong>Meta Platforms (Facebook/Instagram)</strong> — análise de desempenho de anúncios, mediante uso de pixel de rastreamento</li>
            </ul>
            <p>
              Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins de marketing
              sem o seu consentimento explícito.
            </p>
          </div>
        </section>

        {/* 4. Cookies e rastreamento */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">4. Cookies e Rastreamento</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Utilizamos cookies e tecnologias similares para manter sua sessão ativa e analisar o
              desempenho das páginas. Isso inclui o <strong>Meta Pixel</strong>, que nos permite
              medir a eficácia de anúncios no Facebook e Instagram.
            </p>
            <p>
              Você pode desativar cookies nas configurações do seu navegador, mas isso pode afetar
              o funcionamento do app.
            </p>
          </div>
        </section>

        {/* 5. Armazenamento e segurança */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">5. Armazenamento e Segurança</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>
              Seus dados são armazenados em servidores seguros fornecidos pela Supabase, com
              criptografia em trânsito (HTTPS) e em repouso. Senhas são armazenadas com hash
              criptográfico e nunca em texto puro.
            </p>
            <p>
              Mantemos seus dados pelo tempo necessário para a prestação do serviço ou conforme
              exigido por lei.
            </p>
          </div>
        </section>

        {/* 6. Seus direitos (LGPD) */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">6. Seus Direitos (LGPD)</h2>
          <div className="text-sm text-text-secondary space-y-3">
            <p>Conforme a LGPD, você tem o direito de:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados pessoais</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar portabilidade dos dados para outro serviço</li>
            </ul>
            <p>
              Para exercer qualquer um desses direitos, entre em contato pelo e-mail abaixo.
            </p>
          </div>
        </section>

        {/* 7. Menores de idade */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">7. Menores de Idade</h2>
          <p className="text-sm text-text-secondary">
            Este serviço é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente
            dados de menores de idade. Se identificarmos dados de menor cadastrado sem autorização,
            removeremos as informações imediatamente.
          </p>
        </section>

        {/* 8. Alterações */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">8. Alterações nesta Política</h2>
          <p className="text-sm text-text-secondary">
            Podemos atualizar esta política periodicamente. Alterações relevantes serão comunicadas
            por e-mail ou por aviso dentro do app. O uso contínuo do serviço após a notificação
            implica aceite das novas condições.
          </p>
        </section>

        {/* 9. Contato */}
        <section>
          <h2 className="text-xl font-bold text-text-primary mb-4">9. Contato</h2>
          <div className="text-sm text-text-secondary space-y-2">
            <p>Para dúvidas, solicitações ou exercício dos seus direitos sob a LGPD:</p>
            <p>
              <strong>Responsável:</strong> Fabiana Pinheiro da Silva<br />
              <strong>E-mail:</strong>{' '}
              <a href="mailto:vfncoach@gmail.com" className="underline text-primary-600">
                vfncoach@gmail.com
              </a>
            </p>
          </div>
        </section>

        <footer className="text-xs text-text-secondary pt-8 border-t border-warm-200">
          <p>Política de Privacidade — Gestar em Movimento</p>
          <p>Última atualização: Junho de 2026</p>
        </footer>
      </main>
    </div>
  )
}
