import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'
import { Resend } from 'resend'

const APP_URL = 'https://gestaremovimento.com.br'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      // Não revela se email existe (segurança)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    // Invalida tokens anteriores
    await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('user_id', user.id)
      .eq('used', false)

    // Gera novo token com 1h de expiração
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { error: insertError } = await supabase
      .from('password_resets')
      .insert([{ user_id: user.id, email: user.email, token, expires_at: expiresAt, used: false }])

    if (insertError) {
      console.error('[ForgotPassword] Insert error:', insertError)
      return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
    }

    const resetLink = `${APP_URL}/reset-password?token=${token}`
    const firstName = user.name?.split(' ')[0] || 'mamãe'

    const { error: emailError } = await resend.emails.send({
      from: 'Gestar em Movimento <noreply@gestaremovimento.com.br>',
      to: user.email,
      subject: 'Recuperação de senha — Gestar em Movimento',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background:#faf7ff;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7ff;padding:40px 20px;">
            <tr><td align="center">
              <table width="100%" style="max-width:500px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#c084fc,#a78bfa);padding:32px 40px;text-align:center;">
                    <p style="margin:0;color:#ffffff;font-size:28px;">🤰</p>
                    <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:700;">Gestar em Movimento</h1>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">Olá, ${firstName}! 💜</h2>
                    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.6;">
                      Recebemos uma solicitação para redefinir a senha da sua conta.
                    </p>
                    <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
                      Clique no botão abaixo para criar uma nova senha. O link é válido por <strong>1 hora</strong>.
                    </p>
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${resetLink}"
                            style="display:inline-block;background:linear-gradient(135deg,#c084fc,#a78bfa);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 36px;border-radius:50px;">
                            Redefinir minha senha →
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:28px 0 0;color:#888;font-size:13px;line-height:1.6;">
                      Se você não solicitou a recuperação de senha, pode ignorar este email com segurança. Sua senha permanece a mesma.
                    </p>
                    <p style="margin:12px 0 0;color:#aaa;font-size:12px;">
                      O link expira em 1 hora.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9f5ff;padding:20px 40px;text-align:center;border-top:1px solid #f0e8ff;">
                    <p style="margin:0;color:#aaa;font-size:12px;">
                      © 2024 Gestar em Movimento · <a href="https://gestaremovimento.com.br" style="color:#c084fc;text-decoration:none;">gestaremovimento.com.br</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('[ForgotPassword] Email error:', emailError)
      return NextResponse.json({ error: 'Erro ao enviar email. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
