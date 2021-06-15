/**
 * @param day
 * @param locale
 * @param weekday
 */
export function translateWeekday(day: number, locale: string, weekday = 'long'): string {
  const date = new Date();
  while (date.getDay() !== day) date.setDate(date.getDate() + 1);
  return date.toLocaleDateString(locale, { weekday });
}
