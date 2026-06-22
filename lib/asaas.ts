const BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'access_token': process.env.ASAAS_API_KEY!,
  }
}

async function asaasRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options?.headers || {}) },
  })
  const data = await res.json()
  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || data?.message || `Asaas error ${res.status}`
    throw new Error(msg)
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
  // Busca cliente existente pelo email
  const search = await asaasRequest<{ data: AsaasCustomer[] }>(
    `/customers?email=${encodeURIComponent(input.email)}&limit=1`
  )
  if (search.data?.length > 0) return search.data[0]

  return asaasRequest<AsaasCustomer>('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      cpfCnpj: input.cpfCnpj || undefined,
      phone: input.phone || undefined,
    }),
  })
}

export async function createPayment(input: CreatePaymentInput): Promise<AsaasPayment> {
  const body: Record<string, unknown> = {
    customer: input.customerId,
    billingType: input.billingType,
    value: input.value,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.externalReference,
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
