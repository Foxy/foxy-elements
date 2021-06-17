import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Dropdown } from '../../../../private';
import { DropdownChangeEvent } from '../../../../private/events';
import { FrequencyInput } from './FrequencyInput';
import { FrequencyInputChangeEvent } from './FrequencyInputChangeEvent';

class TestFrequencyInput extends FrequencyInput {
  get whenI18nReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-frequency-input', TestFrequencyInput);

const samples = {
  value: {
    composed: '2y',
    units: 'y',
    value: '2',
  },
  newValue: {
    composed: '4d',
    units: 'd',
    value: '4',
  },
};

/**
 * @param element
 */
function getRefs(element: FrequencyInput) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    value: $('[data-testid=value]') as HTMLInputElement,
    units: $('[data-testid=units]') as Dropdown,
  };
}

/**
 * @param element
 */
async function testEnabled(element: TestFrequencyInput) {
  await element.whenI18nReady;
  const refs = getRefs(element);

  expect(refs.value.disabled).to.be.false;
  expect(refs.units.disabled).to.be.false;
}

/**
 * @param element
 */
async function testDisabled(element: TestFrequencyInput) {
  await element.whenI18nReady;
  const refs = getRefs(element);

  expect(refs.value.disabled).to.be.true;
  expect(refs.units.disabled).to.be.true;
}

/**
 * @param element
 */
async function testEmpty(element: TestFrequencyInput) {
  await element.whenI18nReady;
  const { units, value } = getRefs(element);

  expect(element.value).to.equal('1w');
  expect(units.value).to.equal('w');
  expect(value.value).to.equal('1');
}

/**
 * @param element
 */
async function testWithValue(element: TestFrequencyInput) {
  await element.whenI18nReady;
  const { units, value } = getRefs(element);

  expect(element.value).to.equal(samples.value.composed);
  expect(units.value).to.equal(samples.value.units);
  expect(value.value).to.equal(samples.value.value);

  if (!element.disabled) {
    units.value = samples.newValue.units;
    units.dispatchEvent(new DropdownChangeEvent(samples.newValue.units));

    const whenChanged = new Promise(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    value.value = samples.newValue.value;
    value.dispatchEvent(new Event('change'));
    const event = (await whenChanged) as FrequencyInputChangeEvent;

    expect(element.value).to.equal(samples.newValue.composed);
    expect(event.detail).to.equal(samples.newValue.composed);

    element.value = samples.value.composed;
  }
}

const machine = createMachine({
  type: 'parallel',
  states: {
    interactivity: {
      meta: { test: () => true },
      initial: 'enabled',
      states: {
        enabled: { on: { DISABLE: 'disabled' }, meta: { test: testEnabled } },
        disabled: { on: { ENABLE: 'enabled' }, meta: { test: testDisabled } },
      },
    },
    content: {
      meta: { test: () => true },
      initial: 'empty',
      states: {
        empty: { on: { SET_VALUE: 'withValue' }, meta: { test: testEmpty } },
        withValue: { meta: { test: testWithValue } },
      },
    },
  },
});

const model = createModel<FrequencyInput>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_VALUE: { exec: element => void (element.value = samples.value.composed) },
});

describe('CustomerPortalSettings >>> FrequencyInput', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-frequency-input></x-frequency-input>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
