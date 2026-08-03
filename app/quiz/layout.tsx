import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz: Descubra seu Índice de Preparação para o Parto',
  description: 'Responda 7 perguntas e descubra em 2 minutos o quanto você está preparada para o parto — e o que ainda pode melhorar.',
  openGraph: {
    title: 'Descubra seu Índice de Preparação para o Parto',
    description: 'Responda 7 perguntas e descubra em 2 minutos o quanto você está preparada para o parto — e o que ainda pode melhorar.',
    images: [{ url: 'https://gestaremovimento.com.br/quiz-og.jpg', width: 1200, height: 630 }],
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Descubra seu Índice de Preparação para o Parto',
    description: 'Responda 7 perguntas e descubra em 2 minutos o quanto você está preparada para o parto.',
    images: ['https://gestaremovimento.com.br/quiz-og.jpg'],
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
