export const achievementsMap: Record<string, string> = {
  'ach-1': 'Primeira Semana',
  'ach-2': '30 Dias',
  'ach-3': 'Consistência',
  'ach-4': 'Exploradora',
  'ach-5': 'Comunidade',
  'ach-6': 'Jornada Iniciada',
  'ach-7': 'Mamãe Bem Informada',
}

export function getAchievementName(id: string): string {
  return achievementsMap[id] || id
}

export function getAchievementEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'ach-1': '🎖️',
    'ach-2': '🏅',
    'ach-3': '💪',
    'ach-4': '🗣️',
    'ach-5': '💬',
    'ach-6': '🌱',
    'ach-7': '📚',
  }
  return emojis[id] || '🏆'
}
