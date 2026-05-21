// Utility functions

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function getWeekFromDate(date: Date): number {
  const startDate = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startDate.getTime();
  const week = Math.ceil((diff / (1000 * 60 * 60 * 24) + 1) / 7);
  return week;
}

export function calculateDueDate(currentWeek: number): Date {
  const today = new Date();
  const weeksLeft = 40 - currentWeek;
  const dueDate = new Date(today.getTime() + weeksLeft * 7 * 24 * 60 * 60 * 1000);
  return dueDate;
}

export function getDaysLeftInPregnancy(week: number): number {
  return (40 - week) * 7;
}

export function getProgressPercentage(week: number): number {
  return (week / 40) * 100;
}

export function getTrimester(week: number): '1º' | '2º' | '3º' {
  if (week <= 13) return '1º';
  if (week <= 27) return '2º';
  return '3º';
}

export function formatTime(timestamp: string): string {
  // Simple mock implementation
  const times: { [key: string]: string } = {
    '4h': '4h',
    '2h': '2h',
    '1h': '1h',
    '30min': '30min',
    '3h': '3h'
  };
  return times[timestamp] || timestamp;
}
