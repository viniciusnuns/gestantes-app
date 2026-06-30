export const PIX_PRICE = 5.00

export const CARD_INSTALLMENTS = [
  { count: 1,  value: 5.00, display: '1x R$5,00',   total: 5.00 },
  { count: 3,  value: 5.00, display: '3x R$5,00',   total: 15.00 },
  { count: 6,  value: 5.00, display: '6x R$5,00',   total: 30.00 },
  { count: 12, value: 5.00, display: '12x R$5,00',  total: 60.00 },
]

export const CHECKOUT_CONFIG = {
  productName: 'Gestar em Movimento',
  productDescription: 'Acesso completo ao programa de exercícios para gestantes',
  price: PIX_PRICE,
  priceDisplay: 'R$ 5,00',
  installments: 1,
  installmentValue: 5.00,
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
