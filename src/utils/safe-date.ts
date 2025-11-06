export function safeDate(year: number, month: number, day?: number): Date {
  // 0-99 map to 1900-1999 in JS Date, so we need to use
  // setFullYear to set the correct year.
  const date = new Date();
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}
