export type GeneratorOptions = {
  checkStrength?: (value: string) => boolean;
  separator?: string;
  charset?: string;
  length?: number;
};

export function generateRandomPassword(opts?: GeneratorOptions): string {
  const separator = opts?.separator ?? '-';
  const charset = opts?.charset ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = opts?.length ?? 18;
  let result = '';

  for (let i = 0; i < length; i++) {
    if (separator && i > 0 && i % 6 === 0) result += separator;
    result += charset[Math.floor(Math.random() * charset.length)];
  }

  return result;
}
