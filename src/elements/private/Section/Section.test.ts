import { createMachine } from 'xstate';
import { Section } from './Section';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';

customElements.define('x-section', Section);

const samples = {
  innerHTML: '<div>Lorem ipsum</div>',
};

/**
 * @param element
 */
function testSlots(element: Section) {
  expect(element.shadowRoot!.querySelector('slot[name=title]')).to.exist;
  expect(element.shadowRoot!.querySelector('slot[name=subtitle]')).to.exist;
}

/**
 * @param element
 */
function testContent(element: Section) {
  expect(element).lightDom.to.equal(samples.innerHTML);
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

const machine = createMachine({
  initial: 'empty',
  states: {
    empty: { meta: { test: () => testSlots }, on: { SET_CONTENT: 'withContent' } },
    withContent: { meta: { test: testContent } },
  },
});

const model = createModel<Section>(machine).withEvents({
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
});

describe('Section', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-section></x-section>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
