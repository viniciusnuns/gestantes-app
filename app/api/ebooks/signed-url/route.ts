import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

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
    .select(`${column}, name, email`)
    .eq('id', userId)
    .single()

  if (!user || !user[column as keyof typeof user]) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const filename = ebook === 'gestacao' ? 'gestacao.pdf' : 'Parto.pdf'
  const { data: fileData, error } = await supabase.storage
    .from('ebooks')
    .download(filename)

  if (error || !fileData) {
    return NextResponse.json({ error: 'Erro ao carregar PDF' }, { status: 500 })
  }

  const pdfBytes = await fileData.arrayBuffer()
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const watermarkText = `Adquirido por ${user.name} · ${user.email}`

  const pages = pdfDoc.getPages()
  const targets = [pages[0], pages[pages.length - 1]].filter(Boolean)

  for (const page of targets) {
    const { width } = page.getSize()
    const fontSize = 9
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize)

    page.drawText(watermarkText, {
      x: (width - textWidth) / 2,
      y: 18,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
      opacity: 0.5,
    })
  }

  const watermarkedBytes = await pdfDoc.save()

  return new NextResponse(Buffer.from(watermarkedBytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline',
    },
  })
}
