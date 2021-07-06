import { LitElement } from 'lit-element';

export async function getByTestClass<T extends HTMLElement>(
  element: LitElement,
  testClass: string
): Promise<T[]> {
  await element.updateComplete;
  return Array.from(element.renderRoot.querySelectorAll(`[data-testclass="${testClass}"]`)) as T[];
}
