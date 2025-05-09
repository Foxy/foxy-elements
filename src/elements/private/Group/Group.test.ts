import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Group } from './Group';

customElements.define('x-group', Group);

async function testContent(element: Group) {
  await element.requestUpdate();
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

async function testHeader(element: Group) {
  await element.requestUpdate();
  expect(element.shadowRoot!.querySelector('slot[name=header]')).to.exist;
}

async function testFrame(element: Group) {
  await element.requestUpdate();
  const selector = '.bg-contrast-5.overflow-hidden';
  const frame = element.shadowRoot!.querySelector(selector);
  expect(frame).to.be.visible;
}

async function testDefault(element: Group) {
  await element.requestUpdate();
  expect(() => testHeader(element)).to.throw;
  expect(() => testFrame(element)).to.throw;
}

const machine = createMachine({
  initial: 'default',
  states: {
    withContent: { meta: { test: testContent } },
    withHeader: { meta: { test: testHeader } },
    withFrame: { meta: { test: testFrame } },
    default: { meta: { test: testDefault } },
  },
  on: {
    TEST_CONTENT: 'withContent',
    TEST_HEADER: 'withHeader',
    TEST_FRAME: 'withFrame',
  },
});

const model = createModel<Group>(machine).withEvents({
  TEST_CONTENT: { exec: element => void (element.innerHTML = '<div>Test content</div>') },
  TEST_FRAME: { exec: element => void (element.frame = true) },
});

describe('Group', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-group></x-group>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
