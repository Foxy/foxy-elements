import { router } from '../server/index';

export async function getTestData<T>(path: string): Promise<T> {
  const url = new URL(path, 'https://demo.foxycart.com/');
  const request = new Request(url.toString());

  if (path.includes('/s/customer')) {
    const token = `0-${Date.now() + Math.pow(10, 10)}`;
    request.headers.set('Authorization', `Bearer ${token}`);
  }

  return router.handleRequest(request)!.handlerPromise.then(r => r.json());
}
