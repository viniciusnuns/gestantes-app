import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = 'Gestar em Movimento <noreply@gestaremovimento.com.br>'
const LOGIN_URL = 'https://gestaremovimento.com.br/login'
const SUPPORT_EMAIL = 'vfncoach@gmail.com'
const WHATSAPP_NUMBER = '5547989293040'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

// Paleta padrão — rosa→roxo (igual ao app)
const GRAD = 'linear-gradient(135deg,#c084fc,#a78bfa)'
const PURPLE = '#9333ea'
const BG = '#faf7ff'
const BORDER = '#f0e8ff'
const TEXT_DARK = '#1a1a2e'
const TEXT_MID = '#555566'
const TEXT_LIGHT = '#9999aa'
const FEATURE_BG = '#f5f0ff'

function emailShell(headerLabel: string, headerTitle: string, headerSub: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${GRAD};padding:36px 32px;text-align:center;">
            <p style="margin:0 0 6px;color:rgba(255,255,255,0.8);font-size:12px;letter-spacing:2px;text-transform:uppercase;">${headerLabel}</p>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;line-height:1.3;">${headerTitle}</h1>
            <p style="margin:10px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${headerSub}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 28px;">
            ${body}

            <!-- Suporte -->
            <p style="margin:24px 0 0;color:${TEXT_MID};font-size:13px;line-height:1.8;">
              Qualquer dúvida, fale conosco:<br>
              📧 <a href="mailto:${SUPPORT_EMAIL}" style="color:${PURPLE};text-decoration:none;">${SUPPORT_EMAIL}</a><br>
              💬 <a href="${WHATSAPP_URL}" style="color:#25d366;text-decoration:none;">WhatsApp (47) 98929-3040</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;border-top:1px solid ${BORDER};text-align:center;">
            <p style="margin:0;color:${TEXT_LIGHT};font-size:12px;line-height:1.6;">
              Gestar em Movimento · <a href="https://gestaremovimento.com.br" style="color:${PURPLE};text-decoration:none;">gestaremovimento.com.br</a><br>
              Você recebeu este e-mail porque realizou uma compra em nosso site.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:4px 0 28px;">
        <a href="${href}" style="display:inline-block;background:${GRAD};color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 44px;border-radius:50px;letter-spacing:0.3px;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`
}

function featureList(items: string[]): string {
  return `<div style="background:${FEATURE_BG};border-radius:12px;padding:20px 24px;margin-bottom:24px;">
    <p style="margin:0 0 12px;color:${TEXT_DARK};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">O que você tem acesso</p>
    <ul style="margin:0;padding:0;list-style:none;">
      ${items.map(item => `<li style="padding:6px 0;color:${TEXT_MID};font-size:14px;line-height:1.5;">
        <span style="color:${PURPLE};font-weight:bold;margin-right:8px;">✓</span>${item}
      </li>`).join('')}
    </ul>
  </div>`
}

// ─── E-mails ────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
    <p style="margin:0 0 16px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Seu pagamento foi confirmado e seu acesso ao <strong>Gestar em Movimento</strong> já está liberado.
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Use o e-mail <strong>${email}</strong> e a senha que você criou no checkout para entrar.
    </p>
    ${ctaButton(LOGIN_URL, 'Acessar o programa →')}
    ${featureList([
      '80+ exercícios em vídeo para toda a gestação',
      'Exercícios organizados por trimestre',
      'Calendário personalizado — 3 exercícios por dia',
      '10 aulas de preparação para o parto',
      'Desenvolvido pela Dra. Fabiana Pinheiro',
    ])}
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: '💜 Seu acesso ao Gestar em Movimento está pronto!',
    html: emailShell('Bem-vinda', 'Gestar em Movimento', 'Exercícios seguros para toda a sua gestação', body),
  })
}

export async function sendPartoWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
    <p style="margin:0 0 16px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Seu pagamento foi confirmado e suas <strong>10 aulas sobre o Trabalho de Parto</strong> já estão liberadas.
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Use o e-mail <strong>${email}</strong> e a senha que você criou no checkout para entrar.
    </p>
    ${ctaButton(LOGIN_URL, 'Acessar as aulas →')}
    ${featureList([
      'Fase latente, ativa, de transição e expulsivo',
      'Posições para o período expulsivo',
      'Exercícios para o trabalho de parto',
      'Orientações para parto cesáreo e pós-parto',
      'O papel do acompanhante no trabalho de parto',
      'Formas de indução do parto',
    ])}
    <div style="background:${FEATURE_BG};border-radius:12px;padding:18px 22px;border-left:4px solid #c084fc;">
      <p style="margin:0 0 6px;color:${TEXT_DARK};font-size:14px;font-weight:700;">Quer ir além do parto?</p>
      <p style="margin:0;color:${TEXT_MID};font-size:13px;line-height:1.6;">
        No app completo você tem acesso a 80+ exercícios para toda a gestação, calendário personalizado e muito mais. Desbloqueie tudo de dentro do app por <strong>12x R$14,70</strong>.
      </p>
    </div>
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: '💜 Suas aulas sobre o Parto estão liberadas!',
    html: emailShell('Compra confirmada', 'Preparação para o Parto', 'Gestar em Movimento · Dra. Fabiana Pinheiro', body),
  })
}

