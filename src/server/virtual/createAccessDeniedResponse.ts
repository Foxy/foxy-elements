/**
 * A response shaped like the API's scope denial: HTTP 401 with a `vnd.error` body whose
 * message names the missing permission.
 */
export function createAccessDeniedResponse(type: string, rel: string): Response {
  const message = `The current authenticated user does not appear to have ${type} permission for ${rel} resource.`;
  const body = { total: 1, _embedded: { 'fx:errors': [{ logref: `id-${Date.now()}`, message }] } };
  return new Response(JSON.stringify(body), { status: 401 });
}
