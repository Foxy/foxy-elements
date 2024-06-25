export function generateRandomPassword(opts?: { length?: number; charset?: string }): string {
  const charset = opts?.charset ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = opts?.length ?? 18;
  let result = '';

  for (let i = 0; i < length; i++) {
    if (i > 0 && i % 6 === 0) result += '-';
    result += charset[Math.floor(Math.random() * charset.length)];
  }

  return result;
}
