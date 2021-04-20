import { db, whenDbReady } from '../DemoDatabase';

const createError = (message: string) =>
  JSON.stringify({
    total: 1,
    _embedded: { 'fx:errors': [{ logref: 'unavailable', message }] },
  });

export async function authorize(request: Request): Promise<Response | number> {
  await whenDbReady;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    const [customerId, expiresTimestamp] = token.split('-').map(v => parseInt(v));
    if (expiresTimestamp > Date.now() && (await db.customers.get(customerId))) return customerId;
  }

  return new Response(createError('This route is protected. Please login.'), { status: 401 });
}
