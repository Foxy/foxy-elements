import { createMachine } from 'xstate';
import { Skeleton } from './Skeleton';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';

customElements.define('x-skeleton', Skeleton);

const samples = {
  innerHTML: '<div>Lorem ipsum</div>',
};

/**
 * @param element
 */
async function testEmpty(element: Skeleton) {
  await element.updateComplete;
  expect(element.innerHTML).to.equal('');
}

/**
 * @param element
 */
async function testWithContent(element: Skeleton) {
  await element.updateComplete;
  expect(element.innerHTML).to.equal(samples.innerHTML);
}

const machine = createMachine({
  initial: 'empty',
  states: {
    empty: { meta: { test: testEmpty }, on: { SET_CONTENT: 'withContent' } },
    withContent: { meta: { test: testWithContent } },
  },
});

const model = createModel<Skeleton>(machine).withEvents({
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
});

describe('Skeleton', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-skeleton></x-skeleton>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
