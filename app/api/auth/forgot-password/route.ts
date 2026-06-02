import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

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
      return NextResponse.json({ success: true, token: null }, { status: 200 })
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

    return NextResponse.json({ success: true, token }, { status: 200 })
  } catch (error) {
    console.error('[ForgotPassword] Unexpected error:', error)
    return NextResponse.json({ error: 'Erro ao processar solicitação' }, { status: 500 })
  }
}
