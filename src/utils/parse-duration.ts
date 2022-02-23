export interface Duration {
  count: number;
  units: string;
}

export function parseDuration(value: string, full = false): Duration {
  const unitsMap: Record<string, string> = { y: 'year', m: 'month', w: 'week', d: 'day' };
  const count = value.replace(/(y|m|w|d)/, '');
  const unit = value.replace(/\.?\d+/, '');

  return {
    count: count === '.5' ? 0.5 : parseInt(count),
    units: full ? unitsMap[unit] ?? unit : unit,
  };
}
