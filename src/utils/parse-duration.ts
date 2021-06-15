export interface Duration {
  count: number;
  units: string;
}

/**
 * @param value
 */
export function parseDuration(value: string): Duration {
  return {
    count: parseInt(value.replace(/(y|m|w|d)/, '')),
    units: value.replace(/\.?\d+/, ''),
  };
}
