import { LitElement } from 'lit-element';

/**
 * @param element
 * @param attribute
 */
export function getRefs<T>(element: HTMLElement, attribute = 'data-testid'): T {
  return Array.from(element.shadowRoot!.querySelectorAll(`[${attribute}]`))
    .map(child => [child.getAttribute(attribute)!, child] as const)
    .reduce((refs, [id, child]) => ({ ...refs, [id]: child }), {} as T);
}

/**
 * @param callback
 */
export function exec<TRefs = unknown, TElement extends LitElement = LitElement>(
  callback: (refs: TRefs & { element: TElement }) => any
): (element: TElement) => Promise<void> {
  return async (element: TElement) => {
    await element.updateComplete;
    await callback({ ...getRefs<TRefs>(element), element });
  };
}

/**
 * @param element
 * @param value
 */
export function setChecked(
  element: Pick<HTMLInputElement, 'checked' | 'dispatchEvent'>,
  value: boolean
): void {
  element.checked = value;
  element?.dispatchEvent(new CustomEvent('change'));
}

/**
 * @param times
 * @param test
 */
export async function retry(times: number, test: () => Promise<void>): Promise<void> {
  let error: Error | null = null;
  let elapsed = 0;

  do {
    try {
      await new Promise(r => setTimeout(r));
      await test();
      error = null;
    } catch (err) {
      error = err;
    } finally {
      elapsed++;
    }
  } while (elapsed < times);

  if (error) throw error;
}
