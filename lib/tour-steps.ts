export interface TourStep {
  id: string
  route: string
  emoji: string
  title: string
  description: string
  hint?: string // onde olhar na tela
}

export const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    route: '/home',
    emoji: '👋',
    title: 'Bem-vinda ao tour!',
    description: 'Vamos te mostrar tudo que o Gestar em Movimento tem a oferecer. Leva só 2 minutinhos!',
  },
  {
    id: 'avatar',
    route: '/home',
    emoji: '📸',
    title: 'Sua foto de perfil',
    description: 'Veja o círculo com seu avatar no canto superior esquerdo? Toque nele para trocar sua foto de perfil.',
    hint: '↖ Toque no seu avatar',
  },
  {
    id: 'whatsapp',
    route: '/home',
    emoji: '💬',
    title: 'Fale com a especialista',
    description: 'Ao tocar no avatar, aparece o menu com a opção "Falar com suporte". Ali você conversa direto com a Dra. Fabiana pelo WhatsApp!',
    hint: '↖ Avatar → Falar com suporte',
  },
  {
    id: 'trilha',
    route: '/home',
    emoji: '🎯',
    title: 'Trilha de introdução',
    description: 'O card "Comece por aqui" tem 5 vídeos essenciais para você começar bem. Assista em ordem — eles foram feitos especialmente para a sua chegada!',
    hint: '↑ Card "Comece por aqui"',
  },
  {
    id: 'exercicios-hoje',
    route: '/home',
    emoji: '💪',
    title: 'Exercícios de hoje',
    description: 'Toda manhã, 3 exercícios são selecionados para você. Eles são exatamente os mesmos que aparecem no Calendário do dia — tudo sincronizado!',
    hint: '↓ Role para ver os exercícios do dia',
  },
  {
    id: 'meta-semanal',
    route: '/home',
    emoji: '🏅',
    title: 'Meta semanal',
    description: 'Seu objetivo é praticar 5 dias por semana. Cada exercício concluído gera pontos que sobem no ranking. Quanto mais consistente, mais você avança!',
    hint: '↑ Card "Meta semanal"',
  },
  {
    id: 'calendario-cores',
    route: '/calendario',
    emoji: '📅',
    title: 'Calendário colorido',
    description: 'Seu calendário conta sua história! Cada dia que você pratica ganha uma cor:\n\n🟡 Amarelo = 1 ou 2 exercícios feitos\n🟢 Verde = 3 exercícios — dia completo!\n\nUma semana cheia de verde é uma semana de muito amor pelo seu bebê. 💚',
    hint: '↑ Veja as cores nos dias',
  },
  {
    id: 'calendario-amanha',
    route: '/calendario',
    emoji: '🔄',
    title: 'Novas atividades todo dia',
    description: 'No dia seguinte, 3 novos exercícios aparecem automaticamente. Cada dia é uma nova oportunidade para cuidar de você e do seu bebê! 💚',
    hint: '↑ Toque em outro dia para ver',
  },
  {
    id: 'biblioteca',
    route: '/biblioteca',
    emoji: '📚',
    title: 'Biblioteca de exercícios',
    description: 'Aqui ficam todos os exercícios organizados por categoria e trimestre. Além dos 3 do dia, você pode fazer qualquer exercício da biblioteca quando quiser!',
    hint: '↑ Explore as categorias',
  },
  {
    id: 'ranking',
    route: '/progresso',
    emoji: '🏆',
    title: 'Ranking da comunidade',
    description: 'Veja onde você está no ranking Semanal, Mensal e Geral. Cada exercício concluído gera pontos — quanto mais você pratica, mais sobe na lista!',
    hint: '↑ Alterne entre Semanal, Mensal e Geral',
  },
  {
    id: 'conquistas',
    route: '/progresso',
    emoji: '🎖️',
    title: 'Conquistas',
    description: 'Conforme você avança, conquistas são desbloqueadas automaticamente. Você pode compartilhar cada uma pelo WhatsApp, Instagram e mais!',
    hint: '↑ Role para ver suas conquistas',
  },
  {
    id: 'done',
    route: '/home',
    emoji: '✨',
    title: 'Você está pronta!',
    description: 'Agora você conhece tudo que o app tem a oferecer. Que tal começar pelo primeiro exercício do dia? Seu bebê já está torcendo por você! 🌸',
  },
]
