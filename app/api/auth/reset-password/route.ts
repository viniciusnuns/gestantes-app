import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword, confirmPassword } = await request.json()

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, senha e confirmação são obrigatórios' },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'As senhas não coincidem' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    // Verifica se token é válido e não expirou
    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single()

    if (tokenError || !resetRecord) {
      console.log('[ResetPassword] Invalid token:', token)
      return NextResponse.json(
        { error: 'Token inválido ou já utilizado' },
        { status: 400 }
      )
    }

    // Verifica expiração
    const expiresAt = new Date(resetRecord.expires_at)
    if (expiresAt < new Date()) {
      console.log('[ResetPassword] Token expired:', token)
      return NextResponse.json(
        { error: 'Token expirou. Solicite uma nova recuperação de senha.' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Atualiza senha na tabela users
    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', resetRecord.user_id)

    if (updateError) {
      console.error('[ResetPassword] Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar senha' },
        { status: 500 }
      )
    }

    // Marca token como usado
    const { error: markUsedError } = await supabase
      .from('password_resets')
      .update({ used: true })
      .eq('id', resetRecord.id)

    if (markUsedError) {
      console.error('[ResetPassword] Error marking token as used:', markUsedError)
      // Não é crítico, continua mesmo assim
    }

    console.log('[ResetPassword] Senha atualizada para user:', resetRecord.user_id)

    return NextResponse.json(
      {
        success: true,
        message: 'Senha atualizada com sucesso! Faça login com sua nova senha.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[ResetPassword] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Erro ao processar recuperação de senha' },
      { status: 500 }
    )
  }
}
