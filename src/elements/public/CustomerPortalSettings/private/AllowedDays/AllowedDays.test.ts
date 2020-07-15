import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { AllowedDays } from './AllowedDays';
import { fixture, expect } from '@open-wc/testing';
import { Choice, WeekdayPicker, MonthdayPicker } from '../../../../private/index';
import { WeekdayPickerChangeEvent, MonthdayPickerChangeEvent } from '../../../../private/events';
import { AllowedDaysChangeEvent } from './AllowedDaysChangeEvent';

customElements.define('x-allowed-days', AllowedDays);

const samples = {
  value: {
    all: undefined,
    day: { type: 'day' as const, days: [0, 3, 6] },
    month: { type: 'month' as const, days: [23, 16, 31] },
  },
};

function getRefs(element: AllowedDays) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    choice: $('[data-testid=choice]') as Choice,
    weekdayPicker: $('[data-testid=weekday-picker]') as WeekdayPicker | null,
    monthdayPicker: $('[data-testid=monthday-picker]') as MonthdayPicker | null,
  };
}

function testEnabled(element: AllowedDays) {
  const refs = getRefs(element);

  expect(refs.choice.disabled).to.be.false;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([false, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([false, undefined]);
}

function testDisabled(element: AllowedDays) {
  const refs = getRefs(element);

  expect(refs.choice.disabled).to.be.true;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([true, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([true, undefined]);
}

function testAll(element: AllowedDays) {
  const refs = getRefs(element);

  expect(element.value).to.be.undefined;
  expect(refs.weekdayPicker).to.be.null;
  expect(refs.monthdayPicker).to.be.null;
}

async function testDay(element: AllowedDays) {
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

async function testMonth(element: AllowedDays) {
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
      initial: 'all',
      states: {
        all: { on: { SET_MONTH: 'month', SET_DAY: 'day' }, meta: { test: testAll } },
        day: { on: { SET_ALL: 'all', SET_MONTH: 'month' }, meta: { test: testDay } },
        month: { on: { SET_ALL: 'all', SET_DAY: 'day' }, meta: { test: testMonth } },
      },
    },
  },
});

const model = createModel<AllowedDays>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ALL: { exec: element => void (element.value = samples.value.all) },
  SET_DAY: { exec: element => void (element.value = samples.value.day) },
  SET_MONTH: { exec: element => void (element.value = samples.value.month) },
});

describe('CustomerPortalSettings >>> AllowedDays', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-allowed-days></x-allowed-days>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
