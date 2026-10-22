/** An error that keeps the HTTP status of the failed response. */
export class FetchError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function fetchJson<TResource>(promise: Promise<Response>): Promise<TResource> {
  const response = await promise;
  if (!response.ok) throw new FetchError(await response.text(), response.status);
  return response.json();
}
