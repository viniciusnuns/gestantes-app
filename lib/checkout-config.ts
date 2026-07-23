// ── App completo ────────────────────────────────────────────────
export const PIX_PRICE = 197.00

export const CARD_INSTALLMENTS = [
  { count: 1,  value: 197.00, display: '1x R$197,00',  total: 197.00 },
  { count: 2,  value: 101.90, display: '2x R$101,90',  total: 203.80 },
  { count: 3,  value: 69.90,  display: '3x R$69,90',   total: 209.70 },
  { count: 4,  value: 52.90,  display: '4x R$52,90',   total: 211.60 },
  { count: 6,  value: 37.90,  display: '6x R$37,90',   total: 227.40 },
  { count: 8,  value: 29.90,  display: '8x R$29,90',   total: 239.20 },
  { count: 10, value: 25.90,  display: '10x R$25,90',  total: 259.00 },
  { count: 12, value: 19.90,  display: '12x R$19,90',  total: 238.80 },
]

export const CHECKOUT_CONFIG = {
  productName: 'Gestar em Movimento',
  productDescription: 'Acesso completo ao programa de exercícios para gestantes',
  price: PIX_PRICE,
  priceDisplay: 'R$ 197,00',
  installments: 1,
  installmentValue: 197.00,
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

// ── Upgrade Parto → Full ─────────────────────────────────────────
export const UPGRADE_PIX_PRICE = 147.00

export const UPGRADE_CARD_INSTALLMENTS = [
  { count: 1,  value: 147.00, display: '1x R$147,00',  total: 147.00 },
  { count: 2,  value: 75.90,  display: '2x R$75,90',   total: 151.80 },
  { count: 3,  value: 51.90,  display: '3x R$51,90',   total: 155.70 },
  { count: 4,  value: 39.90,  display: '4x R$39,90',   total: 159.60 },
  { count: 6,  value: 26.00,  display: '6x R$26,00',   total: 156.00 },
  { count: 8,  value: 20.90,  display: '8x R$20,90',   total: 167.20 },
  { count: 10, value: 17.90,  display: '10x R$17,90',  total: 179.00 },
  { count: 12, value: 14.70,  display: '12x R$14,70',  total: 176.40 },
]

// ── Ebook Gestação (add-on para parto) ─────────────────────────
export const EBOOK_GESTACAO_PRICE = 17.00

// ── Categoria Parto ─────────────────────────────────────────────
export const PARTO_PIX_PRICE = 67.00

export const PARTO_CARD_INSTALLMENTS = [
  { count: 1,  value: 67.00, display: '1x R$67,00',   total: 67.00  },
  { count: 2,  value: 34.90, display: '2x R$34,90',   total: 69.80  },
  { count: 3,  value: 23.90, display: '3x R$23,90',   total: 71.70  },
  { count: 4,  value: 18.90, display: '4x R$18,90',   total: 75.60  },
  { count: 6,  value: 12.00, display: '6x R$12,00',   total: 72.00  },
  { count: 8,  value: 9.90,  display: '8x R$9,90',    total: 79.20  },
  { count: 10, value: 8.10,  display: '10x R$8,10',   total: 81.00  },
  { count: 12, value: 6.70,  display: '12x R$6,70',   total: 80.40  },
]

export const PARTO_CHECKOUT_CONFIG = {
  productName: 'Aulas sobre o Parto — Gestar em Movimento',
  productDescription: 'Aulas completas de preparação para o parto com Dra. Fabiana Pinheiro',
  price: PARTO_PIX_PRICE,
  priceDisplay: 'R$ 67,00',
  features: [
    '10 aulas completas sobre o trabalho de parto',
    'Fases latente, ativa, transição e expulsivo',
    'Posições para o período expulsivo',
    'Exercícios para o trabalho de parto',
    'Orientações para parto cesáreo',
    'Orientações pós-parto',
    'Desenvolvido pela Dra. Fabiana Pinheiro',
    'Acesso pelo celular, tablet ou computador',
  ],
  guaranteeDays: 7,
}
