import { LitElement } from 'lit-element';

export async function getByName<T extends HTMLElement>(
  element: LitElement,
  name: string
): Promise<T | null> {
  await element.updateComplete;
  return element.renderRoot.querySelector(`[name="${name}"]`) as T | null;
}
