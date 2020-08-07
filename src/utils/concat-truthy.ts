// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function concatTruthy(...v: any[]): any[] {
  return v.filter(v => !!v);
}
