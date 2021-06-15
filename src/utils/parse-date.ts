/**
 * @param strDate
 */
export function parseDate(strDate: string): Date | null {
  const [year, month, day] = strDate.split('-').map(v => parseInt(v, 10));
  if ([year, month, day].some(v => typeof v !== 'number' || isNaN(v))) return null;
  return new Date(year, month - 1, day);
}
