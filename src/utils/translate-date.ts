import { parseDate } from './parse-date';

export function translateDate(value: string, lang: string): string {
  const thisYear = new Date().getFullYear();
  const opts = { month: 'long', day: 'numeric' };

  return value
    .split('..')
    .map(strDate => {
      const date = parseDate(strDate);
      const year = date?.getFullYear() === thisYear ? undefined : 'numeric';
      return date?.toLocaleDateString(lang, { year, ...opts });
    })
    .join(' – ');
}
