// Mock data for Gestar em Movimento

export interface User {
  id: string;
  name: string;
  week: number;
  dueDate: string;
  objectives: string[];
  discomforts: string[];
  avatar: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  trimester: '1º' | '2º' | '3º';
  duration: number; // minutes
  description: string;
  image: string;
  contraindications?: string;
  instructions?: string[];
  /**
   * YouTube video ID (11 chars) for unlisted video playback.
   * Optional — exercises without a video remain functional (image-only fallback).
   * Provider-agnostic field: future migration to Bunny.net / Mux will replace
   * this with a `video_provider` + `video_id` pair without breaking the API surface.
   */
  youtube_video_id?: string;
}

export interface CommunityPost {
  id: string;
  user_id?: string;
  author: string;
  week: number;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  category: string; // 'geral', '1º trimestre', '2º trimestre', '3º trimestre', 'pós-parto', 'trabalho-parto'
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Current user (you) - Mock
export const currentUser: User = {
  id: 'user-1',
  name: 'Você',
  week: 22,
  dueDate: '2024-12-15',
  objectives: ['preparar-para-parto', 'mobilidade', 'reduzir-ansiedade'],
  discomforts: ['dor-lombar', 'inchaço'],
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
};

// Mock exercises database
export const exercises: Exercise[] = [
  {
    id: 'ex-0',
    name: 'Olá, Mamãe! Bem-vinda ao Gestar em Movimento',
    category: 'introducao',
    trimester: '1º',
    duration: 3,
    description: 'Bem-vinda ao Gestar em Movimento! Conheça o app e aprenda como usá-lo para acompanhar sua jornada gestacional com exercícios, dicas e suporte profissional',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    youtube_video_id: '2MEkJ6CKuEE',
    instructions: [
      'Assista a mensagem de boas-vindas',
      'Conheça os principais recursos do app',
      'Entenda como os exercícios funcionam',
      'Comece sua jornada agora!'
    ]
  },
  {
    id: 'ex-1',
    name: 'Mobilidade Pélvica',
    category: 'pelve',
    trimester: '1º',
    duration: 8,
    description: 'Exercício básico para mobilizar a pelve e preparar para o parto',
    image: 'https://images.unsplash.com/photo-1544367567-0d6fcffe5d91?w=400&h=300&fit=crop',
    // MVP placeholder: real YouTube ID (11 chars). Replace with team's unlisted recording before launch.
    youtube_video_id: 'jNcC6rg0Zxw',
    instructions: [
      'Sente-se em posição confortável',
      'Faça movimentos circulares com a pelve',
      'Respire profundamente',
      'Repita 10-15 vezes'
    ]
  },
  {
    id: 'ex-2',
    name: 'Respiração Diafragmática',
    category: 'respiracao',
    trimester: '1º',
    duration: 5,
    description: 'Técnica de respiração para reduzir ansiedade e preparar para o parto',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    // MVP placeholder: real YouTube ID (11 chars). Replace with team's unlisted recording before launch.
    youtube_video_id: 'aXItOY0sLRY',
    instructions: [
      'Sente-se ou deite-se confortavelmente',
      'Inspire pelo nariz por 4 tempos',
      'Segure por 4 tempos',
      'Expire lentamente por 6 tempos'
    ]
  },
  {
    id: 'ex-3',
    name: 'Alongamento Lombar',
    category: 'costas',
    trimester: '2º',
    duration: 10,
    description: 'Alivie a dor nas costas e melhore a flexibilidade',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    // MVP placeholder: real YouTube ID (11 chars). Replace with team's unlisted recording before launch.
    youtube_video_id: '4pKly2JojMw',
    instructions: [
      'De pé, pernas afastadas',
      'Dobre o tronco lentamente',
      'Deixe os braços descer',
      'Mantenha por 30 segundos'
    ]
  },
  {
    id: 'ex-4',
    name: 'Assoalho Pélvico',
    category: 'assoalho-pelvico',
    trimester: '2º',
    duration: 8,
    description: 'Fortaleça o assoalho pélvico e prepare para o parto',
    image: 'https://images.unsplash.com/photo-1544367567-0d6fcffe5d91?w=400&h=300&fit=crop',
    contraindications: 'Evitar se sentir dor',
    // MVP placeholder: real YouTube ID (11 chars). Replace with team's unlisted recording before launch.
    youtube_video_id: 'pwZdH4yAY-Q',
    instructions: [
      'Sentada ou deitada',
      'Contraia o assoalho pélvico por 5 segundos',
      'Relaxe por 5 segundos',
      'Repita 10-15 vezes'
    ]
  },
  {
    id: 'ex-5',
    name: 'Agachamento para Parto',
    category: 'parto',
    trimester: '3º',
    duration: 10,
    description: 'Prepare o corpo para a posição de parto',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    // MVP placeholder: real YouTube ID (11 chars). Replace with team's unlisted recording before launch.
    youtube_video_id: 'YaXPRqUtMVE',
    instructions: [
      'De pé, pés afastados',
      'Desça lentamente em agachamento',
      'Mantenha a posição por 30 segundos',
      'Repita 5 vezes'
    ]
  },
  {
    id: 'ex-6',
    name: 'Relaxamento Progressivo',
    category: 'ansiedade',
    trimester: '3º',
    duration: 12,
    description: 'Reduza ansiedade com relaxamento progressivo',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    instructions: [
      'Deitada, comece pelos pés',
      'Contraia e relaxe cada grupo muscular',
      'Suba lentamente pelo corpo',
      'Termine com respiração profunda'
    ]
  },
  {
    id: 'ex-7',
    name: 'Fortalecimento Abdominal',
    category: 'core',
    trimester: '1º',
    duration: 7,
    description: 'Fortaleça o core para melhor suporte durante a gravidez',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    instructions: [
      'Deitada de costas, joelhos flexionados',
      'Levante a cabeça e ombros lentamente',
      'Mantenha por 5 segundos',
      'Repita 10-12 vezes'
    ]
  },
  {
    id: 'ex-8',
    name: 'Exercícios com Bola Suíça',
    category: 'pelve',
    trimester: '2º',
    duration: 15,
    description: 'Use a bola para melhorar equilíbrio e mobilidade',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    instructions: [
      'Sente-se na bola com pés apoiados',
      'Faça movimentos de balanço',
      'Mantenha o equilíbrio',
      'Pratique por 10-15 minutos'
    ]
  },
  {
    id: 'ex-9',
    name: 'Caminhada Pelviana',
    category: 'parto',
    trimester: '3º',
    duration: 20,
    description: 'Caminhada para estimular descida do bebê',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
    instructions: [
      'Caminhe em ritmo moderado',
      'Mantenha postura ereta',
      'Balance os quadris naturalmente',
      'Caminhe por 20-30 minutos'
    ]
  },
  {
    id: 'ex-10',
    name: 'Oi, eu sou a Fabiana - e vou te acompanhar nessa jornada',
    category: 'introducao',
    trimester: '1º',
    duration: 5,
    description: 'Conheça Fabiana Pinheiro, profissional especializada em saúde gestacional que vai acompanhar sua jornada no Gestar em Movimento',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    youtube_video_id: 'eOQkkBFLfa0',
    instructions: [
      'Assista a apresentação de Fabiana',
      'Conheça sua experiência e expertise',
      'Saiba como ela vai te acompanhar',
      'Pronto para começar os exercícios!'
    ]
  },
  {
    id: 'ex-11',
    name: 'Conheça o Gestar em Movimento: Seu Guia Diário de Bem-Estar na Gestação',
    category: 'introducao',
    trimester: '1º',
    duration: 6,
    description: 'Aprenda como usar o app Gestar em Movimento para acompanhar sua gestação com exercícios, dicas e suporte profissional',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=300&fit=crop',
    youtube_video_id: 'xYiNxucIvZc',
    instructions: [
      'Veja como navegar no app',
      'Conheça todas as funcionalidades',
      'Aprenda a usar dia a dia',
      'Comece a praticar agora!'
    ]
  },
];

// Mock community posts
export const communityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Mariana',
    week: 28,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    content: 'Consegui fazer 5 dias de práticas essa semana! 🎉 A dor nas costas diminuiu muito. Recomendo o alongamento lombar!',
    timestamp: '4h',
    likes: 24,
    comments: 18,
    category: '2º trimestre'
  },
  {
    id: 'post-2',
    author: 'Carla',
    week: 31,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    content: 'Alguém mais está sentindo dor na lomba todo final de tarde? O que tem ajudado vocês?',
    timestamp: '2h',
    likes: 12,
    comments: 8,
    category: 'geral'
  },
  {
    id: 'post-3',
    author: 'Juliana',
    week: 32,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    content: 'Estou com 28 semanas e completei meu primeiro desafio de 7 dias ativos! 🔥 Obrigada a todas vocês que me motivam aqui!',
    timestamp: '1h',
    likes: 45,
    comments: 12,
    category: '2º trimestre'
  },
  {
    id: 'post-4',
    author: 'Amanda',
    week: 15,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    content: 'Primeira gestação! Achei que ia ser difícil, mas as aulas são super acessíveis. Recomendo mesmo!',
    timestamp: '30min',
    likes: 31,
    comments: 9,
    category: '1º trimestre'
  },
  {
    id: 'post-5',
    author: 'Paula',
    week: 38,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    content: 'Faltam poucos dias para o parto e as técnicas de respiração estão me ajudando muito a acalmar! Vocês também usam?',
    timestamp: '3h',
    likes: 28,
    comments: 15,
    category: 'trabalho-parto'
  },
];

