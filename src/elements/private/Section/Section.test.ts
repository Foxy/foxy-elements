import { createMachine } from 'xstate';
import { Section } from './Section';
import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';

customElements.define('x-section', Section);

const samples = {
  header: 'Test header',
  subheader: 'Lorem ipsum',
  innerHTML: '<div>Lorem ipsum</div>',
};

function testHeader(element: Section) {
  const header = element.shadowRoot!.querySelector('h2');
  expect(header?.textContent).to.contain(samples.header);
}

function testContent(element: Section) {
  expect(element).lightDom.to.equal(samples.innerHTML);
  Array.from(element.children).every(child => expect(child).to.be.visible);
}

function testSubheader(element: Section) {
  const subheader = element.shadowRoot!.querySelector('h2 + p');
  expect(subheader?.textContent).to.contain(samples.subheader);
}

function testEmpty(element: Section) {
  const header = element.shadowRoot!.querySelector('h2');
  const subheader = element.shadowRoot!.querySelector('h2 + p');

  expect(header?.textContent?.trim()).to.equal('');
  expect(subheader?.textContent?.trim()).to.equal('');
}

const machine = createMachine({
  initial: 'empty',
  states: {
    empty: { meta: { test: testEmpty } },
    withHeader: { meta: { test: testHeader } },
    withContent: { meta: { test: testContent } },
    withSubheader: { meta: { test: testSubheader } },
  },
  on: {
    SET_HEADER: 'withHeader',
    SET_CONTENT: 'withContent',
    SET_SUBHEADER: 'withSubheader',
  },
});

const model = createModel<Section>(machine).withEvents({
  SET_HEADER: { exec: element => void (element.header = samples.header) },
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
  SET_SUBHEADER: { exec: element => void (element.subheader = samples.subheader) },
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
