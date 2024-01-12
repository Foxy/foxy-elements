import { LitElement } from 'lit-element';

export async function getByTestId<T extends HTMLElement>(
  element: Element,
  testId: string
): Promise<T | null> {
  let root: Element | DocumentFragment = element;

  if (element instanceof LitElement) {
    await element.requestUpdate();
    root = element.renderRoot;
  }

  return root.querySelector(`[data-testid="${testId}"]`) as T | null;
}
