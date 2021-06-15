import { expect, fixture, oneEvent } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { parseDate } from '../../../../../utils/parse-date';
import { getRefs } from '../../../../../utils/test-utils';
import { ListChangeEvent } from '../../../../private/events';
import { List } from '../../../../private/index';
import { DisallowedDates } from './DisallowedDates';
import { DisallowedDatesChangeEvent } from './DisallowedDatesChangeEvent';

class TestDisallowedDates extends DisallowedDates {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-disallowed-dates', TestDisallowedDates);

interface Refs {
  submit: ButtonElement;
  start: DatePickerElement;
  list: List;
  end: DatePickerElement;
}

/**
 * @param {...any} tests
 */
function all<TElement extends HTMLElement>(...tests: ((element: TElement) => Promise<void>)[]) {
  return async (element: TElement) => {
    for (const test of tests) await test(element);
  };
}

/**
 * @param ref
 */
function off(ref: keyof Refs) {
  return async (element: TestDisallowedDates) => {
    await element.updateComplete;
    expect(getRefs<Refs>(element)[ref]).to.have.property('disabled', true);
  };
}

/**
 * @param ref
 */
function on(ref: keyof Refs) {
  return async (element: TestDisallowedDates) => {
    await element.updateComplete;
    expect(getRefs<Refs>(element)[ref]).to.have.property('disabled', false);
  };
}

/**
 * @param element
 */
async function setsValue(element: TestDisallowedDates) {
  await element.updateComplete;
  expect(getRefs<Refs>(element).list).to.have.deep.property('value', element.value);
}

const machine = createMachine({
  id: 'root',
  meta: { test: setsValue },
  initial: 'clean',
  states: {
    clean: {
      initial: 'enabled',
      states: {
        enabled: {
          on: { SELECT_START: '#root.withStartSelected', DISABLE: 'disabled', CLEAR: '.cleared' },
          meta: { test: all(off('submit'), on('start'), on('list'), off('end')) },
          initial: 'default',
          states: {
            default: {},
            updated: {},
            cleared: {},
          },
        },
        disabled: {
          meta: { test: all(off('submit'), off('start'), off('list'), off('end')) },
          on: { ENABLE: 'enabled' },
        },
      },
    },
    withEndSelected: {
      initial: 'enabled',
      states: {
        enabled: {
          meta: { test: all(on('submit'), on('start'), on('list'), on('end')) },
          on: {
            AUTO_RESET_END: '#root.withStartSelected.enabled.updated',
            DISABLE: 'disabled',
            SUBMIT: '#root.clean.enabled.updated',
            CLEAR: '.cleared',
          },
          initial: 'default',
          states: {
            default: {},
            cleared: {},
          },
        },
        disabled: {
          meta: { test: all(off('submit'), off('start'), off('list'), off('end')) },
          on: { ENABLE: 'enabled' },
        },
      },
    },
    withStartSelected: {
      initial: 'enabled',
      states: {
        enabled: {
          meta: { test: all(on('submit'), on('start'), on('list'), on('end')) },
          initial: 'default',
          states: {
            default: {},
            updated: {},
            cleared: {},
          },
          on: {
            SELECT_END: '#root.withEndSelected',
            DISABLE: 'disabled',
            SUBMIT: '#root.clean.enabled.updated',
            CLEAR: '.cleared',
          },
        },
        disabled: {
          meta: { test: all(off('submit'), off('start'), off('list'), off('end')) },
          on: { ENABLE: 'enabled' },
        },
      },
    },
  },
});

const model = createModel<TestDisallowedDates>(machine).withEvents({
  AUTO_RESET_END: {
    exec: async element => {
      await element.updateComplete;
      const { start, end } = getRefs<Refs>(element);
      const newStartDate = parseDate(end.value) ?? new Date();

      newStartDate.setMonth(newStartDate.getMonth() + 1);
      newStartDate.setDate(newStartDate.getDate() + 1);

      const newValue = [
        String(newStartDate.getFullYear()).padStart(4, '0'),
        String(newStartDate.getMonth()).padStart(2, '0'),
        String(newStartDate.getDate()).padStart(2, '0'),
      ].join('-');

      start.value = newValue;
      start.dispatchEvent(new CustomEvent('change'));

      expect(start).to.have.deep.property('value', newValue);
    },
  },
  SELECT_START: {
    exec: async element => {
      await element.updateComplete;
      const { start } = getRefs<Refs>(element);

      const newStartDate = new Date();
      const newValue = [
        String(newStartDate.getFullYear()).padStart(4, '0'),
        String(newStartDate.getMonth() + 1).padStart(2, '0'),
        String(newStartDate.getDate()).padStart(2, '0'),
      ].join('-');

      start.value = newValue;
      start.dispatchEvent(new CustomEvent('change'));

      expect(start).to.have.deep.property('value', newValue);
    },
  },
  SELECT_END: {
    exec: async element => {
      await element.updateComplete;
      const { start, end } = getRefs<Refs>(element);

      const newEndDate = parseDate(start.value)!;
      newEndDate.setDate(newEndDate.getDate() + 1);
      const newValue = [
        String(newEndDate.getFullYear()).padStart(4, '0'),
        String(newEndDate.getMonth() + 1).padStart(2, '0'),
        String(newEndDate.getDate()).padStart(2, '0'),
      ].join('-');

      end.value = newValue;
      end.dispatchEvent(new CustomEvent('change'));

      expect(end).to.have.deep.property('value', newValue);
    },
  },
  DISABLE: {
    exec: async element => {
      await element.updateComplete;
      element.disabled = true;
    },
  },
  ENABLE: {
    exec: async element => {
      await element.updateComplete;
      element.disabled = false;
    },
  },
  SUBMIT: {
    exec: async element => {
      await element.updateComplete;

      const whenCapturedEvent = oneEvent(element, 'change');
      getRefs<Refs>(element).submit.click();
      const event = await whenCapturedEvent;

      expect(event).to.be.instanceOf(DisallowedDatesChangeEvent);
      expect(event).to.have.property('detail', element.value);
    },
  },
  CLEAR: {
    exec: async element => {
      await element.updateComplete;
      const list = getRefs<Refs>(element).list;
      const newValue = [] as DisallowedDates['value'];

      list.value = newValue;
      list.dispatchEvent(new ListChangeEvent(newValue));

      await list.updateComplete;
      await element.updateComplete;

      expect(list).to.have.deep.property('value', newValue);
      expect(element).to.have.deep.property('value', newValue);
    },
  },
});

describe('CustomerPortalSettings >>> DisallowedDates', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-disallowed-dates></x-disallowed-dates>';
          const element = await fixture<TestDisallowedDates>(layout);
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
