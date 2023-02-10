export async function fetchJson<TResource>(promise: Promise<Response>): Promise<TResource> {
  const response = await promise;
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
