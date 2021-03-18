import { parseDuration } from './parse-duration';

export interface Frequency {
  count: number;
  units: string;
}

export function parseFrequency(value: string): Frequency {
  const duration = parseDuration(value);
  const unitsMap = { y: 'yearly', m: 'monthly', w: 'weekly', d: 'daily' };
  const units = unitsMap[duration.units as keyof typeof unitsMap] ?? duration.units;

  return { ...duration, units };
}
