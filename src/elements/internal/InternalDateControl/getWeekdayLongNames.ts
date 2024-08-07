export function getWeekdayLongNames(lang: string): string[] {
  return new Array(7).fill(new Date()).map((date: Date, i) => {
    while (date.getDay() !== i) date.setDate(date.getDate() + 1);
    return date.toLocaleDateString(lang, { weekday: 'long' });
  });
}
