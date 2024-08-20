export function getMonthNames(lang: string): string[] {
  return new Array(12).fill(new Date()).map((date: Date, i) => {
    date.setMonth(i);
    return date.toLocaleDateString(lang, { month: 'long' });
  });
}
