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
    const { name, email, password, cpf, billingType, card, price, installmentCount, addEbookParto } = body
    const normalizedEmail = email?.toLowerCase().trim()

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

    const paymentValue = (typeof price === 'number' && price > 0) ? price : CHECKOUT_CONFIG.price

    const payment = await createPayment({
      customerId: customer.id,
      billingType,
      value: paymentValue,
      installmentCount: billingType === 'CREDIT_CARD' && installmentCount > 1 ? installmentCount : undefined,
      dueDate,
      description: CHECKOUT_CONFIG.productName,
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
        week: 20, phone: null, healthy_pregnancy: true, had_intercurrence: false,
        doctor_approved: true, objectives: [], discomforts: [],
        onboarding_completed: false, onboarding_completed_at: null,
        user_type: 'patient', account_created_at: now, created_at: now, updated_at: now,
        has_ebook_gestacao: true,
        has_ebook_parto: addEbookParto === true,
      }])
      if (insertError) throw new Error(insertError.message)
      return NextResponse.json({ success: true, billingType: 'CREDIT_CARD', confirmed: true, userId, email: normalizedEmail })
    }

    // PIX e Boleto: paraleliza salvar pending + buscar QR code
    if (billingType === 'PIX') {
      const [qrCode] = await Promise.all([
        getPixQrCode(payment.id),
        supabase.from('pending_checkouts').insert([{
          asaas_payment_id: payment.id, asaas_customer_id: customer.id,
          email: normalizedEmail, name, password_hash: passwordHash,
          billing_type: billingType, value: CHECKOUT_CONFIG.price, status: 'PENDING',
          add_ebook_parto: addEbookParto === true,
        }]),
      ])
      return NextResponse.json({
        success: true, billingType: 'PIX', confirmed: false,
        paymentId: payment.id, pixQrCode: qrCode.encodedImage,
        pixPayload: qrCode.payload, pixExpiration: qrCode.expirationDate,
      })
    }

    // Boleto
    await supabase.from('pending_checkouts').insert([{
      asaas_payment_id: payment.id, asaas_customer_id: customer.id,
      email: normalizedEmail, name, password_hash: passwordHash,
      billing_type: billingType, value: CHECKOUT_CONFIG.price, status: 'PENDING',
      add_ebook_parto: addEbookParto === true,
    }])
    return NextResponse.json({
      success: true, billingType: 'BOLETO', confirmed: false,
      paymentId: payment.id, boletoUrl: payment.bankSlipUrl, invoiceUrl: payment.invoiceUrl,
    })

  } catch (err: any) {
    console.error('[checkout/create]', err)
    return NextResponse.json({ error: err.message || 'Erro ao processar pagamento' }, { status: 500 })
  }
}
