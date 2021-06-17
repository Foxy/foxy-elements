import { expect, fixture } from '@open-wc/testing';
import { CustomFieldElement } from '@vaadin/vaadin-custom-field';
import { SelectElement } from '@vaadin/vaadin-select';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { createModel } from '@xstate/test';
import { EventObject, createMachine } from 'xstate';
import { getRefs } from '../../../../../utils/test-utils';
import { I18N } from '../../../../private';
import { SessionDuration } from './SessionDuration';

class TestSessionDuration extends SessionDuration {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-session-duration', TestSessionDuration);

interface Refs {
  field: CustomFieldElement;
  count: IntegerFieldElement;
  units: SelectElement;
  error: I18N;
}

const valuesMap = {
  40321: ['40321', 'm'],
  10080: ['1', 'w'],
  1440: ['1', 'd'],
  60: ['1', 'h'],
  1: ['1', 'm'],
  0: ['0', 'm'],
} as const;

/**
 * @param disabled
 */
function testDisabled(disabled: boolean) {
  return async (element: TestSessionDuration) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);

    if (disabled) expect(refs.field).to.have.attribute('disabled');
    expect(refs.count).to.have.property('disabled', disabled);
    expect(refs.units).to.have.property('disabled', disabled);
  };
}

/**
 * @param invalid
 */
function testInvalid(invalid: boolean) {
  return async (element: TestSessionDuration) => {
    await element.updateComplete;
    let assertion = expect(getRefs<Refs>(element).error);
    if (!invalid || element.disabled) assertion = assertion.not;
    assertion.to.have.class('text-error');
  };
}

/**
 * @param element
 */
async function testValue(element: TestSessionDuration) {
  await element.updateComplete;

  const refs = getRefs<Refs>(element);
  const [count, units] = valuesMap[element.value as keyof typeof valuesMap];

  expect(refs.field).to.have.property('value', element.value.toString());
  expect(refs.count).to.have.property('value', count);
  expect(refs.units).to.have.property('value', units);
}

/**
 * @param element
 * @param event
 */
async function execEnter(element: TestSessionDuration, event: EventObject) {
  await element.updateComplete;

  const refs = getRefs<Refs>(element);
  const value = (event as EventObject & { value: number }).value;
  const [count, units] = valuesMap[value as keyof typeof valuesMap];

  refs.count.value = count;
  refs.count.dispatchEvent(new CustomEvent('change', { bubbles: true }));
  await element.updateComplete;

  refs.units.value = units;
  refs.units.dispatchEvent(new CustomEvent('change', { bubbles: true }));
}

/**
 * @param element
 * @param event
 */
async function execSet(element: TestSessionDuration, event: EventObject) {
  element.value = (event as EventObject & { value: number }).value;
}

const machine = createMachine({
  id: 'root',
  meta: { test: testValue },
  initial: 'enabled',
  states: {
    enabled: {
      initial: 'any',
      meta: { test: testDisabled(false) },
      on: {
        SET_VALID: '.valid.setInCode',
        ENTER_VALID: '.valid.setByUser',
        ENTER_INVALID: '.invalid.setByUser',
      },
      states: {
        any: {},
        valid: {
          meta: { test: testInvalid(false) },
          initial: 'any',
          states: {
            any: {},
            setInCode: { on: { DISABLE: '#root.disabled.valid.setInCode' } },
            setByUser: { on: { DISABLE: '#root.disabled.valid.setByUser' } },
          },
        },
        invalid: {
          meta: { test: testInvalid(true) },
          initial: 'any',
          states: {
            any: {},
            setInCode: { on: { DISABLE: '#root.disabled.invalid.setInCode' } },
            setByUser: { on: { DISABLE: '#root.disabled.invalid.setByUser' } },
          },
        },
      },
    },
    disabled: {
      initial: 'valid',
      meta: { test: testDisabled(true) },
      states: {
        valid: {
          meta: { test: testInvalid(false) },
          initial: 'any',
          states: {
            any: {},
            setInCode: { on: { ENABLE: '#root.enabled.valid.setInCode' } },
            setByUser: { on: { ENABLE: '#root.enabled.valid.setByUser' } },
          },
        },
        invalid: {
          meta: { test: testInvalid(true) },
          initial: 'any',
          states: {
            any: {},
            setInCode: { on: { ENABLE: '#root.enabled.invalid.setInCode' } },
            setByUser: { on: { ENABLE: '#root.enabled.invalid.setByUser' } },
          },
        },
      },
    },
  },
});

const model = createModel<TestSessionDuration>(machine).withEvents({
  ENABLE: {
    exec: async function execEnable(element) {
      element.disabled = false;
      expect(element).to.have.property('disabled', false);
    },
  },
  DISABLE: {
    exec: async function execDisable(element) {
      element.disabled = true;
      expect(element).to.have.property('disabled', true);
    },
  },
  SET_VALID: {
    cases: [{ value: 10080 }, { value: 1440 }, { value: 60 }],
    exec: execSet,
  },
  ENTER_VALID: {
    cases: [{ value: 10080 }, { value: 1440 }, { value: 60 }],
    exec: execEnter,
  },
  ENTER_INVALID: {
    cases: [{ value: 0 }, { value: 40321 }],
    exec: execEnter,
  },
});

describe('CustomerPortalSettings >>> SessionDuration', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-session-duration></x-session-duration>';
          const element = await fixture<TestSessionDuration>(layout);
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
