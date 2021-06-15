import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Group } from './Group';

customElements.define('x-group', Group);

/**
 * @param element
 */
function testContent(element: Group) {
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

/**
 * @param element
 */
function testHeader(element: Group) {
  expect(element.shadowRoot!.querySelector('slot[name=header]')).to.exist;
}

/**
 * @param element
 */
function testFrame(element: Group) {
  const selector = '.rounded-t-l.rounded-b-l.border.border-contrast-10';
  const frame = element.shadowRoot!.querySelector(selector);
  expect(frame).to.be.visible;
}

/**
 * @param element
 */
function testDefault(element: Group) {
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
