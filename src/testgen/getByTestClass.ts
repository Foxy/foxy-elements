import { LitElement } from 'lit-element';

export async function getByTestClass<T extends HTMLElement>(
  element: Element,
  testClass: string
): Promise<T[]> {
  let root: Element | DocumentFragment = element;

  if (element instanceof LitElement) {
    await element.updateComplete;
    root = element.renderRoot;
  }

  return Array.from(root.querySelectorAll(`[data-testclass~="${testClass}"]`)) as T[];
}
