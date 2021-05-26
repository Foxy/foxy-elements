import { LitElement } from 'lit-element';

export async function getByTag<T extends HTMLElement>(
  element: LitElement,
  tag: string
): Promise<T | null> {
  await element.updateComplete;
  return element.renderRoot.querySelector(tag) as T | null;
}
