import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'Gestar em Movimento <noreply@gestaremovimento.com.br>'
const LOGIN_URL = 'https://gestaremovimento.com.br/login'
const SUPPORT_EMAIL = 'vfncoach@gmail.com'
const WHATSAPP_NUMBER = '5547989293040'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`

export async function sendPartoWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🤰 Suas aulas sobre o Parto estão liberadas!',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Suas aulas sobre o Parto estão liberadas</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7B5A94,#9B6FB5);padding:36px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Compra confirmada</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">Preparação para o Parto</h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Gestar em Movimento · Dra. Fabiana Pinheiro</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;color:#3d2b1f;font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
              <p style="margin:0 0 16px;color:#5c4033;font-size:15px;line-height:1.7;">
                Seu pagamento foi confirmado e suas <strong>10 aulas sobre o Trabalho de Parto</strong> já estão liberadas.
              </p>
              <p style="margin:0 0 24px;color:#5c4033;font-size:15px;line-height:1.7;">
                Use o e-mail <strong>${email}</strong> e a senha que você criou no checkout para entrar.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${LOGIN_URL}"
                       style="display:inline-block;background:linear-gradient(135deg,#7B5A94,#9B6FB5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Acessar as aulas →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you have access to -->
              <div style="background:#faf8f5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#3d2b1f;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">O que você desbloqueou</p>
                <ul style="margin:0;padding:0;list-style:none;">
                  ${[
                    'Fase latente, ativa, de transição e expulsivo',
                    'Posições para o período expulsivo',
                    'Exercícios para o trabalho de parto',
                    'Orientações para parto cesáreo e pós-parto',
                    'O papel do acompanhante no trabalho de parto',
                    'Formas de indução do parto',
                  ].map(item => `
                  <li style="padding:6px 0;color:#5c4033;font-size:14px;line-height:1.5;">
                    <span style="color:#7B5A94;font-weight:bold;margin-right:8px;">✓</span>${item}
                  </li>`).join('')}
                </ul>
              </div>

              <!-- Upsell suave -->
              <div style="background:#F3E8FF;border-radius:12px;padding:20px 24px;margin-bottom:24px;border-left:4px solid #9B6FB5;">
                <p style="margin:0 0 8px;color:#5B3D7A;font-size:14px;font-weight:700;">Quer ir além do parto?</p>
                <p style="margin:0;color:#6B5B7B;font-size:13px;line-height:1.6;">
                  No app completo você tem acesso a 70+ exercícios para toda a gestação, calendário personalizado e muito mais. Você pode desbloquear tudo de dentro do app por <strong>12x R$14,70</strong>.
                </p>
              </div>

              <p style="margin:0;color:#8c6e62;font-size:13px;line-height:1.6;">
                Qualquer dúvida, fale conosco:<br>
                📧 <a href="mailto:${SUPPORT_EMAIL}" style="color:#7B5A94;text-decoration:none;">${SUPPORT_EMAIL}</a><br>
                💬 <a href="${WHATSAPP_URL}" style="color:#25d366;text-decoration:none;">WhatsApp (47) 98929-3040</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0ebe5;text-align:center;">
              <p style="margin:0;color:#b09988;font-size:12px;line-height:1.6;">
                Gestar em Movimento · gestaremovimento.com.br<br>
                Você recebeu este e-mail porque realizou uma compra em nosso site.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const firstName = name?.split(' ')[0] || 'mamãe'

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: '🌿 Seu acesso ao Gestar em Movimento está pronto!',
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vinda ao Gestar em Movimento</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#b06e5a,#c97d65);padding:36px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Bem-vinda</p>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;line-height:1.3;">Gestar em Movimento</h1>
              <p style="margin:12px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Exercícios seguros para toda a sua gestação</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">
              <p style="margin:0 0 16px;color:#3d2b1f;font-size:16px;line-height:1.6;">Olá, <strong>${firstName}</strong>! 🎉</p>
              <p style="margin:0 0 16px;color:#5c4033;font-size:15px;line-height:1.7;">
                Seu pagamento foi confirmado e seu acesso ao <strong>Gestar em Movimento</strong> já está liberado.
              </p>
              <p style="margin:0 0 24px;color:#5c4033;font-size:15px;line-height:1.7;">
                Use o e-mail <strong>${email}</strong> e a senha que você criou no checkout para entrar.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${LOGIN_URL}"
                       style="display:inline-block;background:linear-gradient(135deg,#b06e5a,#c97d65);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:50px;letter-spacing:0.3px;">
                      Acessar o programa →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What you have access to -->
              <div style="background:#faf8f5;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#3d2b1f;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">O que você tem acesso</p>
                <ul style="margin:0;padding:0;list-style:none;">
                  ${[
                    '70+ exercícios em vídeo para toda a gestação',
                    'Exercícios organizados por trimestre',
                    'Calendário personalizado — 3 exercícios por dia',
                    '10 aulas de preparação para o parto',
                    'Desenvolvido pela Dra. Fabiana Pinheiro',
                  ].map(item => `
                  <li style="padding:6px 0;color:#5c4033;font-size:14px;line-height:1.5;">
                    <span style="color:#b06e5a;font-weight:bold;margin-right:8px;">✓</span>${item}
                  </li>`).join('')}
                </ul>
              </div>

              <p style="margin:0;color:#8c6e62;font-size:13px;line-height:1.6;">
                Qualquer dúvida, fale conosco:<br>
                📧 <a href="mailto:${SUPPORT_EMAIL}" style="color:#b06e5a;text-decoration:none;">${SUPPORT_EMAIL}</a><br>
                💬 <a href="${WHATSAPP_URL}" style="color:#25d366;text-decoration:none;">WhatsApp (47) 98929-3040</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0ebe5;text-align:center;">
              <p style="margin:0;color:#b09988;font-size:12px;line-height:1.6;">
                Gestar em Movimento · gestaremovimento.com.br<br>
                Você recebeu este e-mail porque realizou uma compra em nosso site.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
