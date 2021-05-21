import { BooleanSelector } from '@foxy.io/sdk/core';
import { LitElement } from 'lit-element';
import { expect } from '@open-wc/testing';

type TestElement = LitElement & {
  disabled: boolean;
  disabledControls: BooleanSelector;
  disabledSelector: BooleanSelector;
};

function expectControlToBeEnabled(element: TestElement, control: string): void {
  const selector = `[data-testid="${control}"]`;
  expect(element.renderRoot.querySelector(selector)).not.to.have.attribute('disabled');
  expect(element.disabledSelector.matches(control, true)).to.be.false;
}

function expectControlToBeDisabled(element: TestElement, control: string): void {
  const selector = `[data-testid="${control}"]`;
  expect(element.renderRoot.querySelector(selector)).to.have.attribute('disabled');
  expect(element.disabledSelector.matches(control, true)).to.be.true;
}

async function testDisabledControlsAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToBeEnabled(element, control);
  expect(element.disabledControls.matches(control, true)).to.be.false;

  element.setAttribute('disabledcontrols', control);
  await element.updateComplete;
  expectControlToBeDisabled(element, control);

  element.removeAttribute('disabledcontrols');
  await element.updateComplete;
}

async function testDisabledAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToBeEnabled(element, control);
  expect(element).to.have.property('disabled', false);

  element.setAttribute('disabled', '');
  await element.updateComplete;
  expect(element).to.have.property('disabled', true);
  expectControlToBeDisabled(element, control);

  element.removeAttribute('disabled');
  await element.updateComplete;
}

async function testDisabledControlsProperty(element: TestElement, control: string): Promise<void> {
  expectControlToBeEnabled(element, control);
  expect(element.disabledControls.matches(control, true)).to.be.false;

  element.disabledControls = new BooleanSelector(control);
  await element.updateComplete;
  expectControlToBeDisabled(element, control);

  element.disabledControls = BooleanSelector.False;
  await element.updateComplete;
}

async function testDisabledProperty(element: TestElement, control: string): Promise<void> {
  expectControlToBeEnabled(element, control);
  expect(element).to.have.property('disabled', false);

  element.disabled = true;
  await element.updateComplete;
  expect(element).to.have.property('disabled', true);
  expectControlToBeDisabled(element, control);

  element.disabled = false;
  await element.updateComplete;
}

export async function testDisabledSelector(element: TestElement, control: string): Promise<void> {
  await testDisabledControlsAttribute(element, control);
  await testDisabledControlsProperty(element, control);
  await testDisabledAttribute(element, control);
  await testDisabledProperty(element, control);
}
