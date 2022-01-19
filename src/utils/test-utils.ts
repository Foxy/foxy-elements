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
