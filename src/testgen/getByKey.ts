import { I18n } from '../elements';
import { LitElement } from 'lit-element';

export async function getByKey(element: Element, key: string): Promise<I18n | null> {
  let root: Element | DocumentFragment = element;

  if (element instanceof LitElement) {
    await element.updateComplete;
    root = element.renderRoot;
  }

  return root.querySelector(`foxy-i18n[key="${key}"]`) as I18n | null;
}
