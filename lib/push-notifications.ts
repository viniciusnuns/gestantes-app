import { supabase } from '@/lib/supabase'

interface SendPushOptions {
  userId?: string
  userIds?: string[]
  all?: boolean
  title: string
  message: string
  url?: string
}

export async function sendPushNotification(options: SendPushOptions) {
  const { data, error } = await supabase.functions.invoke('send-push', {
    body: options,
  })

  if (error) throw error
  return data
}

// Notificações prontas para usar
export const pushTemplates = {
  welcome: (userId: string, name: string) =>
    sendPushNotification({
      userId,
      title: 'Bem-vinda ao Gestar em Movimento! 🌸',
      message: `Olá, ${name}! Seu primeiro exercício está esperando por você.`,
      url: '/home',
    }),

  dailyReminder: (userId: string) =>
    sendPushNotification({
      userId,
      title: 'Hora de se mover, mamãe! 💪',
      message: 'Seu exercício de hoje está esperando. Seu bebê agradece!',
      url: '/home',
    }),

  achievement: (userId: string, achievementName: string) =>
    sendPushNotification({
      userId,
      title: '🎉 Nova conquista desbloqueada!',
      message: `Você conquistou: ${achievementName}. Continue assim!`,
      url: '/progresso',
    }),

  inactivity: (userId: string) =>
    sendPushNotification({
      userId,
      title: 'Sentimos sua falta 💕',
      message: 'Volte para continuar cuidando de você e do seu bebê.',
      url: '/home',
    }),

  trimesterChange: (userId: string, trimester: number) =>
    sendPushNotification({
      userId,
      title: `Você entrou no ${trimester}º trimestre! 🎊`,
      message: 'Novos exercícios especiais para essa fase já estão disponíveis.',
      url: '/biblioteca',
    }),
}
