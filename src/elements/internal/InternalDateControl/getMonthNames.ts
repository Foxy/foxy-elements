export function getMonthNames(lang: string): string[] {
  return new Array(12).fill(null).map((_, i) => {
    const date = new Date(2000, i, 1);
    return date.toLocaleDateString(lang, { month: 'long' });
  });
}
