import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { List } from './List';
import { ListChangeEvent } from './ListChangeEvent';

customElements.define('x-list', List);

const samples = {
  value: ['foo', 'bar'],
  getText: (value: string) => value.toUpperCase(),
  innerHTML: '<div>Lorem ipsum</div>',
};

async function testItems(element: List) {
  await element.requestUpdate();
  const renderedItems = element.shadowRoot!.querySelectorAll('li');
  expect(renderedItems.length).to.equal(samples.value.length);

  Array.from(renderedItems).every((renderedItem, index) => {
    const item = samples.value[index];
    expect(renderedItem.textContent).to.contain(element.getText(item));
  });
}

async function testContent(element: List) {
  await element.requestUpdate();
  expect(element).lightDom.to.equal(samples.innerHTML);
}

async function testGetText(element: List) {
  await element.requestUpdate();
  const renderedItems = element.shadowRoot!.querySelectorAll('li');
  expect(renderedItems.length).to.equal(samples.value.length);

  Array.from(renderedItems).every((renderedItem, index) => {
    const item = samples.value[index];
    expect(renderedItem.textContent).to.contain(samples.getText(item));
  });
}

async function testEnabled(element: List) {
  await element.requestUpdate();
  expect(element.disabled).to.be.false;
  const buttons = element.shadowRoot!.querySelectorAll('button');
  Array.from(buttons).every(button => expect(button.disabled).to.be.false);
}

async function testDisabled(element: List) {
  await element.requestUpdate();
  expect(element.disabled).to.be.true;
  const buttons = element.shadowRoot!.querySelectorAll('button');
  Array.from(buttons).every(button => expect(button.disabled).to.be.true);
}

async function testItemRemoval(element: List) {
  await element.requestUpdate();
  const button = element.shadowRoot!.querySelector('li button') as HTMLButtonElement;

  if (element.disabled) {
    expect(button.disabled).to.be.true;
  } else {
    const whenGotChange = new Promise<Event>(resolve => {
      element.addEventListener('change', resolve);
    });

    button.click();

    expect(await whenGotChange).to.be.instanceOf(ListChangeEvent);
    expect(element.value).to.deep.equal(['bar']);
  }
}

const machine = createMachine({
  initial: 'enabled',
  states: {
    enabled: { meta: { test: testEnabled } },
    disabled: { meta: { test: testDisabled } },
    withItems: { meta: { test: testItems } },
    withContent: { meta: { test: testContent } },
    withGetText: { meta: { test: testGetText } },
    canRemoveItems: { meta: { test: testItemRemoval } },
  },
  on: {
    ENABLE: 'enabled',
    DISABLE: 'disabled',
    SET_ITEMS: 'withItems',
    SET_CONTENT: 'withContent',
    REMOVE_ITEM: 'canRemoveItems',
    SET_GET_TEXT: 'withGetText',
  },
});

const model = createModel<List>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ITEMS: { exec: element => void (element.value = samples.value) },
  SET_CONTENT: { exec: element => void (element.innerHTML = samples.innerHTML) },
  REMOVE_ITEM: { exec: element => void (element.value = samples.value) },
  SET_GET_TEXT: {
    exec: element => {
      element.getText = samples.getText;
      element.value = samples.value;
    },
  },
});

describe('List', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => path.test(await fixture('<x-list></x-list>')));
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
