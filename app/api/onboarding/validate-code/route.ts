import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const BETA_ACCESS_CODE = process.env.BETA_ACCESS_CODE ?? ''
const PARTO_TEST_CODE = process.env.PARTO_TEST_CODE ?? ''
const BETA_MAX_SLOTS = 31

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { code } = await req.json()
    const upperCode = (code ?? '').trim().toUpperCase()

    if (!upperCode) {
      return NextResponse.json({ valid: false, error: 'Código não informado.' }, { status: 400 })
    }

    if (upperCode === BETA_ACCESS_CODE) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('user_type', 'beta')

      if ((count ?? 0) >= BETA_MAX_SLOTS) {
        return NextResponse.json({
          valid: false,
          error: 'As vagas para o beta estão esgotadas. Entre em contato com nossa equipe.',
        })
      }

      return NextResponse.json({ valid: true, codeType: 'beta' })
    }

    if (upperCode === PARTO_TEST_CODE) {
      return NextResponse.json({ valid: true, codeType: 'parto' })
    }

    return NextResponse.json({ valid: false, error: 'Código inválido. Verifique e tente novamente.' })
  } catch (err: any) {
    console.error('[api/onboarding/validate-code]', err)
    return NextResponse.json({ valid: false, error: 'Erro ao validar código.' }, { status: 500 })
  }
}
