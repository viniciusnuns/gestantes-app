// Roda uma vez: node scripts/disable-asaas-notifications.mjs
// Desativa todas as notificações Asaas para clientes existentes.
// Novas clientes já entram com notificationDisabled=true via findOrCreateCustomer.

import 'dotenv/config'

const BASE_URL = process.env.ASAAS_SANDBOX === 'true'
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3'

const HEADERS = {
  'Content-Type': 'application/json',
  'access_token': process.env.ASAAS_API_KEY,
}

async function fetchAllCustomers() {
  const customers = []
  let offset = 0
  const limit = 100

  while (true) {
    const res = await fetch(`${BASE_URL}/customers?limit=${limit}&offset=${offset}`, { headers: HEADERS })
    const data = await res.json()
    if (!res.ok) throw new Error(`Erro ao buscar clientes: ${JSON.stringify(data)}`)

    customers.push(...(data.data || []))
    if (!data.hasMore) break
    offset += limit
  }

  return customers
}

async function disableNotifications(customerId) {
  const res = await fetch(`${BASE_URL}/customers/${customerId}`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({ notificationDisabled: true }),
  })
  return res.ok
}

const customers = await fetchAllCustomers()
console.log(`Total de clientes: ${customers.length}`)

let updated = 0
let failed = 0

for (const customer of customers) {
  const ok = await disableNotifications(customer.id)
  if (ok) {
    updated++
    console.log(`✓ ${customer.email}`)
  } else {
    failed++
    console.log(`✗ FALHOU: ${customer.email} (${customer.id})`)
  }
}

console.log(`\nConcluído: ${updated} atualizados, ${failed} falhas`)
