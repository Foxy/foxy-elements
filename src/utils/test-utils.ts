import { LitElement } from 'lit-element';

export function getRefs<T>(element: HTMLElement, attribute = 'data-testid'): T {
  return Array.from(element.shadowRoot!.querySelectorAll(`[${attribute}]`))
    .map(child => [child.getAttribute(attribute)!, child] as const)
    .reduce((refs, [id, child]) => ({ ...refs, [id]: child }), {} as T);
}

export function exec<TRefs = unknown, TElement extends LitElement = LitElement>(
  callback: (refs: TRefs & { element: TElement }) => any
): (element: TElement) => Promise<void> {
  return async (element: TElement) => {
    await element.updateComplete;
    await callback({ ...getRefs<TRefs>(element), element });
  };
}

/**
 * A response shaped like the API's scope denial: HTTP 401 with a `vnd.error` body whose
 * message names the missing permission. `isAccessDenied` returns `true` for it.
 */
export function createAccessDeniedResponse(
  type: 'read' | 'write' | 'resend' = 'read',
  rel = 'customer'
): Response {
  const message = `The current authenticated user does not appear to have ${type} permission for ${rel} resource.`;
  const body = { total: 1, _embedded: { 'fx:errors': [{ logref: 'id-1', message }] } };
  return new Response(JSON.stringify(body), { status: 401 });
}
