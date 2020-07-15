import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { DisallowedDates } from './DisallowedDates';
import { List } from '../../../../private/index';
import { ListChangeEvent } from '../../../../private/events';
import { DisallowedDatesChangeEvent } from './DisallowedDatesChangeEvent';

customElements.define('x-disallowed-dates', DisallowedDates);

const samples = {
  value: [
    new Date(2020, 2, 14).toISOString(),
    new Date(2019, 4, 24).toISOString(),
    new Date(2018, 5, 28).toISOString(),
  ],
};

function getRefs(element: DisallowedDates) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    list: $('[data-testid=list]') as List,
    input: $('[data-testid=input]') as HTMLInputElement,
  };
}

function testEnabled(element: DisallowedDates) {
  const refs = getRefs(element);
  expect(refs.list.disabled).to.be.false;
  expect(refs.input.disabled).to.be.false;
}

function testDisabled(element: DisallowedDates) {
  const refs = getRefs(element);
  expect(refs.list.disabled).to.be.true;
  expect(refs.input.disabled).to.be.true;
}

function testEmpty(element: DisallowedDates) {
  expect(getRefs(element).list.value).to.be.empty;
}

async function testItems(element: DisallowedDates) {
  const { list, input } = getRefs(element);

  expect(list.value).to.deep.equal(element.value);
  expect(list.value).to.deep.equal(samples.value);

  if (!element.disabled) {
    const newValue = samples.value.slice(0, 2);
    let whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));

    list.value = newValue;
    list.dispatchEvent(new ListChangeEvent(newValue));

    let event = (await whenChanged) as DisallowedDatesChangeEvent;

    expect(list.value).to.deep.equal(newValue);
    expect(event.detail).to.deep.equal(newValue);

    const nextYear = new Date().getFullYear() + 1;
    const newItem = `${nextYear}-01-01`;
    whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));

    input.value = newItem;
    input.dispatchEvent(new CustomEvent('change'));

    event = (await whenChanged) as DisallowedDatesChangeEvent;
    const lastItem = new Date(event.detail[event.detail.length - 1]);

    expect(lastItem.getFullYear()).to.equal(nextYear);
    expect(lastItem.getMonth()).to.equal(0);
    expect(lastItem.getDate()).to.equal(1);

    expect(list.value).to.deep.equal(element.value);
    expect(list.value).to.deep.equal(event.detail);
  }

  element.value = samples.value;
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
        withItems: { meta: { test: testItems } },
      },
      on: {
        TEST_ITEMS: '.withItems',
      },
    },
  },
});

const model = createModel<DisallowedDates>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  TEST_ITEMS: { exec: element => void (element.value = samples.value) },
});

describe('CustomerPortalSettings >>> DisallowedDates', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-disallowed-dates></x-disallowed-dates>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
