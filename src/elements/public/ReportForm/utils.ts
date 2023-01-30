type Quarter = [number, number, number];
type Year = [Quarter, Quarter, Quarter, Quarter];
type Range = { start: Date; end: Date };

const quarters: Year = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [9, 10, 11],
];

export function getPreviousQuarter(now = new Date()): Range {
  const currentMonth = now.getMonth();
  const currentQuarter = quarters.findIndex(months => months.includes(currentMonth));
  const previousQuarter = currentQuarter === 0 ? quarters.length - 1 : currentQuarter - 1;
  const previousQuarterYear = now.getFullYear() - (currentQuarter === 0 ? 1 : 0);

  const previousQuarterStart = quarters[previousQuarter][0];
  const start = new Date(previousQuarterYear, previousQuarterStart);

  const previousQuarterEnd = quarters[previousQuarter][2];
  const end = new Date(new Date(previousQuarterYear, previousQuarterEnd + 1).getTime() - 1);

  return { start, end };
}

export function getCurrentQuarter(now = new Date()): Range {
  const currentMonth = now.getMonth();
  const currentQuarter = quarters.findIndex(months => months.includes(currentMonth));

  const currentQuarterStart = quarters[currentQuarter][0];
  const start = new Date(now.getFullYear(), currentQuarterStart);

  const currentQuarterEnd = quarters[currentQuarter][2];
  const end = new Date(new Date(now.getFullYear(), currentQuarterEnd + 1).getTime() - 1);

  return { start, end };
}

export function getPreviousMonth(now = new Date()): Range {
  const start = new Date(now.getFullYear(), now.getMonth() - 1);
  const end = new Date(new Date(now.getFullYear(), now.getMonth()).getTime() - 1);

  return { start, end };
}

export function getCurrentMonth(now = new Date()): Range {
  const start = new Date(now.getFullYear(), now.getMonth());
  const end = new Date(new Date(now.getFullYear(), now.getMonth() + 1).getTime() - 1);

  return { start, end };
}

export function getPreviousYear(now = new Date()): Range {
  const start = new Date(now.getFullYear() - 1, 0);
  const end = new Date(new Date(now.getFullYear(), 0).getTime() - 1);

  return { start, end };
}

export function getCurrentYear(now = new Date()): Range {
  const start = new Date(now.getFullYear(), 0);
  const end = new Date(new Date(now.getFullYear() + 1, 0).getTime() - 1);

  return { start, end };
}

export function getLast365Days(now = new Date()): Range {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 365);
  const end = new Date(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1
  );

  return { start, end };
}

export function getLast30Days(now = new Date()): Range {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
  const end = new Date(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - 1
  );

  return { start, end };
}

export function toAPIDateTime(date: Date): string {
  const YYYY = date.getFullYear().toString().padStart(4, '0');
  const MM = (date.getMonth() + 1).toString().padStart(2, '0');
  const DD = date.getDate().toString().padStart(2, '0');
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const ss = date.getSeconds().toString().padStart(2, '0');

  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}`;
}

export function toDateTimePickerValue(apiValue: string): string {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.exec(apiValue)?.[0] ?? '';
}

export function toDatePickerValue(apiValue: string): string {
  return /^\d{4}-\d{2}-\d{2}/.exec(apiValue)?.[0] ?? '';
}