// Mock ranking data (by consistency, not performance)
export const ranking = [
  { position: 1, name: 'Mariana', activeDay: 28, points: 520, streak: 18 },
  { position: 2, name: 'Carla', activeDay: 31, points: 460, streak: 16 },
  { position: 3, name: 'Juliana', activeDay: 32, points: 410, streak: 14 },
  { position: 4, name: 'Você', activeDay: 22, points: 320, streak: 7 },
  { position: 5, name: 'Amanda', activeDay: 15, points: 280, streak: 12 },
  { position: 6, name: 'Paula', activeDay: 38, points: 450, streak: 15 },
  { position: 7, name: 'Beatriz', activeDay: 25, points: 360, streak: 9 },
  { position: 8, name: 'Carolina', activeDay: 20, points: 290, streak: 8 },
];

// Mock achievements
export const achievements: Achievement[] = [
  {
    id: 'ach-1',
    name: 'Primeira Semana',
    description: 'Complete 7 dias ativos',
    icon: '🎖️',
  },
  {
    id: 'ach-2',
    name: '30 Dias',
    description: 'Mantenha uma sequência de 30 dias',
    icon: '🏅',
  },
  {
    id: 'ach-3',
    name: 'Consistência 💪',
    description: 'Pratique por 10 dias diferentes',
    icon: '💪',
  },
  {
    id: 'ach-4',
    name: 'Exploradora',
    description: 'Participe da comunidade com comentários',
    icon: '🗣️',
  },
  {
    id: 'ach-5',
    name: 'Comunidade',
    description: 'Faça seu primeiro post',
    icon: '💬',
  },
];

