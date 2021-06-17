import { Choice, MonthdayPicker, WeekdayPicker } from '../../../../private';
import { MonthdayPickerChangeEvent, WeekdayPickerChangeEvent } from '../../../../private/events';
import { expect, fixture } from '@open-wc/testing';
import { AllowedDays } from './AllowedDays';
import { AllowedDaysChangeEvent } from './AllowedDaysChangeEvent';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';

class TestAllowedDays extends AllowedDays {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-allowed-days', TestAllowedDays);

const samples = {
  value: {
    all: undefined,
    day: { days: [0, 3, 6], type: 'day' as const },
    month: { days: [23, 16, 31], type: 'month' as const },
  },
};

/**
 * @param element
 */
function getRefs(element: TestAllowedDays) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    choice: $('[data-testid=choice]') as Choice,
    monthdayPicker: $('[data-testid=monthday-picker]') as MonthdayPicker | null,
    weekdayPicker: $('[data-testid=weekday-picker]') as WeekdayPicker | null,
  };
}

/**
 * @param element
 */
function testEnabled(element: TestAllowedDays) {
  const refs = getRefs(element);

  expect(refs.choice.disabled).to.be.false;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([false, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([false, undefined]);
}

/**
 * @param element
 */
function testDisabled(element: TestAllowedDays) {
  const refs = getRefs(element);

  expect(refs.choice.disabled).to.be.true;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([true, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([true, undefined]);
}

/**
 * @param element
 */
function testAll(element: TestAllowedDays) {
  const refs = getRefs(element);

  expect(element.value).to.be.undefined;
  expect(refs.weekdayPicker).to.be.null;
  expect(refs.monthdayPicker).to.be.null;
}

/**
 * @param element
 */
async function testDay(element: TestAllowedDays) {
  const refs = getRefs(element);

  expect(element.value).to.deep.equal(samples.value.day);
  expect(refs.choice.value).to.equal(samples.value.day.type);
  expect(refs.weekdayPicker).to.be.visible;
  expect(refs.weekdayPicker?.value).to.deep.equal(samples.value.day.days);
  expect(refs.monthdayPicker).to.be.null;

  if (!element.disabled) {
    const newValue = samples.value.day.days.slice(0, 2);
    const whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));
    refs.weekdayPicker?.dispatchEvent(new WeekdayPickerChangeEvent(newValue));
    const event = (await whenChanged) as AllowedDaysChangeEvent;

    expect(event.detail?.days).to.deep.equal(newValue);
  }
}

/**
 * @param element
 */
async function testMonth(element: TestAllowedDays) {
  const refs = getRefs(element);

  expect(element.value).to.deep.equal(samples.value.month);
  expect(refs.choice.value).to.equal(samples.value.month.type);
  expect(refs.monthdayPicker).to.be.visible;
  expect(refs.monthdayPicker?.value).to.deep.equal(samples.value.month.days);
  expect(refs.weekdayPicker).to.be.null;

  if (!element.disabled) {
    const newValue = samples.value.month.days.slice(0, 2);
    const whenChanged = new Promise(res => element.addEventListener('change', res, { once: true }));
    refs.monthdayPicker?.dispatchEvent(new MonthdayPickerChangeEvent(newValue));
    const event = (await whenChanged) as AllowedDaysChangeEvent;

    expect(event.detail?.days).to.deep.equal(newValue);
  }
}

const machine = createMachine({
  type: 'parallel',
  states: {
    content: {
      initial: 'all',
      meta: { test: () => true },
      states: {
        all: { on: { SET_MONTH: 'month', SET_DAY: 'day' }, meta: { test: testAll } },
        day: { on: { SET_ALL: 'all', SET_MONTH: 'month' }, meta: { test: testDay } },
        month: { on: { SET_ALL: 'all', SET_DAY: 'day' }, meta: { test: testMonth } },
      },
    },
    interactivity: {
      initial: 'enabled',
      meta: { test: () => true },
      states: {
        disabled: { on: { ENABLE: 'enabled' }, meta: { test: testDisabled } },
        enabled: { on: { DISABLE: 'disabled' }, meta: { test: testEnabled } },
      },
    },
  },
});

const model = createModel<TestAllowedDays>(machine).withEvents({
  DISABLE: { exec: element => void (element.disabled = true) },
  ENABLE: { exec: element => void (element.disabled = false) },
  SET_ALL: { exec: element => void (element.value = samples.value.all) },
  SET_DAY: { exec: element => void (element.value = samples.value.day) },
  SET_MONTH: { exec: element => void (element.value = samples.value.month) },
});

describe('CustomerPortalSettings >>> AllowedDays', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestAllowedDays>('<x-allowed-days></x-allowed-days>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
