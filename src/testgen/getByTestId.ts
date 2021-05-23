import { LitElement } from 'lit-element';

export async function getByTestId<T extends HTMLElement>(
  element: LitElement,
  testId: string
): Promise<T | null> {
  await element.updateComplete;
  return element.renderRoot.querySelector(`[data-testid="${testId}"]`) as T | null;
}
