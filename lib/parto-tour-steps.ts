import type { TourStep } from './tour-steps'

export const partoTourSteps: TourStep[] = [
  {
    id: 'parto-welcome',
    route: '/home',
    emoji: '👋',
    title: 'Bem-vinda ao seu espaço!',
    description: 'Aqui você encontra tudo que precisa para chegar confiante e preparada no grande dia. Vamos te mostrar como aproveitar ao máximo!',
  },
  {
    id: 'parto-aulas',
    route: '/biblioteca',
    emoji: '🤱',
    title: 'Suas aulas de parto',
    description: 'Todas as suas aulas estão na Biblioteca. Acesse a categoria Parto e assista no seu ritmo — no celular, tablet ou computador.',
    hint: '↑ Toque em "Parto" para ver suas aulas',
  },
  {
    id: 'parto-sequencia',
    route: '/home',
    emoji: '🎯',
    title: 'Por onde começar',
    description: 'Comece pelos vídeos de boas-vindas aqui na Home. Em seguida, siga a ordem das aulas na Biblioteca — cada uma prepara você para a próxima.',
    hint: '↓ Toque em "Assistir agora" para começar',
  },
  {
    id: 'parto-progresso',
    route: '/progresso',
    emoji: '🏆',
    title: 'Seu progresso',
    description: 'Conforme você assiste as aulas, suas conquistas vão sendo desbloqueadas automaticamente. Acompanhe sua evolução aqui!',
    hint: '↑ Role para ver suas conquistas',
  },
  {
    id: 'parto-install',
    route: '/home',
    emoji: '📲',
    title: 'Adicione à tela inicial',
    description: 'Acesse suas aulas com um toque, como um app nativo — sem precisar abrir o navegador toda vez.',
    type: 'install',
  },
  {
    id: 'parto-upgrade',
    route: '/home',
    emoji: '💜',
    title: 'Quer ainda mais?',
    description: 'Além das aulas de parto, o app completo tem exercícios diários, meditação, respiração, assoalho pélvico e muito mais — tudo guiado pela Dra. Fabiana.',
    type: 'upgrade',
  },
]
