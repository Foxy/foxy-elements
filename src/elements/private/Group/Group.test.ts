import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate/dist/xstate.web.js';
import { Group } from './Group';

customElements.define('x-group', Group);

function testContent(element: Group) {
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

function testHeader(element: Group) {
  const header = element.shadowRoot!.querySelector('h3');
  expect(header?.textContent).to.contain(element.header);
}

function testFrame(element: Group) {
  const selector = '.rounded-t-l.rounded-b-l.border.border-shade-10';
  const frame = element.shadowRoot!.querySelector(selector);
  expect(frame).to.be.visible;
}

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
  TEST_HEADER: { exec: element => void (element.header = 'Lorem ipsum') },
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
