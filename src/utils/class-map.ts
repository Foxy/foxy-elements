/**
 * @param map
 */
export function classMap(map: Record<string, boolean>): string {
  return Array.from(Object.entries(map))
    .filter(([, condition]) => condition)
    .map(([value]) => value)
    .join(' ');
}
