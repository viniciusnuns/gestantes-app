import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  findOrCreateCustomer,
  createPayment,
  getPixQrCode,
  isPaymentConfirmed,
  getTodayDueDate,
  getBoletoDueDate,
  AsaasError,
  translateAsaasError,
} from '@/lib/asaas'
import { CHECKOUT_CONFIG, PARTO_CHECKOUT_CONFIG } from '@/lib/checkout-config'
import { sendWelcomeEmail, sendPartoWelcomeEmail } from '@/lib/email'
import { sendCAPIEvent } from '@/lib/meta-capi'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  let billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO' | undefined
  let normalizedEmail: string | undefined
  let paymentValue: number | undefined
  let installmentCount: number | undefined
  try {
    const body = await request.json()
    ;({ billingType, installmentCount } = body)
    const { name, email, password, cpf, card, price, addEbookParto, fbc, fbp, utmData, checkoutEventId, productType = 'full' } = body
    normalizedEmail = email?.toLowerCase().trim()
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || request.headers.get('x-real-ip')
      || undefined
    const userAgent = request.headers.get('user-agent') || undefined
    const nameParts = name?.trim().split(/\s+/) || []
    const firstName = nameParts[0] || undefined
    const lastName = nameParts.slice(1).join(' ') || undefined
    const phone = card?.phone || undefined

    if (!name || !normalizedEmail || !password || !billingType) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }
    if (!['PIX', 'CREDIT_CARD', 'BOLETO'].includes(billingType)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
    }
    if (billingType === 'CREDIT_CARD' && !card) {
      return NextResponse.json({ error: 'Dados do cartão obrigatórios' }, { status: 400 })
    }

    // Paraleliza: verifica email existente + cria cliente Asaas + hash da senha
    const [existingUserResult, customer, passwordHash] = await Promise.all([
      supabase.from('users').select('id').eq('email', normalizedEmail).maybeSingle(),
      findOrCreateCustomer({
        name,
        email: normalizedEmail,
        cpfCnpj: cpf?.replace(/\D/g, '') || undefined,
      }),
      bcrypt.hash(password, 8),
    ])

    if (existingUserResult.data) {
      return NextResponse.json({ error: 'Este e-mail já possui uma conta. Faça login.' }, { status: 409 })
    }

    const dueDate = billingType === 'BOLETO' ? getBoletoDueDate(3) : getTodayDueDate()

    paymentValue = (typeof price === 'number' && price > 0) ? price : CHECKOUT_CONFIG.price

    // CAPI: InitiateCheckout (servidor — complementa o pixel do browser)
    await sendCAPIEvent({
      eventName: 'InitiateCheckout',
      email: normalizedEmail,
      value: paymentValue || CHECKOUT_CONFIG.price,
      sourceUrl: 'https://gestaremovimento.com.br/checkout',
      eventId: checkoutEventId || undefined,
      fbc: fbc || undefined,
      fbp: fbp || undefined,
      ip: clientIp,
      userAgent,
      firstName,
      lastName,
      phone,
    }).catch(() => {})

    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: paymentValue,
      installmentCount: billingType === 'CREDIT_CARD' && installmentCount > 1 ? installmentCount : undefined,
      installmentValue: billingType === 'CREDIT_CARD' && installmentCount > 1
        ? Math.round((paymentValue / installmentCount) * 100) / 100
        : undefined,
      dueDate,
      description: productType === 'parto'
        ? PARTO_CHECKOUT_CONFIG.productName
        : productType === 'upgrade-to-full'
          ? 'Upgrade — Gestar em Movimento (App Completo)'
          : CHECKOUT_CONFIG.productName,
      externalReference: normalizedEmail,
      creditCard: billingType === 'CREDIT_CARD' ? {
        holderName: card.holderName,
        number: card.number.replace(/\s/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.ccv,
      } : undefined,
      creditCardHolderInfo: billingType === 'CREDIT_CARD' ? {
        name,
        email: normalizedEmail,
        cpfCnpj: (cpf || '').replace(/\D/g, ''),
        phone: card?.phone || undefined,
        postalCode: '01310100',
        addressNumber: '1000',
      } : undefined,
    })

    // Cartão aprovado imediatamente
    if (billingType === 'CREDIT_CARD' && isPaymentConfirmed(payment.status)) {
      const userId = crypto.randomUUID()
      const now = new Date().toISOString()
      const { error: insertError } = await supabase.from('users').insert([{
        id: userId, email: normalizedEmail, password_hash: passwordHash, name,
        week_at_registration: 0, phone: null, healthy_pregnancy: true, had_intercurrence: false,
        doctor_approved: true, objectives: [], discomforts: [],
        onboarding_completed: false, onboarding_completed_at: null,
        user_type: 'patient', account_created_at: now, created_at: now, updated_at: now,
        has_ebook_gestacao: productType === 'full',
        has_ebook_parto: addEbookParto === true,
        utm_data: utmData || null,
        product_type: productType,
      }])
      if (insertError) throw new Error(insertError.message)
      const emailFn = productType === 'parto' ? sendPartoWelcomeEmail : sendWelcomeEmail
      emailFn(name, normalizedEmail).catch(err =>
        console.error('[checkout/create] email error:', err)
      )
      // CAPI: Purchase para cartão aprovado imediatamente
      await sendCAPIEvent({
        eventName: 'Purchase',
        email: normalizedEmail,
        value: paymentValue,
        sourceUrl: 'https://gestaremovimento.com.br/checkout/sucesso',
        eventId: payment.id,
        fbc: fbc || undefined,
        fbp: fbp || undefined,
        ip: clientIp,
        userAgent,
        firstName,
        lastName,
        phone,
        externalId: userId,
      }).catch(() => {})
      return NextResponse.json({ success: true, billingType: 'CREDIT_CARD', confirmed: true, userId, email: normalizedEmail, paymentId: payment.id })
    }

    // PIX e Boleto: paraleliza salvar pending + buscar QR code
    if (billingType === 'PIX') {
      const [qrCode] = await Promise.all([
        getPixQrCode(payment.id),
        supabase.from('pending_checkouts').insert([{
          asaas_payment_id: payment.id, asaas_customer_id: customer.id,
          email: normalizedEmail, name, password_hash: passwordHash,
          billing_type: billingType, value: paymentValue, status: 'PENDING',
          add_ebook_parto: addEbookParto === true,
          fbp: fbp || null, fbc: fbc || null,
          client_ip: clientIp || null, user_agent: userAgent || null,
          utm_data: utmData || null,
          product_type: productType,
        }]),
      ])
      return NextResponse.json({
        success: true, billingType: 'PIX', confirmed: false,
        paymentId: payment.id, pixQrCode: qrCode.encodedImage,
        pixPayload: qrCode.payload, pixExpiration: qrCode.expirationDate,
        value: paymentValue,
      })
    }

    // Boleto
    await supabase.from('pending_checkouts').insert([{
      asaas_payment_id: payment.id, asaas_customer_id: customer.id,
      email: normalizedEmail, name, password_hash: passwordHash,
      billing_type: billingType, value: paymentValue, status: 'PENDING',
      add_ebook_parto: addEbookParto === true,
      fbp: fbp || null, fbc: fbc || null,
      client_ip: clientIp || null, user_agent: userAgent || null,
      utm_data: utmData || null,
      product_type: productType,
    }])
    return NextResponse.json({
      success: true, billingType: 'BOLETO', confirmed: false,
      paymentId: payment.id, boletoUrl: payment.bankSlipUrl, invoiceUrl: payment.invoiceUrl,
    })

  } catch (err: any) {
    console.error('[checkout/create]', err)
    const asaasCode = err instanceof AsaasError ? err.code : ''
    const userMessage = err instanceof AsaasError
      ? translateAsaasError(err.code, err.message)
      : (err.message || 'Erro ao processar pagamento.')
    Promise.resolve(supabase.from('checkout_errors').insert([{
      billing_type: billingType ?? null,
      email: normalizedEmail ?? null,
      error_message: err.message ?? 'unknown',
      error_type: 'create_exception',
      metadata: {
        value: paymentValue ?? null,
        installmentCount: billingType === 'CREDIT_CARD' ? (installmentCount ?? null) : undefined,
        asaasCode: asaasCode || undefined,
        asaasMessage: asaasCode ? err.message : undefined,
      },
    }])).catch(() => {})
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
