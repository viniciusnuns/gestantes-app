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

export function getLocalDateBR(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

export function formatDateWithTimezoneBR(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function formatDateTimeWithTimezoneBR(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const dateFormatted = date.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  const timeFormatted = date.toLocaleTimeString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return `${dateFormatted} às ${timeFormatted}`;
}

export function formatDateStringBR(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString + 'T00:00:00');
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  };
  return date.toLocaleDateString('pt-BR', options || defaultOptions);
}
