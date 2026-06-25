import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ebook = searchParams.get('ebook')
  const userId = searchParams.get('userId')

  if (!userId || !['gestacao', 'parto'].includes(ebook || '')) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
  }

  const column = ebook === 'gestacao' ? 'has_ebook_gestacao' : 'has_ebook_parto'
  const { data: user } = await supabase
    .from('users')
    .select(column)
    .eq('id', userId)
    .single()

  if (!user || !user[column as keyof typeof user]) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const filename = ebook === 'gestacao' ? 'gestacao.pdf' : 'Parto.pdf'
  const { data, error } = await supabase.storage
    .from('ebooks')
    .createSignedUrl(filename, 3600)

  if (error || !data) {
    return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
