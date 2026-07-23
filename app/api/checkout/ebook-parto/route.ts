import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  findOrCreateCustomer,
  createPayment,
  getPixQrCode,
  isPaymentConfirmed,
  getTodayDueDate,
  AsaasError,
  translateAsaasError,
} from '@/lib/asaas'
import { EBOOK_PARTO_PRICE } from '@/lib/checkout-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  let billingType: 'PIX' | 'CREDIT_CARD' | undefined
  try {
    const body = await request.json()
    const { userId, cpf, card } = body
    billingType = body.billingType as 'PIX' | 'CREDIT_CARD'

    if (!userId || !billingType) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, has_ebook_parto')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuária não encontrada' }, { status: 404 })
    }

    if (user.has_ebook_parto) {
      return NextResponse.json({ error: 'Ebook já incluído no seu plano' }, { status: 409 })
    }

    const customer = await findOrCreateCustomer({
      name: user.name,
      email: user.email,
      cpfCnpj: cpf?.replace(/\D/g, '') || undefined,
    })

    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: EBOOK_PARTO_PRICE,
      dueDate: getTodayDueDate(),
      description: 'Ebook Gestante Bem Informada: Parto — Gestar em Movimento',
      externalReference: user.email,
      creditCard: billingType === 'CREDIT_CARD' ? {
        holderName: card.holderName,
        number: card.number.replace(/\s/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.ccv,
      } : undefined,
      creditCardHolderInfo: billingType === 'CREDIT_CARD' ? {
        name: user.name,
        email: user.email,
        cpfCnpj: (cpf || '').replace(/\D/g, ''),
        phone: card?.phone || undefined,
        postalCode: '01310100',
        addressNumber: '1000',
      } : undefined,
    })

    if (billingType === 'CREDIT_CARD' && isPaymentConfirmed(payment.status)) {
      await supabase
        .from('users')
        .update({ has_ebook_parto: true, updated_at: new Date().toISOString() })
        .eq('id', userId)
      return NextResponse.json({ success: true, billingType: 'CREDIT_CARD', confirmed: true, paymentId: payment.id, value: EBOOK_PARTO_PRICE })
    }

    if (billingType === 'PIX') {
      const [qrCode] = await Promise.all([
        getPixQrCode(payment.id),
        supabase.from('pending_checkouts').insert([{
          asaas_payment_id: payment.id,
          asaas_customer_id: customer.id,
          email: user.email,
          name: user.name,
          password_hash: 'ebook-parto',
          billing_type: 'PIX',
          value: EBOOK_PARTO_PRICE,
          status: 'PENDING',
          add_ebook_parto: false,
          product_type: 'ebook-parto',
        }]),
      ])
      return NextResponse.json({
        success: true,
        billingType: 'PIX',
        confirmed: false,
        paymentId: payment.id,
        pixQrCode: qrCode.encodedImage,
        pixPayload: qrCode.payload,
        pixExpiration: qrCode.expirationDate,
        value: EBOOK_PARTO_PRICE,
      })
    }

    return NextResponse.json({ error: 'Forma de pagamento não suportada' }, { status: 400 })
  } catch (err: any) {
    if (err instanceof AsaasError) {
      return NextResponse.json({ error: translateAsaasError(err.code, err.message) }, { status: 422 })
    }
    console.error('[checkout/ebook-parto]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
