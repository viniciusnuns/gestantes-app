import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const TEMP_PASSWORD = '123456'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      // Não revela se email existe (segurança)
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 6)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', user.id)

    if (updateError) {
      console.error('[ForgotPassword] Update error:', updateError)
      return NextResponse.json({ error: 'Erro ao redefinir senha' }, { status: 500 })
    }

    console.log('[ForgotPassword] Password reset to 123456 for:', email)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
