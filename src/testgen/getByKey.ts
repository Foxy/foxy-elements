import { LitElement } from 'lit-element';

export async function getByKey<T extends HTMLElement>(
  element: LitElement,
  key: string
): Promise<T | null> {
  await element.updateComplete;
  return element.renderRoot.querySelector(`foxy-i18n[key="${key}"]`) as T | null;
}
