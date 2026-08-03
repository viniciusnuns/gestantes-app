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
import { UPGRADE_PIX_PRICE, UPGRADE_CARD_INSTALLMENTS, DORES_UPGRADE_PIX_PRICE, DORES_UPGRADE_CARD_INSTALLMENTS } from '@/lib/checkout-config'
import { sendCAPIEvent } from '@/lib/meta-capi'
import { sendUpgradeEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  let billingType: 'PIX' | 'CREDIT_CARD' | undefined
  let paymentValue: number | undefined
  try {
    const body = await request.json()
    const { userId, cpf, installmentCount, card } = body
    billingType = body.billingType as 'PIX' | 'CREDIT_CARD'

    if (!userId || !billingType) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Fetch user to get email + name + verify it's a parto user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, product_type')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Usuária não encontrada' }, { status: 404 })
    }

    if (user.product_type !== 'parto' && user.product_type !== 'dores') {
      return NextResponse.json({ error: 'Upgrade não disponível para este plano' }, { status: 409 })
    }

    // Determine total payment value baseado no produto original da usuária
    const pixPrice = user.product_type === 'dores' ? DORES_UPGRADE_PIX_PRICE : UPGRADE_PIX_PRICE
    const installments = user.product_type === 'dores' ? DORES_UPGRADE_CARD_INSTALLMENTS : UPGRADE_CARD_INSTALLMENTS

    if (billingType === 'CREDIT_CARD' && installmentCount > 1) {
      const installment = installments.find(i => i.count === installmentCount)
      paymentValue = installment?.total ?? pixPrice
    } else {
      paymentValue = pixPrice
    }

    const customer = await findOrCreateCustomer({
      name: user.name,
      email: user.email,
      cpfCnpj: cpf?.replace(/\D/g, '') || undefined,
    })

    const dueDate = getTodayDueDate()

    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: paymentValue,
      dueDate,
      description: 'Upgrade — Gestar em Movimento (App Completo)',
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

    // Cartão aprovado imediatamente — atualiza o usuário no DB
    if (billingType === 'CREDIT_CARD' && isPaymentConfirmed(payment.status)) {
      const now = new Date().toISOString()
      await supabase
        .from('users')
        .update({ product_type: 'full', has_ebook_gestacao: true, bypass_time_lock: true, updated_at: now })
        .eq('id', userId)
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || undefined
      const userAgent = request.headers.get('user-agent') || undefined
      const nameParts = (user.name || '').trim().split(/\s+/)
      await sendCAPIEvent({
        eventName: 'Purchase',
        email: user.email,
        value: paymentValue,
        sourceUrl: 'https://gestaremovimento.com.br/upgrade/sucesso',
        eventId: payment.id,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(' ') || undefined,
        externalId: userId,
        ip: clientIp,
        userAgent,
      }).catch(() => {})
      sendUpgradeEmail(user.name, user.email).catch(() => {})
      return NextResponse.json({ success: true, billingType: 'CREDIT_CARD', confirmed: true, paymentId: payment.id, value: paymentValue })
    }

    // PIX — cria pending_checkout e retorna QR code
    if (billingType === 'PIX') {
      const [qrCode] = await Promise.all([
        getPixQrCode(payment.id),
        supabase.from('pending_checkouts').insert([{
          asaas_payment_id: payment.id,
          asaas_customer_id: customer.id,
          email: user.email,
          name: user.name,
          password_hash: 'upgrade',
          billing_type: 'PIX',
          value: paymentValue,
          status: 'PENDING',
          add_ebook_parto: false,
          product_type: 'upgrade-to-full',
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
        value: paymentValue,
      })
    }

    return NextResponse.json({ error: 'Forma de pagamento não suportada' }, { status: 400 })
  } catch (err: any) {
    if (err instanceof AsaasError) {
      return NextResponse.json({ error: translateAsaasError(err.code, err.message) }, { status: 422 })
    }
    console.error('[checkout/upgrade]', err)
    return NextResponse.json({ error: err.message || 'Erro interno' }, { status: 500 })
  }
}
