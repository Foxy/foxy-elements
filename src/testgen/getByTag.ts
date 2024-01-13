import { LitElement } from 'lit-element';

export async function getByTag<T extends Element>(
  element: Element,
  tag: string,
  all: true
): Promise<T[]>;

export async function getByTag<T extends Element>(
  element: Element,
  tag: string,
  all?: false
): Promise<T | null>;

export async function getByTag<T extends Element>(
  element: Element,
  tag: string,
  all = false
): Promise<unknown> {
  let root: Element | DocumentFragment = element;

  if (element instanceof LitElement) {
    await element.requestUpdate();
    root = element.renderRoot;
  }

  return all ? [...root.querySelectorAll<T>(tag)] : root.querySelector<T>(tag);
}
