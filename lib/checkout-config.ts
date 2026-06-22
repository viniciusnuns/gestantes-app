export const CHECKOUT_CONFIG = {
  productName: 'Gestar em Movimento',
  productDescription: 'Acesso completo ao programa de exercícios para gestantes',
  price: 47.00,
  priceDisplay: 'R$ 47,00',
  installments: 12,
  installmentValue: 3.92,
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
