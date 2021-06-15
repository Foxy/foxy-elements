// eslint-disable-next-line @typescript-eslint/no-explicit-any
/**
 * @param {...any} v
 */
export function concatTruthy(...v: any[]): any[] {
  return v.filter(v => !!v);
}
