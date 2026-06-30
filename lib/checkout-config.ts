export const PIX_PRICE = 1.00

export const CARD_INSTALLMENTS = [
  { count: 1,  value: 1.00, display: '1x R$1,00',   total: 1.00 },
  { count: 3,  value: 1.00, display: '3x R$1,00',   total: 3.00 },
  { count: 6,  value: 1.00, display: '6x R$1,00',   total: 6.00 },
  { count: 12, value: 1.00, display: '12x R$1,00',  total: 12.00 },
]

export const CHECKOUT_CONFIG = {
  productName: 'Gestar em Movimento',
  productDescription: 'Acesso completo ao programa de exercícios para gestantes',
  price: PIX_PRICE,
  priceDisplay: 'R$ 1,00',
  installments: 1,
  installmentValue: 1.00,
  features: [
    '70+ exercícios em vídeo para toda a gestação',
    '10 aulas completas de preparação para o parto',
    'Exercícios organizados por trimestre',
    'Calendário personalizado com 3 exercícios por dia',
    'Desenvolvido pela Dra. Fabiana Pinheiro',
    'Acesso pelo celular, tablet ou computador',
  ],
  guaranteeDays: 7,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://gestaremovimento.com.br',
}