export async function sendDoresWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 💜</p>
    <p style="margin:0 0 16px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Sua compra foi confirmada. Você já tem acesso às sequências de exercícios para aliviar as <strong>dores mais comuns da gestação</strong>.
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Use o e-mail <strong>${email}</strong> e a senha que você criou no checkout para entrar.
    </p>
    ${ctaButton(LOGIN_URL, 'Acessar o app agora →')}
    ${featureList([
      'Sequência para aliviar dor lombar',
      'Sequência para dor lombar em pé',
      'Sequência para dor na pelve anterior (sínfise)',
      'Sequência para dor na pelve posterior',
      'Sequência para dores no pescoço e ombros',
      'Sequência para dor e peso no baixo ventre',
      'Vídeos de boas-vindas com a Dra. Fabiana',
    ])}
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, seu acesso ao Alívio de Dores está liberado! 💜`,
    html: emailShell('Acesso liberado', 'Alívio de Dores na Gestação', 'Gestar em Movimento · Dra. Fabiana Pinheiro', body),
  })
}

export async function sendUpgradeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Seu upgrade foi confirmado. Você agora tem acesso a <strong>todo o programa</strong> do Gestar em Movimento.
    </p>
    ${ctaButton(LOGIN_URL, 'Acessar o app completo →')}
    ${featureList([
      'Todos os exercícios de mobilidade, pelve e respiração',
      'Exercícios de alongamento e abdominal hipopressivo',
      'Meditações guiadas para reduzir a ansiedade',
      'Vídeos educativos de saúde gestacional',
      'Calendário personalizado completo por trimestre',
      'Sequências para alívio de dores na gestação',
    ])}
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: '✨ Upgrade confirmado — acesso completo liberado!',
    html: emailShell('Upgrade confirmado', 'Acesso completo liberado!', 'Gestar em Movimento · Dra. Fabiana Pinheiro', body),
  })
}

export async function sendReactivationEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 💜</p>
    <p style="margin:0 0 16px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Percebi que você ainda não acessou o <strong>Gestar em Movimento</strong>. Tudo bem? Podemos ajudar em algo?
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Seu acesso está garantido — basta entrar com o e-mail <strong>${email}</strong> e a senha que você criou.
    </p>
    ${ctaButton(LOGIN_URL, 'Acessar o programa →')}
    ${featureList([
      '80+ exercícios em vídeo para toda a gestação',
      'Calendário personalizado — 3 exercícios por dia',
      'Exercícios organizados por trimestre',
      '10 aulas de preparação para o parto',
      'Desenvolvido pela Dra. Fabiana Pinheiro',
    ])}
    <div style="background:${FEATURE_BG};border-radius:12px;padding:18px 22px;border-left:4px solid #c084fc;">
      <p style="margin:0 0 6px;color:${TEXT_DARK};font-size:14px;font-weight:700;">Teve alguma dificuldade para entrar?</p>
      <p style="margin:0;color:${TEXT_MID};font-size:13px;line-height:1.6;">
        Estamos aqui para ajudar. Responda este e-mail ou fale pelo WhatsApp — resolvemos na hora.
      </p>
    </div>
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `${firstName}, seu acesso ao Gestar em Movimento ainda está aqui 💜`,
    html: emailShell('Sentimos sua falta', 'Gestar em Movimento', 'Exercícios seguros para toda a sua gestação', body),
  })
}

export async function sendPilatesAnnouncementEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'
  const PILATES_URL = 'https://gestaremovimento.com.br/biblioteca?cat=pilates'

  const body = `
    <p style="margin:0 0 16px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
    <p style="margin:0 0 16px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      Temos uma novidade especial para você: acabamos de lançar a categoria <strong>Pilates para gestantes</strong> no app!
    </p>
    <p style="margin:0 0 24px;color:${TEXT_MID};font-size:15px;line-height:1.7;">
      São 2 aulas completas de 34 minutos cada, adaptadas para o 2º e 3º trimestres — com movimentos seguros que fortalecem, melhoram a postura e preparam seu corpo para o parto.
    </p>
    ${ctaButton(PILATES_URL, 'Acessar as aulas de Pilates →')}
    ${featureList([
      'Pilates para gestante — Aula 1 (34 min)',
      'Pilates para gestantes — Aula 2 (34 min)',
      'Ideal para o 2º e 3º trimestres',
      'Movimentos adaptados e seguros para a gestação',
      'Fortalecimento, postura e preparação para o parto',
    ])}
    <p style="margin:0;color:${TEXT_MID};font-size:14px;line-height:1.7;">
      As aulas já estão disponíveis na seção <strong>Biblioteca</strong> do app. Aproveite! 🧘
    </p>
  `

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: '🧘 Novidade no app: Pilates para gestantes chegou!',
    html: emailShell('✨ Novidade exclusiva', 'Pilates para gestantes', 'Gestar em Movimento · Dra. Fabiana Pinheiro', body),
  })
}
