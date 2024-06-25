export function isOrigin(value: string): boolean {
  try {
    return new URL(value).origin === value.toLowerCase();
  } catch {
    return false;
  }
}
