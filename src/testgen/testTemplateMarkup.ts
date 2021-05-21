import { InternalSandbox } from '../elements/internal/InternalSandbox/InternalSandbox';
import { LitElement } from 'lit-element';
import { Renderer } from '../mixins/configurable';
import { expect } from '@open-wc/testing';

type TestElement = LitElement & {
  compileTemplates: () => void;
  templates: Partial<Record<string, Renderer<any>>>;
  mode?: string;
};

export async function testTemplateMarkup(element: TestElement, name: string): Promise<void> {
  element.innerHTML = `<template slot="${name}"><div data-testid="${name}"></div></template>`;
  element.compileTemplates();
  await element.updateComplete;

  const selector = `foxy-internal-sandbox[data-testid="${name}"]`;
  const sandbox = element.renderRoot.querySelector(selector) as InternalSandbox;
  const layout = `<div data-testid="${name}"></div>`;
  const mark = sandbox.renderRoot.firstElementChild;

  expect(sandbox, `${selector} must exist in render root`).to.exist;
  expect(mark?.outerHTML, `${selector} shadow dom must include ${layout}`).to.equal(layout);

  element.innerHTML = '';
  element.compileTemplates();
  await element.updateComplete;
}
