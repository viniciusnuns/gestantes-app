import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

// Gera token com expiração (1 hora)
function generateResetToken() {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hora
  return { token, expiresAt }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica se usuária existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Não revela se email existe (segurança)
      console.log('[ForgotPassword] Email not found:', email)
      return NextResponse.json(
        { success: true, message: 'Se o email existe em nossa base, você receberá um link de recuperação.' },
        { status: 200 }
      )
    }

    // Gera token de reset
    const { token, expiresAt } = generateResetToken()

    // Armazena token no banco (tabela password_resets)
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert([
        {
          user_id: user.id,
          email: email,
          token: token,
          expires_at: expiresAt.toISOString(),
          used: false
        }
      ])

    if (insertError) {
      console.error('[ForgotPassword] Error storing reset token:', insertError)
      return NextResponse.json(
        { error: 'Erro ao processar recuperação de senha' },
        { status: 500 }
      )
    }

    // Envia email com Resend
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://gestantes-app.vercel.app'}/reset-password?token=${token}`

    const { error: emailError } = await resend.emails.send({
      from: 'noreply@gestantes-app.com',
      to: email,
      subject: '🔐 Recuperar sua senha - Gestar em Movimento',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Recuperar Senha</h1>
          </div>

          <div style="background: #f9f9f9; padding: 40px; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Olá <strong>${user.name}</strong>,
            </p>

            <p style="font-size: 16px; color: #666; margin-bottom: 30px; line-height: 1.6;">
              Você solicitou recuperar sua senha. Clique no botão abaixo para criar uma nova senha:
            </p>

            <a href="${resetLink}" style="display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 30px;">
              Recuperar Senha
            </a>

            <p style="font-size: 14px; color: #999; margin-bottom: 20px; line-height: 1.6;">
              ⏱️ Este link expira em <strong>1 hora</strong>.
            </p>

            <p style="font-size: 14px; color: #999; margin-bottom: 30px; line-height: 1.6;">
              💡 Se você não solicitou isso, ignore este email. Ninguém mais consegue acessar sua conta sem a senha.
            </p>

            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

            <p style="font-size: 12px; color: #999; text-align: center;">
              Gestar em Movimento © 2026
            </p>
          </div>
        </div>
      `
    })

    if (emailError) {
      console.error('[ForgotPassword] Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      )
    }

    console.log('[ForgotPassword] Email enviado para:', email)

    return NextResponse.json(
      {
        success: true,
        message: 'Se o email existe em nossa base, você receberá um link de recuperação em breve.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    )
  }
}
