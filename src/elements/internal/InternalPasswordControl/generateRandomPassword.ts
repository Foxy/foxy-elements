export function generateRandomPassword(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < 18; i++) {
    if (i > 0 && i % 6 === 0) result += '-';
    result += charset[Math.floor(Math.random() * charset.length)];
  }

  return result;
}
