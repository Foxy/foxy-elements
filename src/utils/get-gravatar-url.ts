export async function getGravatarUrl(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(email));
  const array = Array.from(new Uint8Array(buffer));
  const hex = array.map(b => b.toString(16).padStart(2, '0')).join('');

  return `https://www.gravatar.com/avatar/${hex}?s=256&d=identicon`;
}
