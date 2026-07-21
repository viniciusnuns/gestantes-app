import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPixQrCode } from '@/lib/asaas'

export const dynamic = 'force-dynamic'

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' }

export async function GET(
  _request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { paymentId } = params

    // Confirma que o paymentId existe e ainda está pendente
    const { data: pending } = await supabase
      .from('pending_checkouts')
      .select('email, status, billing_type, value, product_type')
      .eq('asaas_payment_id', paymentId)
      .eq('billing_type', 'PIX')
      .single()

    if (!pending) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404, headers: NO_CACHE })
    }

    if (pending.status === 'CONFIRMED') {
      return NextResponse.json({ error: 'Pagamento já confirmado' }, { status: 410, headers: NO_CACHE })
    }

    const qrCode = await getPixQrCode(paymentId)

    const successUrl = pending.product_type === 'parto'
      ? '/parto/checkout/sucesso'
      : '/checkout/sucesso'

    return NextResponse.json({
      pixQrCode: qrCode.encodedImage,
      pixPayload: qrCode.payload,
      pixExpiration: qrCode.expirationDate,
      email: pending.email,
      value: pending.value,
      product_type: pending.product_type || 'full',
      successUrl,
    }, { headers: NO_CACHE })

  } catch (err: any) {
    console.error('[checkout/pix-data]', err)
    return NextResponse.json({ error: err.message }, { status: 500, headers: NO_CACHE })
  }
}
