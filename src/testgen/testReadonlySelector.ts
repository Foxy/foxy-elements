import { BooleanSelector } from '@foxy.io/sdk/core';
import { LitElement } from 'lit-element';
import { expect } from '@open-wc/testing';

type TestElement = LitElement & {
  readonly: boolean;
  readonlyControls: BooleanSelector;
  readonlySelector: BooleanSelector;
};

function expectControlToBeEditable(element: TestElement, control: string): void {
  const selector = `[data-testid="${control}"]`;
  expect(element.renderRoot.querySelector(selector)).not.to.have.attribute('readonly');
  expect(element.readonlySelector.matches(control, true)).to.be.false;
}

function expectControlToBeReadonly(element: TestElement, control: string): void {
  const selector = `[data-testid="${control}"]`;
  expect(element.renderRoot.querySelector(selector)).to.have.attribute('readonly');
  expect(element.readonlySelector.matches(control, true)).to.be.true;
}

async function testReadonlyControlsAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToBeEditable(element, control);
  expect(element.readonlyControls.matches(control, true)).to.be.false;

  element.setAttribute('readonlycontrols', control);
  await element.updateComplete;
  expectControlToBeReadonly(element, control);

  element.removeAttribute('readonlycontrols');
  await element.updateComplete;
}

async function testReadonlyAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToBeEditable(element, control);
  expect(element).to.have.property('readonly', false);

  element.setAttribute('readonly', '');
  await element.updateComplete;
  expect(element).to.have.property('readonly', true);
  expectControlToBeReadonly(element, control);

  element.removeAttribute('readonly');
  await element.updateComplete;
}

async function testReadonlyControlsProperty(element: TestElement, control: string): Promise<void> {
  expectControlToBeEditable(element, control);
  expect(element.readonlyControls.matches(control, true)).to.be.false;

  element.readonlyControls = new BooleanSelector(control);
  await element.updateComplete;
  expectControlToBeReadonly(element, control);

  element.readonlyControls = BooleanSelector.False;
  await element.updateComplete;
}

async function testReadonlyProperty(element: TestElement, control: string): Promise<void> {
  expectControlToBeEditable(element, control);
  expect(element).to.have.property('readonly', false);

  element.readonly = true;
  await element.updateComplete;
  expect(element).to.have.property('readonly', true);
  expectControlToBeReadonly(element, control);

  element.readonly = false;
  await element.updateComplete;
}

export async function testReadonlySelector(element: TestElement, control: string): Promise<void> {
  await testReadonlyControlsAttribute(element, control);
  await testReadonlyControlsProperty(element, control);
  await testReadonlyAttribute(element, control);
  await testReadonlyProperty(element, control);
}
