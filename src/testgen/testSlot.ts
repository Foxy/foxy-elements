import { LitElement } from 'lit-element';
import { expect } from '@open-wc/testing';

export async function testSlot(element: LitElement, slot: string): Promise<void> {
  const slotNode = element.renderRoot.querySelector(`slot[name="${slot}"]`);
  expect(slotNode, `render root must have slot with name "${slot}"`).to.exist;
}
