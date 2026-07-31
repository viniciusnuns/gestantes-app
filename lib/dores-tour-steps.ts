import type { TourStep } from './tour-steps'

export const doresTourSteps: TourStep[] = [
  {
    id: 'dores-welcome',
    route: '/home',
    emoji: '👋',
    title: 'Bem-vinda ao seu espaço!',
    description: 'Aqui você encontra as sequências de exercícios para aliviar as dores mais comuns da gestação. Vamos te mostrar como aproveitar ao máximo!',
  },
  {
    id: 'dores-aulas',
    route: '/biblioteca',
    emoji: '💜',
    title: 'Suas sequências para dores',
    description: 'Todas as suas aulas estão na Biblioteca. Acesse a categoria Dores e Bem-estar e assista no seu ritmo — no celular, tablet ou computador.',
    hint: '↑ Toque em "Dores" para ver suas sequências',
  },
  {
    id: 'dores-sequencia',
    route: '/home',
    emoji: '🎯',
    title: 'Por onde começar',
    description: 'Comece pelos vídeos de boas-vindas aqui na Home. Em seguida, vá direto para a sequência que corresponde à sua dor principal na Biblioteca.',
    hint: '↓ Toque em "Assistir agora" para começar',
  },
  {
    id: 'dores-progresso',
    route: '/progresso',
    emoji: '🏆',
    title: 'Seu progresso',
    description: 'Conforme você assiste as aulas, suas conquistas vão sendo desbloqueadas automaticamente. Acompanhe sua evolução aqui!',
    hint: '↑ Role para ver suas conquistas',
  },
  {
    id: 'dores-install',
    route: '/home',
    emoji: '📲',
    title: 'Adicione à tela inicial',
    description: 'Acesse suas aulas com um toque, como um app nativo — sem precisar abrir o navegador toda vez.',
    type: 'install',
  },
  {
    id: 'dores-app-completo',
    route: '/home',
    emoji: '🌟',
    title: 'O app tem muito mais',
    description: 'Além das sequências para dores, o app completo inclui:\n\n🤱 Aulas completas de preparação para o parto\n🧘 Meditação e relaxamento\n🫁 Técnicas de respiração\n🦵 Mobilidade e alongamento\n💪 Assoalho pélvico\n📚 Educação gestacional\n\nMais de 60 aulas para toda a sua gestação.',
  },
  {
    id: 'dores-done',
    route: '/home',
    emoji: '✨',
    title: 'Você está pronta!',
    description: 'Agora você conhece tudo que o app tem a oferecer. Que tal assistir à primeira sequência hoje? Seu corpo agradece! 🌸',
  },
]
