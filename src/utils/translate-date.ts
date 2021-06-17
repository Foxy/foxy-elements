import { parseDate } from './parse-date';

/**
 * @param value
 * @param lang
 */
export function translateDate(value: string, lang: string): string {
  const thisYear = new Date().getFullYear();
  const opts = { day: 'numeric', month: 'long' };

  return value
    .split('..')
    .map(strDate => {
      const date = parseDate(strDate);
      const year = date?.getFullYear() === thisYear ? undefined : 'numeric';
      return date?.toLocaleDateString(lang, { year, ...opts });
    })
    .join(' – ');
}
