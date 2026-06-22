export const PIX_PRICE = 197.00

export const CARD_INSTALLMENTS = [
  { count: 1,  value: 197.00, display: '1x R$197,00',   total: 197.00 },
  { count: 3,  value: 69.90,  display: '3x R$69,90',    total: 209.70 },
  { count: 6,  value: 37.90,  display: '6x R$37,90',    total: 227.40 },
  { count: 12, value: 19.90,  display: '12x R$19,90',   total: 238.80 },
]

export const CHECKOUT_CONFIG = {
  productName: 'Gestar em Movimento',
  productDescription: 'Acesso completo ao programa de exercícios para gestantes',
  price: PIX_PRICE,
  priceDisplay: 'R$ 197,00',
  installments: 12,
  installmentValue: 19.90,
  features: [
    '50+ exercícios em vídeo para toda a gestação',
    'Exercícios organizados por trimestre',
    'Calendário personalizado com 3 exercícios por dia',
    'Desenvolvido pela Dra. Fabiana Pinheiro',
    'Acesso pelo celular, tablet ou computador',
    'Atualizações gratuitas incluídas',
  ],
  guaranteeDays: 7,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://gestaremovimento.com.br',
}
