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
} from '@/lib/asaas'
import { CHECKOUT_CONFIG } from '@/lib/checkout-config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, cpf, billingType, card } = body

    if (!name || !email || !password || !billingType) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    if (!['PIX', 'CREDIT_CARD', 'BOLETO'].includes(billingType)) {
      return NextResponse.json({ error: 'Forma de pagamento inválida' }, { status: 400 })
    }

    if (billingType === 'CREDIT_CARD' && !card) {
      return NextResponse.json({ error: 'Dados do cartão obrigatórios' }, { status: 400 })
    }

    // Verifica se email já tem conta ativa
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já possui uma conta. Faça login.' }, { status: 409 })
    }

    // Cria/busca cliente na Asaas
    const customer = await findOrCreateCustomer({
      name,
      email: email.toLowerCase().trim(),
      cpfCnpj: cpf?.replace(/\D/g, '') || undefined,
    })

    const dueDate = billingType === 'BOLETO' ? getBoletoDueDate(3) : getTodayDueDate()

    // Cria cobrança na Asaas
    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: CHECKOUT_CONFIG.price,
      dueDate,
      description: CHECKOUT_CONFIG.productName,
      externalReference: email.toLowerCase().trim(),
      creditCard: billingType === 'CREDIT_CARD' ? {
        holderName: card.holderName,
        number: card.number.replace(/\s/g, ''),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.ccv,
      } : undefined,
      creditCardHolderInfo: billingType === 'CREDIT_CARD' ? {
        name,
        email: email.toLowerCase().trim(),
        cpfCnpj: (cpf || '').replace(/\D/g, ''),
      } : undefined,
    })

    const passwordHash = await bcrypt.hash(password, 10)

    // Pagamento no cartão confirmado imediatamente
    if (billingType === 'CREDIT_CARD' && isPaymentConfirmed(payment.status)) {
      const userId = crypto.randomUUID()
      const now = new Date().toISOString()

      const { error: insertError } = await supabase.from('users').insert([{
        id: userId,
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        name,
        week: 20,
        phone: null,
        healthy_pregnancy: true,
        had_intercurrence: false,
        doctor_approved: true,
        objectives: [],
        discomforts: [],
        onboarding_completed: false,
        onboarding_completed_at: null,
        user_type: 'patient',
        account_created_at: now,
        created_at: now,
        updated_at: now,
      }])

      if (insertError) throw new Error(insertError.message)

      return NextResponse.json({
        success: true,
        billingType: 'CREDIT_CARD',
        confirmed: true,
        userId,
        email: email.toLowerCase().trim(),
      })
    }

    // Salva checkout pendente (PIX ou Boleto)
    await supabase.from('pending_checkouts').insert([{
      asaas_payment_id: payment.id,
      asaas_customer_id: customer.id,
      email: email.toLowerCase().trim(),
      name,
      password_hash: passwordHash,
      billing_type: billingType,
      value: CHECKOUT_CONFIG.price,
      status: 'PENDING',
    }])

    // PIX: retorna QR code
    if (billingType === 'PIX') {
      const qrCode = await getPixQrCode(payment.id)
      return NextResponse.json({
        success: true,
        billingType: 'PIX',
        confirmed: false,
        paymentId: payment.id,
        pixQrCode: qrCode.encodedImage,
        pixPayload: qrCode.payload,
        pixExpiration: qrCode.expirationDate,
      })
    }

    // Boleto
    return NextResponse.json({
      success: true,
      billingType: 'BOLETO',
      confirmed: false,
      paymentId: payment.id,
      boletoUrl: payment.bankSlipUrl,
      invoiceUrl: payment.invoiceUrl,
    })
  } catch (err: any) {
    console.error('[checkout/create]', err)
    return NextResponse.json({ error: err.message || 'Erro ao processar pagamento' }, { status: 500 })
  }
}
