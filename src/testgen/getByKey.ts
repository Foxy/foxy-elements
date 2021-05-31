import { I18n } from '../elements';
import { LitElement } from 'lit-element';

export async function getByKey(element: LitElement, key: string): Promise<I18n | null> {
  await element.updateComplete;
  return element.renderRoot.querySelector(`foxy-i18n[key="${key}"]`) as I18n | null;
}
