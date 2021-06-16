import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { FrequencyList } from './FrequencyList';
import { List } from '../../../../private/index';
import { ListChangeEvent } from '../../../../private/events';
import { FrequencyListChangeEvent } from './FrequencyListChangeEvent';
import { FrequencyInput } from '../FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../FrequencyInput/FrequencyInputChangeEvent';

class TestFrequencyList extends FrequencyList {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-frequency-list', TestFrequencyList);

const samples = {
  value: ['1w', '12m', '5y'],
  newValue: '4d',
};

/**
 * @param element
 */
function getRefs(element: TestFrequencyList) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    list: $('[data-testid=list]') as List,
    input: $('[data-testid=input]') as FrequencyInput,
    button: $('[data-testid=button]') as HTMLButtonElement,
  };
}

/**
 * @param element
 */
function testEnabled(element: TestFrequencyList) {
  const refs = getRefs(element);

  expect(refs.list.disabled).to.be.false;
  expect(refs.input.disabled).to.be.false;
  expect(refs.button.disabled).to.be.false;
}

/**
 * @param element
 */
function testDisabled(element: TestFrequencyList) {
  const refs = getRefs(element);

  expect(refs.list.disabled).to.be.true;
  expect(refs.input.disabled).to.be.true;
  expect(refs.button.disabled).to.be.true;
}

/**
 * @param element
 */
function testEmpty(element: TestFrequencyList) {
  expect(getRefs(element).list.value).to.be.empty;
}

/**
 * @param element
 */
async function testItems(element: TestFrequencyList) {
  const { list, input, button } = getRefs(element);

  expect(list.value).to.deep.equal(element.value);
  expect(list.value).to.deep.equal(samples.value);

  if (!element.disabled) {
    const newValue = samples.value.slice(0, 2);
    let whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));

    list.value = newValue;
    list.dispatchEvent(new ListChangeEvent(newValue));

    let event = (await whenChanged) as FrequencyListChangeEvent;

    expect(list.value).to.deep.equal(newValue);
    expect(event.detail).to.deep.equal(newValue);

    input.value = samples.newValue;
    input.dispatchEvent(new FrequencyInputChangeEvent(samples.newValue));

    whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));
    button.click();
    event = (await whenChanged) as FrequencyListChangeEvent;

    expect(event.detail[event.detail.length - 1]).to.equal(samples.newValue);
    expect(list.value).to.deep.equal(element.value);
    expect(list.value).to.deep.equal(event.detail);
    element.value = samples.value;
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
        empty: { meta: { test: testEmpty }, on: { TEST_ITEMS: 'withItems' } },
        withItems: { meta: { test: testItems } },
      },
    },
  },
});

const model = createModel<TestFrequencyList>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  TEST_ITEMS: { exec: element => void (element.value = samples.value) },
});

describe('CustomerPortalSettings >>> FrequencyList', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestFrequencyList>('<x-frequency-list></x-frequency-list>');
          await element.whenReady;
          path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
