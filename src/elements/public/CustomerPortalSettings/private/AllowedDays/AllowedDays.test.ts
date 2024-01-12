import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { AllowedDays } from './AllowedDays';
import { fixture, expect } from '@open-wc/testing';
import { Choice, WeekdayPicker, MonthdayPicker } from '../../../../private/index';
import { WeekdayPickerChangeEvent, MonthdayPickerChangeEvent } from '../../../../private/events';
import { AllowedDaysChangeEvent } from './AllowedDaysChangeEvent';

class TestAllowedDays extends AllowedDays {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-allowed-days', TestAllowedDays);

const samples = {
  value: {
    all: undefined,
    day: { type: 'day' as const, days: [0, 3, 6] },
    month: { type: 'month' as const, days: [23, 16, 31] },
  },
};

async function getRefs(element: TestAllowedDays) {
  await element.requestUpdate();
  const $ = (selector: string) => element.renderRoot.querySelector(selector);

  return {
    choice: $('[data-testid=choice]') as Choice,
    weekdayPicker: $('[data-testid=weekday-picker]') as WeekdayPicker | null,
    monthdayPicker: $('[data-testid=monthday-picker]') as MonthdayPicker | null,
  };
}

async function testEnabled(element: TestAllowedDays) {
  const refs = await getRefs(element);

  expect(refs.choice.disabled).to.be.false;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([false, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([false, undefined]);
}

async function testDisabled(element: TestAllowedDays) {
  const refs = await getRefs(element);

  expect(refs.choice.disabled).to.be.true;
  expect(refs.weekdayPicker?.disabled).to.be.oneOf([true, undefined]);
  expect(refs.monthdayPicker?.disabled).to.be.oneOf([true, undefined]);
}

async function testAll(element: TestAllowedDays) {
  const refs = await getRefs(element);

  expect(element.value).to.be.undefined;
  expect(refs.weekdayPicker).to.be.null;
  expect(refs.monthdayPicker).to.be.null;
}

async function testDay(element: TestAllowedDays) {
  const refs = await getRefs(element);

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

async function testMonth(element: TestAllowedDays) {
  const refs = await getRefs(element);

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

const model = createModel<TestAllowedDays>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_ALL: { exec: element => void (element.value = samples.value.all) },
  SET_DAY: { exec: element => void (element.value = samples.value.day) },
  SET_MONTH: { exec: element => void (element.value = samples.value.month) },
});

describe('CustomerPortalSettings >>> AllowedDays', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

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
