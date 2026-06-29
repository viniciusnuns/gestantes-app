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
  trimester: '1º' | '2º' | '3º' | 'todos' | '2º-3º' | '1º-2º';
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

// Exercises database
export const exercises: Exercise[] = [
  {
    id: 'ex-0',
    name: 'Olá, Mamãe! Bem-vinda ao Gestar em Movimento',
    category: 'introducao',
    trimester: '1º',
    duration: 3,
    description: 'Bem-vinda ao Gestar em Movimento! Conheça o app e aprenda como usá-lo para acompanhar sua jornada gestacional com exercícios, dicas e suporte profissional',
    image: 'https://img.youtube.com/vi/2MEkJ6CKuEE/hqdefault.jpg?v=2',
    youtube_video_id: '2MEkJ6CKuEE',
    instructions: [
      'Assista a mensagem de boas-vindas',
      'Conheça os principais recursos do app',
      'Entenda como os exercícios funcionam',
      'Comece sua jornada agora!'
    ]
  },
  {
    id: 'ex-10',
    name: 'Oi, eu sou a Fabiana - e vou te acompanhar nessa jornada',
    category: 'introducao',
    trimester: '1º',
    duration: 5,
    description: 'Conheça Fabiana Pinheiro, profissional especializada em saúde gestacional que vai acompanhar sua jornada no Gestar em Movimento',
    image: 'https://img.youtube.com/vi/eOQkkBFLfa0/hqdefault.jpg',
    youtube_video_id: 'eOQkkBFLfa0',
    instructions: [
      'Assista a apresentação de Fabiana',
      'Conheça sua experiência e expertise',
      'Saiba como ela vai te acompanhar',
      'Pronto para começar os exercícios!'
    ]
  },
  {
    id: 'ex-12',
    name: 'Orientações sobre os exercícios',
    category: 'introducao',
    trimester: 'todos',
    duration: 3,
    description: 'Entenda como os exercícios foram organizados no app e como aproveitá-los ao máximo durante sua gestação',
    image: 'https://img.youtube.com/vi/w86CFsQzrPU/hqdefault.jpg',
    youtube_video_id: 'w86CFsQzrPU',
    instructions: [
      'Assista as orientações gerais',
      'Entenda a organização dos exercícios',
      'Siga as recomendações da especialista',
      'Comece sua prática com segurança'
    ]
  },
  {
    id: 'ex-11',
    name: 'Conheça o Gestar em Movimento: Seu Guia Diário de Bem-Estar na Gestação',
    category: 'introducao',
    trimester: '1º',
    duration: 3,
    description: 'Aprenda como usar o app Gestar em Movimento para acompanhar sua gestação com exercícios, dicas e suporte profissional',
    image: 'https://img.youtube.com/vi/xYiNxucIvZc/hqdefault.jpg',
    youtube_video_id: 'xYiNxucIvZc',
    instructions: [
      'Veja como navegar no app',
      'Conheça todas as funcionalidades',
      'Aprenda a usar dia a dia',
      'Comece a praticar agora!'
    ]
  },
  {
    id: 'ex-13',
    name: 'Seu 1º Trimestre começa aqui — orientações para essa nova fase',
    category: 'introducao',
    trimester: '1º',
    duration: 6,
    description: 'Entenda o que seu corpo está vivendo no primeiro trimestre e como praticar os exercícios com segurança nessa fase inicial',
    image: 'https://img.youtube.com/vi/aJkA9R12IFE/hqdefault.jpg',
    youtube_video_id: 'aJkA9R12IFE',
    instructions: [
      'Assista as orientações do 1º trimestre',
      'Entenda as mudanças do seu corpo',
      'Siga as recomendações de segurança',
      'Comece os exercícios com consciência'
    ]
  },
  {
    id: 'ex-14',
    name: 'Bem-vinda ao 2º Trimestre: A fase mais ativa da sua gestação',
    category: 'introducao',
    trimester: '2º',
    duration: 5,
    description: 'Chegou a fase mais energética da gestação! Saiba como aproveitar esse momento para intensificar sua prática de exercícios',
    image: 'https://img.youtube.com/vi/j4OqpjDQ5to/hqdefault.jpg',
    youtube_video_id: 'j4OqpjDQ5to',
    instructions: [
      'Assista as orientações do 2º trimestre',
      'Conheça os exercícios recomendados para essa fase',
      'Entenda como seu corpo mudou',
      'Prepare-se para uma prática mais ativa'
    ]
  },
  {
    id: 'ex-15',
    name: 'Bem-vinda ao 3º Trimestre: Preparando o corpo para o grande dia',
    category: 'introducao',
    trimester: '3º',
    duration: 5,
    description: 'Reta final! Saiba como adaptar sua prática de exercícios para preparar o corpo e a mente para o parto',
    image: 'https://img.youtube.com/vi/FmPn70sWJFA/hqdefault.jpg',
    youtube_video_id: 'FmPn70sWJFA',
    instructions: [
      'Assista as orientações do 3º trimestre',
      'Entenda como preparar o corpo para o parto',
      'Siga as adaptações recomendadas',
      'Chegue ao grande dia com confiança'
    ]
  },
  {
    id: 'ex-16',
    name: 'Conhecendo o assoalho pélvico',
    category: 'educacao',
    trimester: 'todos',
    duration: 4,
    description: 'Entenda o que é o assoalho pélvico, sua importância durante a gestação e como cuidar dessa região essencial para o seu bem-estar',
    image: 'https://img.youtube.com/vi/dIIgn52N0e0/hqdefault.jpg',
    youtube_video_id: 'dIIgn52N0e0',
    instructions: [
      'Assista a aula completa',
      'Conheça a anatomia do assoalho pélvico',
      'Entenda sua função na gestação',
      'Aplique o conhecimento nos exercícios'
    ]
  },
  {
    id: 'ex-17',
    name: 'Dores na gestação: o que fazer',
    category: 'educacao',
    trimester: 'todos',
    duration: 4,
    description: 'Entenda as dores mais comuns na gestação, suas causas e o que você pode fazer para aliviá-las com segurança',
    image: 'https://img.youtube.com/vi/SZUR56kTzCA/hqdefault.jpg',
    youtube_video_id: 'SZUR56kTzCA',
    instructions: [
      'Assista a aula completa',
      'Identifique os tipos de dor na gestação',
      'Conheça as formas de alívio seguras',
      'Saiba quando procurar o médico'
    ]
  },
  {
    id: 'ex-18',
    name: 'Edemas na gestação',
    category: 'educacao',
    trimester: 'todos',
    duration: 7,
    description: 'Entenda por que os edemas acontecem na gestação, como identificá-los e o que fazer para reduzir o inchaço com segurança',
    image: 'https://img.youtube.com/vi/6RnIvLsc5mk/hqdefault.jpg',
    youtube_video_id: '6RnIvLsc5mk',
    instructions: [
      'Assista a aula completa',
      'Entenda as causas dos edemas na gestação',
      'Conheça as estratégias para reduzir o inchaço',
      'Saiba quando os edemas exigem atenção médica'
    ]
  },
  {
    id: 'ex-19',
    name: 'Alterações na respiração na gestação',
    category: 'educacao',
    trimester: 'todos',
    duration: 3,
    description: 'Entenda por que a respiração muda durante a gestação e como adaptar sua prática para respirar melhor em cada fase',
    image: 'https://img.youtube.com/vi/yiw2z56790A/hqdefault.jpg',
    youtube_video_id: 'yiw2z56790A',
    instructions: [
      'Assista a aula completa',
      'Entenda as mudanças respiratórias na gestação',
      'Aprenda a adaptar sua respiração',
      'Aplique as técnicas nos exercícios'
    ]
  },
  {
    id: 'ex-20',
    name: 'Alterações na pelve na gestação',
    category: 'educacao',
    trimester: 'todos',
    duration: 5,
    description: 'Compreenda as mudanças que acontecem na pelve durante a gestação e como isso afeta seus movimentos e sua prática de exercícios',
    image: 'https://img.youtube.com/vi/F9hzrHhqGLI/hqdefault.jpg',
    youtube_video_id: 'F9hzrHhqGLI',
    instructions: [
      'Assista a aula completa',
      'Entenda as alterações pélvicas na gestação',
      'Conheça os impactos no dia a dia',
      'Adapte seus movimentos com segurança'
    ]
  },
  {
    id: 'ex-21',
    name: 'Diástase abdominal na gestação',
    category: 'educacao',
    trimester: 'todos',
    duration: 4,
    description: 'Entenda o que é a diástase abdominal, por que ela acontece na gestação e como prevenir e tratar com segurança',
    image: 'https://img.youtube.com/vi/VRQykzuy5yk/hqdefault.jpg',
    youtube_video_id: 'VRQykzuy5yk',
    instructions: [
      'Assista a aula completa',
      'Entenda o que é a diástase abdominal',
      'Conheça os fatores de risco na gestação',
      'Saiba como prevenir e cuidar com segurança'
    ]
  },
  // ── Exercícios reais (recuperados da produção) ──────────────────────────
  {
    id: 'ex-22',
    name: 'Exercício de respiração diafragmática',
    category: 'respiracao',
    trimester: 'todos',
    duration: 6,
    description: 'Aprenda a técnica de respiração diafragmática para reduzir a ansiedade, melhorar a oxigenação e se preparar para o parto',
    image: 'https://img.youtube.com/vi/5rrgzMKIeyQ/hqdefault.jpg',
    youtube_video_id: '5rrgzMKIeyQ',
    instructions: ['Deite ou sente-se confortavelmente', 'Coloque uma mão no abdômen', 'Inspire pelo nariz, sentindo o abdômen expandir', 'Expire lentamente pela boca']
  },
  {
    id: 'ex-23',
    name: 'Exercício respiratório para alívio de ansiedade e dor',
    category: 'respiracao',
    trimester: 'todos',
    duration: 4,
    description: 'Técnica respiratória para reduzir ansiedade e aliviar a dor durante a gestação e o trabalho de parto',
    image: 'https://img.youtube.com/vi/bHae27HNlyk/hqdefault.jpg',
    youtube_video_id: 'bHae27HNlyk',
    instructions: ['Sente-se ou deite-se confortavelmente', 'Inspire lentamente pelo nariz contando até 4', 'Segure o ar por 2 segundos', 'Expire pela boca contando até 6']
  },
  {
    id: 'ex-24',
    name: 'Exercícios de expansão pulmonar',
    category: 'respiracao',
    trimester: 'todos',
    duration: 3,
    description: 'Exercícios para expandir a capacidade pulmonar durante a gestação, melhorando a oxigenação e o bem-estar',
    image: 'https://img.youtube.com/vi/psPPR2l6CJI/hqdefault.jpg',
    youtube_video_id: 'psPPR2l6CJI',
    instructions: ['Sente-se com a coluna ereta', 'Inspire profundamente expandindo o tórax', 'Segure por 3 segundos', 'Expire lentamente esvaziando completamente']
  },
  {
    id: 'ex-25',
    name: 'Exercícios de consciência de contração e relaxamento dos músculos do assoalho pélvico',
    category: 'assoalho-pelvico',
    trimester: 'todos',
    duration: 8,
    description: 'Desenvolva a consciência corporal do assoalho pélvico através de exercícios de contração e relaxamento para a gestação e o parto',
    image: 'https://img.youtube.com/vi/E3cxaEFroRs/hqdefault.jpg',
    youtube_video_id: 'E3cxaEFroRs',
    instructions: ['Sente-se ou deite-se confortavelmente', 'Identifique os músculos do assoalho pélvico', 'Contraia suavemente por 5 segundos', 'Relaxe completamente por 10 segundos']
  },
  {
    id: 'ex-26',
    name: 'Exercício respiratório para alívio de dor no parto',
    category: 'respiracao',
    trimester: 'todos',
    duration: 2,
    description: 'Técnica respiratória específica para aliviar a dor durante as contrações no trabalho de parto',
    image: 'https://img.youtube.com/vi/nc_OhIZMAKE/hqdefault.jpg',
    youtube_video_id: 'nc_OhIZMAKE',
    instructions: ['Inspire profundamente pelo nariz', 'Expire lentamente pela boca durante a contração', 'Mantenha o foco na respiração', 'Repita em cada contração']
  },
  {
    id: 'ex-27',
    name: 'Exercício de mobilidade pélvica de cócoras',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 2,
    description: 'Exercício de cócoras para aumentar a mobilidade pélvica e preparar o corpo para o parto no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/pY-SV5qRfJo/hqdefault.jpg',
    youtube_video_id: 'pY-SV5qRfJo',
    instructions: ['Fique de pé com os pés afastados na largura dos ombros', 'Desça lentamente para a posição de cócoras', 'Mantenha os calcanhares no chão', 'Segure a posição e suba com controle']
  },
  {
    id: 'ex-28',
    name: 'Exercício de mobilidade pélvica de cócoras associado',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 2,
    description: 'Variação do exercício de cócoras com movimentos associados para maior mobilidade pélvica e preparação para o parto',
    image: 'https://img.youtube.com/vi/6GN1p4NOHlY/hqdefault.jpg',
    youtube_video_id: '6GN1p4NOHlY',
    instructions: ['Fique de pé com os pés afastados', 'Desça para a posição de cócoras', 'Associe movimentos de braços e pelve', 'Suba com controle e repita']
  },
  {
    id: 'ex-29',
    name: 'Exercício de mobilidade pélvica de cócoras na ponta dos pés',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 5,
    description: 'Exercício de cócoras na ponta dos pés para mobilidade pélvica, equilíbrio e preparação para o parto no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/2eUOjDPqXyA/hqdefault.jpg',
    youtube_video_id: '2eUOjDPqXyA',
    instructions: ['Fique de pé com os pés juntos', 'Suba na ponta dos pés', 'Desça lentamente para a posição de cócoras', 'Mantenha o equilíbrio e suba com controle']
  },
  {
    id: 'ex-30',
    name: 'Exercício de mobilidade pélvica caminhando de cócoras',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 2,
    description: 'Exercício dinâmico de mobilidade pélvica caminhando na posição de cócoras para preparação para o parto',
    image: 'https://img.youtube.com/vi/mteM7MbhFkw/hqdefault.jpg',
    youtube_video_id: 'mteM7MbhFkw',
    instructions: ['Desça para a posição de cócoras', 'Caminhe para frente e para trás mantendo a posição', 'Mantenha as costas eretas', 'Repita por 1-2 minutos']
  },
  {
    id: 'ex-31',
    name: 'Exercício de mobilidade de quadril com rotação interna e externa',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 3,
    description: 'Exercício de rotação interna e externa do quadril para aumentar a mobilidade pélvica e reduzir desconfortos no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/3eeOT7r7wVs/hqdefault.jpg',
    youtube_video_id: '3eeOT7r7wVs',
    instructions: ['Deite de costas com os joelhos dobrados', 'Gire os joelhos para dentro (rotação interna)', 'Gire os joelhos para fora (rotação externa)', 'Repita o movimento de forma controlada']
  },
  {
    id: 'ex-32',
    name: 'Exercício de mobilidade pélvica de joelhos',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 7,
    description: 'Exercícios de mobilidade pélvica realizados de joelhos para aliviar desconfortos e preparar o corpo para o parto',
    image: 'https://img.youtube.com/vi/6hZ_IvDDkdA/hqdefault.jpg',
    youtube_video_id: '6hZ_IvDDkdA',
    instructions: ['Ajoelhe-se em superfície confortável', 'Realize movimentos circulares com a pelve', 'Incline o tronco para frente e para trás', 'Mantenha o ritmo suave e controlado']
  },
  {
    id: 'ex-33',
    name: 'Exercício de mobilidade pélvica sentada na bola',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 8,
    description: 'Exercícios de mobilidade pélvica utilizando a bola suíça para maior amplitude de movimento e alívio de desconfortos',
    image: 'https://img.youtube.com/vi/7bRkQEMN4jA/hqdefault.jpg',
    youtube_video_id: '7bRkQEMN4jA',
    instructions: ['Sente-se na bola com os pés apoiados no chão', 'Realize movimentos circulares com a pelve', 'Varie a direção e amplitude dos movimentos', 'Mantenha a respiração tranquila durante o exercício']
  },
  {
    id: 'ex-34',
    name: 'Alongamento das pernas e coluna sentada',
    category: 'alongamento',
    trimester: 'todos',
    duration: 9,
    description: 'Alongamento completo de pernas e coluna na posição sentada, indicado para todos os trimestres para aliviar tensões e melhorar a postura',
    image: 'https://img.youtube.com/vi/RvdVSu8oYxs/hqdefault.jpg',
    youtube_video_id: 'RvdVSu8oYxs',
    instructions: ['Sente-se no chão com as pernas estendidas', 'Incline o tronco suavemente para frente', 'Segure o alongamento por 20-30 segundos', 'Respire profundamente e relaxe na expiração']
  },
  {
    id: 'ex-35',
    name: 'Alongamento da coluna sentada sem bola',
    category: 'alongamento',
    trimester: 'todos',
    duration: 5,
    description: 'Alongamento da coluna vertebral na posição sentada, sem necessidade de equipamentos, indicado para todos os trimestres',
    image: 'https://img.youtube.com/vi/lHM22wwdCH8/hqdefault.jpg',
    youtube_video_id: 'lHM22wwdCH8',
    instructions: ['Sente-se com a coluna ereta', 'Incline o tronco suavemente para frente', 'Alongue a coluna de forma progressiva', 'Mantenha por 20-30 segundos e volte devagar']
  },
  {
    id: 'ex-36',
    name: 'Alongamento da coluna sentada',
    category: 'alongamento',
    trimester: '2º-3º',
    duration: 9,
    description: 'Alongamento completo da coluna vertebral na posição sentada, adaptado para o 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/noJSoZIQnu0/hqdefault.jpg',
    youtube_video_id: 'noJSoZIQnu0',
    instructions: ['Sente-se confortavelmente com apoio', 'Alongue a coluna progressivamente', 'Inclua rotações suaves do tronco', 'Respire profundamente em cada movimento']
  },
  {
    id: 'ex-37',
    name: 'Alongamento da coluna sentada com bola',
    category: 'alongamento',
    trimester: '2º-3º',
    duration: 4,
    description: 'Alongamento da coluna utilizando a bola suíça como apoio, para maior amplitude e conforto no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/rieGnFlITas/hqdefault.jpg',
    youtube_video_id: 'rieGnFlITas',
    instructions: ['Sente-se na bola com os pés apoiados', 'Alongue a coluna para cima e para frente', 'Use a bola para suporte e equilíbrio', 'Mantenha cada posição por 20-30 segundos']
  },
  {
    id: 'ex-38',
    name: 'Mobilidade de pelve e coluna sentada',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 7,
    description: 'Exercício combinado de mobilidade de pelve e coluna na posição sentada para aliviar tensões e preparar para o parto',
    image: 'https://img.youtube.com/vi/H3eMlIY8iHw/hqdefault.jpg',
    youtube_video_id: 'H3eMlIY8iHw',
    instructions: ['Sente-se confortavelmente com a coluna ereta', 'Realize movimentos de retroversão e anteversão da pelve', 'Associe movimentos suaves da coluna', 'Mantenha a respiração ritmada durante o exercício']
  },
  {
    id: 'ex-39',
    name: 'Alongamento de pernas e coluna em pé',
    category: 'alongamento',
    trimester: '2º-3º',
    duration: 5,
    description: 'Alongamento de pernas e coluna na posição em pé, adaptado para o 2º e 3º trimestre para aliviar tensões e melhorar a postura',
    image: 'https://img.youtube.com/vi/O4-yQYVvqLM/hqdefault.jpg',
    youtube_video_id: 'O4-yQYVvqLM',
    instructions: ['Fique de pé com apoio se necessário', 'Alongue uma perna de cada vez', 'Inclua o alongamento da coluna em extensão', 'Respire profundamente e mantenha cada posição']
  },
  {
    id: 'ex-40',
    name: 'Alongamento de pernas em pé',
    category: 'alongamento',
    trimester: '2º-3º',
    duration: 7,
    description: 'Alongamento focado nas pernas na posição em pé, para aliviar tensões, câimbras e desconfortos comuns no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/oCxilWBsLQw/hqdefault.jpg',
    youtube_video_id: 'oCxilWBsLQw',
    instructions: ['Fique de pé próxima a uma parede para apoio', 'Alongue a panturrilha e a coxa de cada perna', 'Mantenha cada alongamento por 20-30 segundos', 'Respire profundamente e troque de lado']
  },
  {
    id: 'ex-41',
    name: 'Exercício de mobilidade de quadril em pé',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 3,
    description: 'Exercício de mobilidade do quadril na posição em pé para aliviar desconfortos e aumentar a amplitude de movimento no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/q10CiJ0JbO4/hqdefault.jpg',
    youtube_video_id: 'q10CiJ0JbO4',
    instructions: ['Fique de pé com os pés afastados na largura dos quadris', 'Realize círculos com o quadril', 'Varie o sentido e a amplitude', 'Mantenha o peso distribuído nos dois pés']
  },
  {
    id: 'ex-42',
    name: 'Exercício de mobilidade de coluna em pé',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 2,
    description: 'Exercício de mobilidade da coluna vertebral na posição em pé para aliviar tensões e melhorar a postura no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/DRyG7Z4IIeM/hqdefault.jpg',
    youtube_video_id: 'DRyG7Z4IIeM',
    instructions: ['Fique de pé com os pés afastados na largura dos ombros', 'Realize flexão e extensão suave da coluna', 'Inclua inclinações laterais', 'Movimente-se de forma lenta e controlada']
  },
  {
    id: 'ex-43',
    name: 'Alongamentos de pernas e coluna deitada',
    category: 'alongamento',
    trimester: '1º-2º',
    duration: 10,
    description: 'Alongamento completo de pernas e coluna na posição deitada, indicado para o 1º e 2º trimestre para aliviar tensões e melhorar o bem-estar',
    image: 'https://img.youtube.com/vi/wuLGkmSzO84/hqdefault.jpg',
    youtube_video_id: 'wuLGkmSzO84',
    instructions: ['Deite de costas em superfície confortável', 'Alongue uma perna de cada vez', 'Inclua o alongamento da coluna', 'Mantenha cada posição por 20-30 segundos']
  },
  {
    id: 'ex-44',
    name: 'Exercício de mobilidade de pelve e coluna deitada com a bola',
    category: 'mobilidade',
    trimester: '1º-2º',
    duration: 9,
    description: 'Exercício de mobilidade de pelve e coluna na posição deitada utilizando a bola suíça para maior amplitude de movimento no 1º e 2º trimestre',
    image: 'https://img.youtube.com/vi/cfaQQ5Llg_s/hqdefault.jpg',
    youtube_video_id: 'cfaQQ5Llg_s',
    instructions: ['Deite de costas com a bola entre as pernas ou sob a pelve', 'Realize movimentos suaves de pelve', 'Associe movimentos da coluna', 'Mantenha o ritmo lento e a respiração tranquila']
  },
  {
    id: 'ex-45',
    name: 'Exercício de mobilidade com a ponte',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 7,
    description: 'Exercício de ponte para mobilidade pélvica, fortalecimento do assoalho pélvico e alívio de dores lombares no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/whGzQDHCyFk/hqdefault.jpg',
    youtube_video_id: 'whGzQDHCyFk',
    instructions: ['Deite de costas com os joelhos dobrados', 'Eleve o quadril lentamente', 'Mantenha a posição por alguns segundos', 'Desça com controle e repita']
  },
  {
    id: 'ex-46',
    name: 'Exercícios para o bebê virar',
    category: 'apoio',
    trimester: '3º',
    duration: 13,
    description: 'Exercícios específicos para auxiliar o bebê a se posicionar corretamente para o parto durante o 3º trimestre',
    image: 'https://img.youtube.com/vi/-TXhd7BlD2M/hqdefault.jpg',
    youtube_video_id: '-TXhd7BlD2M',
    instructions: ['Realize as posições indicadas pela especialista', 'Mantenha cada posição pelo tempo recomendado', 'Respire profundamente durante os exercícios', 'Pratique diariamente para melhores resultados']
  },
  {
    id: 'ex-47',
    name: 'Exercício de mobilidade pélvica de cócoras e coluna na bola',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 4,
    description: 'Exercício combinado de cócoras e mobilidade de coluna utilizando a bola suíça para maior amplitude e conforto no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/9hwYh-ImgGk/hqdefault.jpg',
    youtube_video_id: '9hwYh-ImgGk',
    instructions: ['Use a bola como apoio para descer em cócoras', 'Realize movimentos de mobilidade da coluna', 'Combine os movimentos de pelve e coluna', 'Mantenha a respiração tranquila durante o exercício']
  },
  {
    id: 'ex-48',
    name: 'Exercício de mobilidade pélvica de quatro apoios na bola',
    category: 'mobilidade',
    trimester: '3º',
    duration: 4,
    description: 'Exercício de mobilidade pélvica na posição de quatro apoios com suporte da bola suíça, ideal para aliviar pressão e preparar para o parto no 3º trimestre',
    image: 'https://img.youtube.com/vi/JA181TQp5fE/hqdefault.jpg',
    youtube_video_id: 'JA181TQp5fE',
    instructions: ['Apoie as mãos na bola na posição de quatro apoios', 'Realize movimentos circulares com a pelve', 'Varie a amplitude e direção dos movimentos', 'Mantenha a respiração ritmada e relaxada']
  },
  {
    id: 'ex-49',
    name: 'Exercício de mobilidade pélvica de quatro apoios na bola (parte 2)',
    category: 'mobilidade',
    trimester: '3º',
    duration: 6,
    description: 'Continuação dos exercícios de mobilidade pélvica de quatro apoios com a bola suíça, aprofundando os movimentos para o 3º trimestre',
    image: 'https://img.youtube.com/vi/IBzBZpwWW4s/hqdefault.jpg',
    youtube_video_id: 'IBzBZpwWW4s',
    instructions: ['Apoie as mãos na bola na posição de quatro apoios', 'Realize os movimentos da parte 2 com a especialista', 'Mantenha o ritmo suave e confortável', 'Respire profundamente durante todo o exercício']
  },
  {
    id: 'ex-50',
    name: 'Exercício de agachamento com a bola',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 5,
    description: 'Agachamento com suporte da bola suíça para mobilidade pélvica, fortalecimento e preparação para o parto no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/WSpFmIgW45Q/hqdefault.jpg',
    youtube_video_id: 'WSpFmIgW45Q',
    instructions: ['Posicione a bola entre as costas e a parede', 'Desça em agachamento com apoio da bola', 'Mantenha os joelhos alinhados com os pés', 'Suba com controle e repita']
  },
  {
    id: 'ex-51',
    name: 'Exercício de ativação abdominal na gestação',
    category: 'abdominal',
    trimester: '2º-3º',
    duration: 7,
    description: 'Exercícios seguros de ativação abdominal adaptados para a gestação no 2º e 3º trimestre, fortalecendo o core sem riscos',
    image: 'https://img.youtube.com/vi/fF08KbjKhF4/hqdefault.jpg',
    youtube_video_id: 'fF08KbjKhF4',
    instructions: ['Posicione-se conforme orientação da especialista', 'Ative o abdômen de forma suave e consciente', 'Mantenha a respiração contínua durante o exercício', 'Evite tensão excessiva na região abdominal']
  },
  {
    id: 'ex-52',
    name: 'Exercício de ativação abdominal com faixa sentada',
    category: 'abdominal',
    trimester: '2º-3º',
    duration: 7,
    description: 'Ativação abdominal segura com faixa elástica na posição sentada, fortalecendo o core de forma adaptada para o 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/OXNRUaXx3QU/hqdefault.jpg',
    youtube_video_id: 'OXNRUaXx3QU',
    instructions: ['Sente-se com a coluna ereta e a faixa posicionada', 'Ative o abdômen ao puxar a faixa', 'Mantenha a respiração contínua', 'Realize o movimento de forma controlada']
  },
  {
    id: 'ex-53',
    name: 'Exercício de ativação abdominal em pé com faixa',
    category: 'abdominal',
    trimester: '2º-3º',
    duration: 8,
    description: 'Ativação abdominal com faixa elástica na posição em pé, fortalecendo o core de forma segura e adaptada para o 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/4JiNYV7eO2U/hqdefault.jpg',
    youtube_video_id: '4JiNYV7eO2U',
    instructions: ['Fique de pé com a faixa posicionada', 'Ative o abdômen ao realizar o movimento', 'Mantenha a postura ereta durante o exercício', 'Respire de forma contínua e controlada']
  },
  {
    id: 'ex-54',
    name: 'Exercício de mobilidade pélvica e coluna de joelhos com a bola',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 5,
    description: 'Exercício combinado de mobilidade pélvica e coluna de joelhos com suporte da bola suíça para o 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/MptERfMwnF8/hqdefault.jpg',
    youtube_video_id: 'MptERfMwnF8',
    instructions: ['Ajoelhe-se com as mãos apoiadas na bola', 'Realize movimentos circulares com a pelve', 'Associe movimentos de flexão e extensão da coluna', 'Mantenha o ritmo suave e a respiração ritmada']
  },
  {
    id: 'ex-55',
    name: 'Exercício de mobilidade pélvica em pé no banco',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 9,
    description: 'Exercício de mobilidade pélvica em pé com apoio no banco para maior segurança e amplitude de movimento no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/3U4AkfI9G6I/hqdefault.jpg',
    youtube_video_id: '3U4AkfI9G6I',
    instructions: ['Fique de pé com uma perna apoiada no banco', 'Realize movimentos circulares com a pelve', 'Mantenha o equilíbrio com apoio das mãos', 'Troque de lado e repita']
  },
  {
    id: 'ex-56',
    name: 'Exercício de mobilidade pélvica em pé na escada',
    category: 'mobilidade',
    trimester: '3º',
    duration: 3,
    description: 'Exercício de mobilidade pélvica em pé utilizando a escada como apoio, ideal para o 3º trimestre para preparar o corpo para o parto',
    image: 'https://img.youtube.com/vi/2G_7mnZjCgM/hqdefault.jpg',
    youtube_video_id: '2G_7mnZjCgM',
    instructions: ['Fique de pé próxima à escada para apoio', 'Coloque uma perna no degrau', 'Realize movimentos de mobilidade pélvica', 'Troque de lado e repita']
  },
  {
    id: 'ex-57',
    name: 'Exercício de mobilidade de coluna',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 8,
    description: 'Exercício de mobilidade de coluna para o 2º e 3º trimestre, promovendo alívio de tensões e maior conforto durante a gestação',
    image: 'https://img.youtube.com/vi/SlqSEgEbXww/hqdefault.jpg',
    youtube_video_id: 'SlqSEgEbXww',
    instructions: ['Posicione-se confortavelmente', 'Realize movimentos suaves de mobilidade da coluna', 'Mantenha a respiração ritmada durante o exercício', 'Respeite os limites do seu corpo']
  },
  {
    id: 'ex-58',
    name: 'Exercício de estabilização pélvica deitada de lado',
    category: 'assoalho-pelvico',
    trimester: '2º-3º',
    duration: 10,
    description: 'Exercício de estabilização pélvica na posição deitada de lado, fortalecendo o assoalho pélvico de forma segura e confortável no 2º e 3º trimestre',
    image: 'https://img.youtube.com/vi/bIi4EttrFGg/hqdefault.jpg',
    youtube_video_id: 'bIi4EttrFGg',
    instructions: ['Deite-se de lado em posição confortável', 'Ative o assoalho pélvico de forma consciente', 'Realize os movimentos de estabilização com controle', 'Mantenha a respiração contínua durante o exercício']
  },
  {
    id: 'ex-59',
    name: 'Exercício de estabilização pélvica',
    category: 'assoalho-pelvico',
    trimester: '2º-3º',
    duration: 9,
    description: 'Exercício de estabilização pélvica para o 2º e 3º trimestre, fortalecendo o assoalho pélvico e promovendo maior controle e bem-estar durante a gestação',
    image: 'https://img.youtube.com/vi/d-rNhY_Yr7M/hqdefault.jpg',
    youtube_video_id: 'd-rNhY_Yr7M',
    instructions: ['Posicione-se confortavelmente', 'Ative o assoalho pélvico com consciência corporal', 'Realize os movimentos de estabilização de forma controlada', 'Mantenha a respiração ritmada durante todo o exercício']
  },
  {
    id: 'ex-61',
    name: 'Fase latente do Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 9,
    description: 'Aula sobre a fase latente do trabalho de parto, preparando a gestante para reconhecer os sinais iniciais e saber como agir nesse momento tão importante',
    image: 'https://img.youtube.com/vi/IFrXMPN237w/hqdefault.jpg',
    youtube_video_id: 'IFrXMPN237w',
    instructions: ['Assista ao vídeo com atenção', 'Anote os sinais da fase latente', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-62',
    name: 'Fase ativa do Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 5,
    description: 'Aula sobre a fase ativa do trabalho de parto, preparando a gestante para reconhecer a progressão do trabalho de parto e saber como lidar com as contrações mais intensas',
    image: 'https://img.youtube.com/vi/61xAFc5q6bY/hqdefault.jpg',
    youtube_video_id: '61xAFc5q6bY',
    instructions: ['Assista ao vídeo com atenção', 'Anote as características da fase ativa', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-63',
    name: 'Fase de transição do Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 4,
    description: 'Aula sobre a fase de transição do trabalho de parto, preparando a gestante para a etapa mais intensa antes do período expulsivo',
    image: 'https://img.youtube.com/vi/-9XPOcykRPc/hqdefault.jpg',
    youtube_video_id: '-9XPOcykRPc',
    instructions: ['Assista ao vídeo com atenção', 'Anote as características da fase de transição', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-64',
    name: 'Período expulsivo do Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 16,
    description: 'Aula sobre o período expulsivo do trabalho de parto, preparando a gestante para o momento do nascimento do bebê',
    image: 'https://img.youtube.com/vi/SCL9iEi1RjI/hqdefault.jpg',
    youtube_video_id: 'SCL9iEi1RjI',
    instructions: ['Assista ao vídeo com atenção', 'Anote as orientações sobre o período expulsivo', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-65',
    name: 'Dequitação da Placenta',
    category: 'parto',
    trimester: '3º',
    duration: 1,
    description: 'Aula sobre a dequitação da placenta, explicando o que acontece após o nascimento do bebê e como transcorre essa última etapa do parto',
    image: 'https://img.youtube.com/vi/CA-H4rHOO7I/hqdefault.jpg',
    youtube_video_id: 'CA-H4rHOO7I',
    instructions: ['Assista ao vídeo com atenção', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-66',
    name: 'Trabalho de Parto Cesárea',
    category: 'parto',
    trimester: '3º',
    duration: 7,
    description: 'Aula sobre o trabalho de parto por cesárea, explicando o procedimento, o que esperar e como se preparar para essa modalidade de parto',
    image: 'https://img.youtube.com/vi/U4JLDCyQuYE/hqdefault.jpg',
    youtube_video_id: 'U4JLDCyQuYE',
    instructions: ['Assista ao vídeo com atenção', 'Anote suas dúvidas sobre a cesárea', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-67',
    name: 'Orientações pós parto',
    category: 'parto',
    trimester: '3º',
    duration: 8,
    description: 'Aula com orientações para o período pós parto, abordando os cuidados essenciais com o corpo e o bebê nas primeiras semanas após o nascimento',
    image: 'https://img.youtube.com/vi/cD97PjqE7rs/hqdefault.jpg',
    youtube_video_id: 'cD97PjqE7rs',
    instructions: ['Assista ao vídeo com atenção', 'Anote as orientações pós parto', 'Compartilhe com seu acompanhante', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-68',
    name: 'Posições para o período expulsivo',
    category: 'parto',
    trimester: '3º',
    duration: 10,
    description: 'Aula sobre as diferentes posições para o período expulsivo, ajudando a gestante a conhecer as opções e escolher a que melhor se adapta ao seu parto',
    image: 'https://img.youtube.com/vi/Z2qx5N75j3w/hqdefault.jpg',
    youtube_video_id: 'Z2qx5N75j3w',
    instructions: ['Assista ao vídeo com atenção', 'Anote as posições que mais te interessam', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas preferências']
  },
  {
    id: 'ex-69',
    name: 'Exercícios para o Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 15,
    description: 'Aula prática com exercícios específicos para o trabalho de parto, ajudando a gestante a se preparar fisicamente e mentalmente para o grande momento',
    image: 'https://img.youtube.com/vi/mdrrKPoNZ_c/hqdefault.jpg',
    youtube_video_id: 'mdrrKPoNZ_c',
    instructions: ['Assista ao vídeo com atenção', 'Pratique os exercícios apresentados', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-70',
    name: 'Formas de indução do parto',
    category: 'parto',
    trimester: '3º',
    duration: 9,
    description: 'Aula sobre as diferentes formas de indução do parto, explicando os métodos disponíveis e quando cada um pode ser indicado pela equipe de saúde',
    image: 'https://img.youtube.com/vi/_0ikOqL_2rE/hqdefault.jpg',
    youtube_video_id: '_0ikOqL_2rE',
    instructions: ['Assista ao vídeo com atenção', 'Anote suas dúvidas sobre indução', 'Compartilhe com seu acompanhante de parto', 'Converse com sua equipe de saúde sobre suas dúvidas']
  },
  {
    id: 'ex-71',
    name: 'Exercício de mobilidade pélvica em pé no banco',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 3,
    description: 'Exercício de mobilidade pélvica em pé utilizando o banco como apoio, indicado para o 2º e 3º trimestre para aliviar tensões e preparar o corpo para o parto',
    image: 'https://img.youtube.com/vi/g91kh_Cl1t4/hqdefault.jpg',
    youtube_video_id: 'g91kh_Cl1t4',
    instructions: ['Fique de pé próxima ao banco para apoio', 'Mantenha a coluna alinhada e os pés na largura do quadril', 'Realize movimentos suaves de mobilidade pélvica', 'Respire de forma contínua e ritmada durante o exercício']
  },
  {
    id: 'ex-72',
    name: 'Exercício de mobilidade de quadril de joelhos',
    category: 'mobilidade',
    trimester: '2º-3º',
    duration: 5,
    description: 'Exercício de mobilidade de quadril na posição de joelhos, indicado para o 2º e 3º trimestre para aliviar tensões no quadril e preparar o corpo para o parto',
    image: 'https://img.youtube.com/vi/gLY0h6ilS5o/hqdefault.jpg',
    youtube_video_id: 'gLY0h6ilS5o',
    instructions: ['Posicione-se de joelhos em uma superfície confortável', 'Mantenha a coluna alinhada e os joelhos na largura do quadril', 'Realize movimentos suaves de mobilidade do quadril', 'Respire de forma contínua e ritmada durante o exercício']
  },
  {
    id: 'ex-73',
    name: 'Sequência de exercícios para aliviar dor lombar',
    category: 'apoio',
    trimester: '2º-3º',
    duration: 11,
    description: 'Sequência completa de exercícios para aliviar a dor lombar no 2º e 3º trimestre, trazendo mais conforto e bem-estar durante a gestação',
    image: 'https://img.youtube.com/vi/j101l7ULjrQ/hqdefault.jpg',
    youtube_video_id: 'j101l7ULjrQ',
    instructions: ['Posicione-se confortavelmente', 'Siga a sequência de movimentos no ritmo do vídeo', 'Mantenha a respiração contínua durante os exercícios', 'Respeite os limites do seu corpo']
  },
  {
    id: 'ex-74',
    name: 'Acompanhante no Trabalho de Parto',
    category: 'parto',
    trimester: '3º',
    duration: 11,
    description: 'Aula sobre o papel do acompanhante durante o trabalho de parto, orientando como ele pode apoiar e participar ativamente nesse momento tão especial',
    image: 'https://img.youtube.com/vi/AHsvGhiZ0cI/hqdefault.jpg',
    youtube_video_id: 'AHsvGhiZ0cI',
    instructions: ['Assista ao vídeo com seu acompanhante', 'Anote as formas de apoio que mais fazem sentido para vocês', 'Converse sobre as expectativas para o trabalho de parto', 'Compartilhe com sua equipe de saúde']
  },
  {
    id: 'ex-76',
    name: 'Sequência para dor na pelve anterior',
    category: 'apoio',
    trimester: '2º-3º',
    duration: 9,
    description: 'Sequência de exercícios para aliviar a dor na pelve anterior (sínfise púbica), muito comum no 2º e 3º trimestre, com movimentos suaves e seguros para a gestante.',
    image: 'https://img.youtube.com/vi/0jxhMqIHlGM/hqdefault.jpg',
    youtube_video_id: '0jxhMqIHlGM',
    instructions: ['Escolha um ambiente confortável e seguro', 'Siga os movimentos no ritmo indicado pela Dra. Fabiana', 'Evite amplitudes que causem dor — respeite seus limites', 'Repita sempre que sentir desconforto na região pélvica anterior']
  },
  {
    id: 'ex-75',
    name: 'Sequência para dor lombar em pé',
    category: 'apoio',
    trimester: '2º-3º',
    duration: 10,
    description: 'Sequência de exercícios em pé para aliviar a dor lombar comum na gestação, fortalecendo e mobilizando a região sem necessidade de deitar no chão.',
    image: 'https://img.youtube.com/vi/t2J17918w20/hqdefault.jpg',
    youtube_video_id: 't2J17918w20',
    instructions: ['Fique de pé em uma superfície estável', 'Siga os movimentos no ritmo indicado pela Dra. Fabiana', 'Respire de forma consciente durante toda a sequência', 'Repita quantas vezes precisar ao longo do dia']
  },
  {
    id: 'ex-60',
    name: 'Contrações na gestação e parto',
    category: 'educacao',
    trimester: 'todos',
    duration: 5,
    description: 'Aula educativa sobre contrações durante a gestação e o parto, preparando a gestante para reconhecer e lidar com as contrações ao longo da gravidez',
    image: 'https://img.youtube.com/vi/Y30Vsj9XOnY/hqdefault.jpg',
    youtube_video_id: 'Y30Vsj9XOnY',
    instructions: ['Assista ao vídeo com atenção', 'Anote suas dúvidas para discutir com seu médico', 'Compartilhe o conteúdo com seu parceiro ou acompanhante']
  },
];

export const communityPosts: CommunityPost[] = [];

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
    id: 'ach-6',
    name: 'Jornada Iniciada',
    description: 'Assista todos os vídeos de introdução e conheça sua jornada',
    icon: '🌱',
  },
  {
    id: 'ach-7',
    name: 'Mamãe Bem Informada',
    description: 'Assista todos os 7 vídeos educativos sobre o seu corpo e a gestação',
    icon: '📚',
  },
  {
    id: 'ach-1',
    name: 'Primeira Semana',
    description: 'Pratique por 7 dias ativos e sinta a diferença no seu corpo',
    icon: '🎖️',
  },
  {
    id: 'ach-2',
    name: '30 Dias',
    description: 'Mantenha uma sequência incrível de 30 dias de prática',
    icon: '🏅',
  },
  {
    id: 'ach-9',
    name: '60 Dias',
    description: 'Dois meses cuidando de você e do seu bebê — que dedicação!',
    icon: '🥈',
  },
  {
    id: 'ach-10',
    name: '90 Dias',
    description: 'Três meses de prática! Você é uma inspiração para todas as mamães',
    icon: '🏆',
  },
  {
    id: 'ach-3',
    name: 'Consistência',
    description: 'Pratique em 10 dias diferentes e mostre ao mundo do que é capaz',
    icon: '💪',
  },
  {
    id: 'ach-4',
    name: 'Exploradora',
    description: 'Participe da comunidade comentando e apoiando outras mamães',
    icon: '🗣️',
  },
  {
    id: 'ach-5',
    name: 'Comunidade',
    description: 'Faça seu primeiro post e ilumine o caminho de outras gestantes',
    icon: '💬',
  },
  {
    id: 'ach-8',
    name: 'Pronta para o Parto',
    description: 'Assista todos os vídeos sobre o parto e chegue preparada para o grande dia',
    icon: '🤱',
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
