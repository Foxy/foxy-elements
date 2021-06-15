import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { Warning } from './Warning';
import { expect, fixture } from '@open-wc/testing';

customElements.define('x-warning', Warning);

const samples = {
  innerHTML: '<div>Lorem ipsum</div>',
};

/**
 * @param element
 */
function testEmpty(element: Warning) {
  expect(element.innerHTML).to.equal('');
  expect(element.shadowRoot!.textContent?.trim()).to.equal('');
}

/**
 * @param element
 */
function testContent(element: Warning) {
  expect(element).lightDom.to.equal(samples.innerHTML);
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

const machine = createMachine({
  initial: 'empty',
  states: {
    empty: {
      meta: { test: testEmpty },
      on: { SET_CONTENT: 'withContent' },
    },
    withContent: {
      meta: { test: testContent },
    },
  },
});

const model = createModel<Warning>(machine).withEvents({
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
});

describe('Warning', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-warning></x-warning>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
