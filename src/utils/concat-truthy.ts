export function concatTruthy(...v: unknown[]) {
  return v.filter(v => !!v);
}
