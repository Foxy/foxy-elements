import { createMachine } from 'xstate';
import { Page } from './Page';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';

customElements.define('x-page', Page);

const samples = {
  innerHTML: '<div>Lorem ipsum</div>',
};

/**
 * @param element
 */
function testSlots(element: Page) {
  expect(element.shadowRoot!.querySelector('slot[name=title]')).to.exist;
  expect(element.shadowRoot!.querySelector('slot[name=subtitle]')).to.exist;
}

/**
 * @param element
 */
function testContent(element: Page) {
  expect(element).lightDom.to.equal(samples.innerHTML);
  testSlots(element);
}

const machine = createMachine({
  initial: 'empty',
  states: {
    empty: { meta: { test: () => testSlots }, on: { SET_CONTENT: 'withContent' } },
    withContent: { meta: { test: testContent } },
  },
});

const model = createModel<Page>(machine).withEvents({
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
});

describe('Page', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-page></x-page>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
