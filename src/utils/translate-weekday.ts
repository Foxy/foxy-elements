export function translateWeekday(
  day: number,
  locale: string,
  weekday = 'long'
) {
  const date = new Date();
  while (date.getDay() !== day) date.setDate(date.getDate() + 1);
  return date.toLocaleDateString(locale, { weekday });
}
