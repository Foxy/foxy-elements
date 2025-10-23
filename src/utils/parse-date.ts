import { safeDate } from './safe-date';

export function parseDate(strDate: string): Date | null {
  if (strDate === '0000-00-00') return null;
  const [year, month, day] = strDate.split('-').map(v => parseInt(v, 10));
  if ([year, month, day].some(v => typeof v !== 'number' || isNaN(v))) return null;
  return safeDate(year, month - 1, day);
}