// Pregnancy calendar data (per week)
export const pregnancyCalendar = {
  week22: {
    baby: 'Seu bebê agora pesa cerca de 500g. A audição está mais desenvolvida e pode ouvir sua voz!',
    body: 'Sua barriga está crescendo. Você pode sentir mais fadiga e inchaço nos pés. A dor nas costas é comum.',
    exercises: ['mobilidade-pelvica', 'alongamento-lombar'],
    tips: [
      'Mantenha a postura reta para evitar dor nas costas',
      'Use sapatos confortáveis',
      'Descanse os pés frequentemente'
    ]
  },
  week28: {
    baby: 'Seu bebê pesa cerca de 1kg. Está praticando movimentos respiratórios.',
    body: 'Você pode sentir inchaço e dificuldade para dormir. As contrações de treinamento podem começar.',
    exercises: ['respiracao-diafragmatica', 'assoalho-pelvico'],
    tips: [
      'Durma de lado para melhor circulação',
      'Pratique técnicas de respiração',
      'Aumente a ingestão de água'
    ]
  },
  week32: {
    baby: 'Seu bebé pesa cerca de 1.7kg. A maioria dos sistemas está funcionando como após o nascimento.',
    body: 'Você pode sentir mais cansaço. A azia pode ser comum. O nesting instinct pode aparecer.',
    exercises: ['agachamento-para-parto', 'relaxamento-progressivo'],
    tips: [
      'Prepare-se para o parto mentalmente',
      'Pratique posições para o parto',
      'Converse com seu terapeuta sobre medos'
    ]
  },
  week38: {
    baby: 'Seu bebê está pronto para nascer. Pesa cerca de 3kg. Pode estar se movimentando menos por falta de espaço.',
    body: 'Você pode estar com contrações mais fortes e frequentes. A bolsa pode romper a qualquer momento.',
    exercises: ['agachamento-para-parto', 'respiracao-diafragmatica'],
    tips: [
      'Esteja pronta para sinais de trabalho de parto',
      'Tenha um plano de nascimento pronto',
      'Use técnicas de relaxamento para controlar a dor'
    ]
  },
  week1: {
    baby: 'Seu bebê está começando sua jornada incrível!',
    body: 'Seu corpo pode ainda não apresentar mudanças visíveis.',
    tips: ['Comece a tomar ácido fólico', 'Evite álcool e tabaco', 'Agora é importante cuidar da sua saúde']
  },
  week10: {
    baby: 'Seu bebê já tem cerca de 5cm. Todos os órgãos principais estão formados!',
    body: 'Você pode sentir enjôos, cansaço e seios inchados.',
    tips: ['Coma refeições pequenas e frequentes', 'Descanse quando puder', 'Mantenha-se hidratada']
  },
  week13: {
    baby: 'Seu bebê pesa cerca de 30g e tem movimentos mais definidos.',
    body: 'O primeiro trimestre está terminando. O enjôo deve melhorar em breve.',
    tips: ['Comece a usar roupas gestantes', 'Fale com seu médico sobre exercícios', 'Considere aulas de preparação para o parto']
  },
  week16: {
    baby: 'Seu bebê pesa cerca de 100g. Os dedos das mãos e pés estão bem definidos!',
    body: 'Você pode estar sentindo uma leve barriguinha. A fadiga deve diminuir.',
    tips: ['Aplique hidratante no abdômen', 'Durma com um travesseiro de corpo', 'Faça exercícios leves regularmente']
  },
  week20: {
    baby: 'Seu bebê pesa cerca de 300g. Pode estar ouvindo sua voz!',
    body: 'Sua barriga está crescendo. Você pode sentir mais fome.',
    tips: ['Escolha alimentos nutritivos e saudáveis', 'Mantenha uma rotina de exercícios', 'Faça o ultrassom morfológico']
  },
  week25: {
    baby: 'Seu bebê pesa cerca de 700g e está praticando respiração!',
    body: 'O ganho de peso aumenta. Pode sentir inchaço nos pés.',
    tips: ['Use meias de compressão', 'Eleve os pés quando descansar', 'Consuma alimentos ricos em ferro']
  },
  week30: {
    baby: 'Seu bebê pesa cerca de 1,3kg e consegue abrir os olhos!',
    body: 'Você pode sentir Braxton Hicks. O cansaço aumenta novamente.',
    tips: ['Pratique técnicas de respiração', 'Durma sobre o lado esquerdo', 'Prepare seu quarto para o bebê']
  },
  week35: {
    baby: 'Seu bebê pesa cerca de 2,3kg e está em posição para o parto!',
    body: 'Você pode sentir mais pressão na pélvis e dificuldade para se mover.',
    tips: ['Pratique posições para o parto', 'Prepare sua mala para a maternidade', 'Converse com sua doula ou acompanhante']
  },
  week40: {
    baby: 'Seu bebé está pronto para nascer! Peso aproximado: 3,5kg.',
    body: 'Você está no final da gravidez e pode estar ansiosa para conhecer seu bebé.',
    tips: ['Ande para estimular o trabalho de parto', 'Permaneça calma e confiante', 'Seu bebê virá quando estiver pronto']
  }
};
