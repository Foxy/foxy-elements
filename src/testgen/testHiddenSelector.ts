import { BooleanSelector } from '@foxy.io/sdk/core';
import { LitElement } from 'lit-element';
import { expect } from '@open-wc/testing';

type TestElement = LitElement & {
  hidden: boolean;
  hiddenControls: BooleanSelector;
  hiddenSelector: BooleanSelector;
};

function expectControlToExist(element: TestElement, control: string): void {
  expect(element.renderRoot.querySelector(`[data-testid="${control}"]`)).to.exist;
  expect(element.hiddenSelector.matches(control, true)).to.be.false;
  expect(element.hiddenControls.matches(control, true)).to.be.false;
}

function expectControlToNotExist(element: TestElement, control: string): void {
  expect(element.renderRoot.querySelector(`[data-testid="${control}"]`)).to.not.exist;
  expect(element.hiddenSelector.matches(control, true)).to.be.true;
}

async function testHiddenControlsAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToExist(element, control);
  expect(element.hiddenControls.matches(control, true)).to.be.false;

  element.setAttribute('hiddencontrols', control);
  await element.updateComplete;
  expectControlToNotExist(element, control);

  element.removeAttribute('hiddencontrols');
  await element.updateComplete;
}

async function testHiddenAttribute(element: TestElement, control: string): Promise<void> {
  expectControlToExist(element, control);
  expect(element).to.have.property('hidden', false);

  element.setAttribute('hidden', '');
  await element.updateComplete;
  expect(element).to.have.property('hidden', true);
  expectControlToNotExist(element, control);

  element.removeAttribute('hidden');
  await element.updateComplete;
}

async function testHiddenControlsProperty(element: TestElement, control: string): Promise<void> {
  expectControlToExist(element, control);
  expect(element.hiddenControls.matches(control, true)).to.be.false;

  element.hiddenControls = new BooleanSelector(control);
  await element.updateComplete;
  expectControlToNotExist(element, control);

  element.hiddenControls = BooleanSelector.False;
  await element.updateComplete;
}

async function testHiddenProperty(element: TestElement, control: string): Promise<void> {
  expectControlToExist(element, control);
  expect(element).to.have.property('hidden', false);

  element.hidden = true;
  await element.updateComplete;
  expect(element).to.have.property('hidden', true);
  expectControlToNotExist(element, control);

  element.hidden = false;
  await element.updateComplete;
}

export async function testHiddenSelector(element: TestElement, control: string): Promise<void> {
  await testHiddenControlsAttribute(element, control);
  await testHiddenControlsProperty(element, control);
  await testHiddenAttribute(element, control);
  await testHiddenProperty(element, control);
}
