import { createMachine } from 'xstate';
import { Page } from './Page';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';

customElements.define('x-page', Page);

const samples = {
  header: 'Test header',
  subheader: 'Lorem ipsum',
  innerHTML: '<div>Lorem ipsum</div>',
};

function testHeader(element: Page) {
  const header = element.shadowRoot!.querySelector('h1');
  expect(header?.textContent).to.contain(samples.header);
}

function testContent(element: Page) {
  expect(element).lightDom.to.equal(samples.innerHTML);
}

function testSubheader(element: Page) {
  const subheader = element.shadowRoot!.querySelector('h1 + p');
  expect(subheader?.textContent).to.contain(samples.subheader);
}

function testEmpty(element: Page) {
  const header = element.shadowRoot!.querySelector('h1');
  const subheader = element.shadowRoot!.querySelector('h1 + p');

  expect(header?.textContent?.trim()).to.equal('');
  expect(subheader?.textContent?.trim()).to.equal('');
}

function testSkeleton(element: Page) {
  testEmpty(element);
  expect(() => testContent(element)).to.throw;
}

const machine = createMachine({
  id: 'page',
  initial: 'default',
  states: {
    default: {
      meta: { test: () => true },
      initial: 'empty',
      states: {
        empty: { meta: { test: testEmpty } },
        withHeader: { meta: { test: testHeader } },
        withContent: { meta: { test: testContent } },
        withSubheader: { meta: { test: testSubheader } },
      },
      on: {
        SET_HEADER: '.withHeader',
        SET_CONTENT: '.withContent',
        SET_SUBHEADER: '.withSubheader',
        TOGGLE_SKELETON: 'skeleton',
      },
    },
    skeleton: {
      meta: { test: () => testSkeleton },
      on: {
        TOGGLE_SKELETON: 'default',
      },
    },
  },
});

const model = createModel<Page>(machine).withEvents({
  SET_HEADER: { exec: element => void (element.header = samples.header) },
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
  SET_SUBHEADER: { exec: element => void (element.subheader = samples.subheader) },
  TOGGLE_SKELETON: { exec: element => void (element.skeleton = true) },
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
