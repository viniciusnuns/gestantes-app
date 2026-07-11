const BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'access_token': process.env.ASAAS_API_KEY!,
  }
}

export class AsaasError extends Error {
  code: string
  constructor(message: string, code: string) {
    super(message)
    this.name = 'AsaasError'
    this.code = code
  }
}

const ASAAS_ERROR_MESSAGES: Record<string, string> = {
  creditCard_declined:                'Cartão recusado pela operadora. Tente outro cartão ou pague com PIX.',
  creditCard_insufficientFunds:       'Cartão sem limite disponível. Tente outro cartão ou pague com PIX.',
  creditCard_expired:                 'Cartão vencido. Use outro cartão ou pague com PIX.',
  creditCard_blocked:                 'Cartão bloqueado. Entre em contato com o banco ou pague com PIX.',
  creditCardTransactionUnauthorized:  'Transação não autorizada pelo banco. Tente outro cartão ou use PIX.',
  invalid_creditCardNumber:           'Número do cartão inválido. Verifique e tente novamente.',
  invalid_creditCardHolder:           'Nome do titular não confere. Verifique como está no cartão.',
  invalid_creditCardExpiryDate:       'Data de validade incorreta. Verifique e tente novamente.',
  invalid_creditCardCvv:              'Código de segurança (CVV) inválido. Verifique o verso do cartão.',
  invalid_cpfCnpj:                    'CPF inválido. Verifique o número e tente novamente.',
  invalid_creditCard:                 'Dados do cartão inválidos. Verifique e tente novamente.',
}

export function translateAsaasError(code: string, fallback: string): string {
  return ASAAS_ERROR_MESSAGES[code] || fallback
}

async function asaasRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers || {}) },
  })
  const data = await res.json()
  if (!res.ok) {
    const code = data?.errors?.[0]?.code || ''
    const description = data?.errors?.[0]?.description || data?.message || `Asaas error ${res.status}`
    throw new AsaasError(description, code)
  }
  return data as T
}

export interface AsaasCustomer {
  id: string
  name: string
  email: string
  cpfCnpj?: string
}

export interface AsaasPayment {
  id: string
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED' | 'RECEIVED_IN_CASH' | 'REFUND_REQUESTED' | 'CHARGEBACK_REQUESTED' | 'CHARGEBACK_DISPUTE' | 'AWAITING_CHARGEBACK_REVERSAL' | 'DUNNING_REQUESTED' | 'DUNNING_RECEIVED' | 'AWAITING_RISK_ANALYSIS'
  value: number
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  bankSlipUrl?: string
  invoiceUrl?: string
}

export interface AsaasPixQrCode {
  encodedImage: string
  payload: string
  expirationDate: string
}

export interface CreateCustomerInput {
  name: string
  email: string
  cpfCnpj?: string
  phone?: string
}

export interface CreatePaymentInput {
  customerId: string
  billingType: 'PIX' | 'CREDIT_CARD' | 'BOLETO'
  value: number
  installmentCount?: number
  installmentValue?: number
  dueDate: string
  description: string
  externalReference?: string
  creditCard?: {
    holderName: string
    number: string
    expiryMonth: string
    expiryYear: string
    ccv: string
  }
  creditCardHolderInfo?: {
    name: string
    email: string
    cpfCnpj: string
    postalCode?: string
    addressNumber?: string
    phone?: string
  }
}

export async function findOrCreateCustomer(input: CreateCustomerInput): Promise<AsaasCustomer> {
  // Tenta criar direto (caso mais comum — novo usuário). Se já existe, busca.
  const res = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj || undefined,
      phone: input.phone || undefined,
    }),
  })
  const data = await res.json()

  if (res.ok) return data as AsaasCustomer

  // Se CPF duplicado ou email duplicado, busca o existente
  const isDuplicate = data?.errors?.some((e: any) =>
    e.code === 'invalid_cpfCnpj' || e.description?.toLowerCase().includes('já existe') ||
    e.description?.toLowerCase().includes('cpf') || e.description?.toLowerCase().includes('cnpj')
  )
  if (!res.ok && !isDuplicate) {
    throw new Error(data?.errors?.[0]?.description || data?.message || `Asaas error ${res.status}`)
  }

  const search = await asaasRequest<{ data: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(input.email)}&limit=1`
  )
  if (search.data?.length > 0) return search.data[0]

  throw new Error('Cliente não encontrado no Asaas após tentativa de criação')
}

export async function createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
  const body: Record<string, unknown> = {
    customer: input.customerId,
    billingType: input.billingType,
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
    installmentCount: input.installmentCount,
    installmentValue: input.installmentValue,
  }

  if (input.billingType === 'CREDIT_CARD' && input.creditCard) {
    body.creditCard = input.creditCard
    body.creditCardHolderInfo = input.creditCardHolderInfo
  }

  return asaasRequest<AsaasPayment>('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
  return asaasRequest<AsaasPixQrCode>(`/payments/${paymentId}/pixQrCode`)
}

export async function getPayment(paymentId: string): Promise<AsaasPayment> {
  return asaasRequest<AsaasPayment>(`/payments/${paymentId}`)
}

export function isPaymentConfirmed(status: AsaasPayment['status']): boolean {
  return ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(status)
}

export function getTodayDueDate(): string {
  return new Date().toISOString().split('T')[0]
}

export function getBoletoDueDate(daysFromNow = 3): string {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toISOString().split('T')[0]
}
