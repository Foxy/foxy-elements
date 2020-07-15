import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { OriginsList } from './OriginsList';
import { List } from '../../../../private/index';
import { ListChangeEvent } from '../../../../private/events';
import { OriginsListChangeEvent } from './OriginsListChangeEvent';

customElements.define('x-origins-list', OriginsList);

const samples = {
  value: ['https://foxy.io', 'https://foxy-demo.foxycart.com', 'http://localhost:8080'],
};

function getRefs(element: OriginsList) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    list: $('[data-testid=list]') as List,
    input: $('[data-testid=input]') as HTMLInputElement & { validate: () => boolean },
    button: $('[data-testid=button') as HTMLButtonElement,
  };
}

function testEnabled(element: OriginsList) {
  const refs = getRefs(element);

  expect(refs.list.disabled).to.be.false;
  expect(refs.input.disabled).to.be.false;
  expect(refs.button.disabled).to.be.false;
}

function testDisabled(element: OriginsList) {
  const refs = getRefs(element);

  expect(refs.list.disabled).to.be.true;
  expect(refs.input.disabled).to.be.true;
  expect(refs.button.disabled).to.be.true;
}

function testEmpty(element: OriginsList) {
  expect(getRefs(element).list.value).to.be.empty;
}

function testInvalid(element: OriginsList) {
  if (element.disabled) return;

  const { input, button } = getRefs(element);
  const value = input.value;
  const triggers = [
    () => input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' })),
    () => button.click(),
  ];

  for (const trigger of triggers) {
    trigger();
    expect(element.value).not.to.include(value);
    input.value = value;
  }
}

async function testItems(element: OriginsList) {
  const { list, input, button } = getRefs(element);

  expect(list.value).to.deep.equal(element.value);
  expect(list.value).to.deep.equal(samples.value);

  if (!element.disabled) {
    const newValue = samples.value.slice(0, 2);
    let whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));

    list.value = newValue;
    list.dispatchEvent(new ListChangeEvent(newValue));

    let event = (await whenChanged) as OriginsListChangeEvent;

    expect(list.value).to.deep.equal(newValue);
    expect(event.detail).to.deep.equal(newValue);

    const triggers = [
      () => input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' })),
      () => button.click(),
    ];

    for (const trigger of triggers) {
      const newItem = 'https://foxy.dev';
      input.value = newItem;
      input.dispatchEvent(new Event('change'));

      whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));
      trigger();
      event = (await whenChanged) as OriginsListChangeEvent;

      expect(event.detail[event.detail.length - 1]).to.equal(newItem);
      expect(list.value).to.deep.equal(element.value);
      expect(list.value).to.deep.equal(event.detail);
      element.value = samples.value;
    }
  }
}

const machine = createMachine({
  type: 'parallel',
  states: {
    interactivity: {
      initial: 'enabled',
      meta: { test: () => true },
      states: {
        enabled: { on: { DISABLE: 'disabled' }, meta: { test: testEnabled } },
        disabled: { on: { ENABLE: 'enabled' }, meta: { test: testDisabled } },
      },
    },
    content: {
      initial: 'empty',
      meta: { test: () => true },
      states: {
        empty: { meta: { test: testEmpty } },
        invalid: { meta: { test: testInvalid } },
        withItems: { meta: { test: testItems } },
      },
      on: {
        TEST_ITEMS: '.withItems',
        INVALIDATE: '.invalid',
      },
    },
  },
});

const model = createModel<OriginsList>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  TEST_ITEMS: { exec: element => void (element.value = samples.value) },
  INVALIDATE: {
    exec: (element, event) => {
      const value = ((event as unknown) as { value: string }).value;
      const input = getRefs(element).input;

      input.value = value;
      input.validate();
    },
    cases: [{ value: '     ' }, { value: 'httрs://cyrillic.culprit.local' }],
  },
});

describe('CustomerPortalSettings >>> OriginsList', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-origins-list></x-origins-list>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
