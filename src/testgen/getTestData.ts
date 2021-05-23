import { router } from '../server/index';

export async function getTestData<T>(path: string): Promise<T> {
  const url = new URL(path, 'https://demo.foxycart.com/');
  const request = new Request(url.toString());
  return router.handleRequest(request)!.handlerPromise.then(r => r.json());
}
