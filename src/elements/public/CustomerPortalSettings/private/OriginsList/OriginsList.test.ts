import { expect, fixture } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { createModel } from '@xstate/test';
import { EventObject, createMachine } from 'xstate';
import { getRefs } from '../../../../../utils/test-utils';
import { ListChangeEvent } from '../../../../private/events';
import { List } from '../../../../private';
import { OriginsList } from './OriginsList';

class TestOriginsList extends OriginsList {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-origins-list', TestOriginsList);

interface Refs {
  list: List;
  input: TextFieldElement;
  button: ButtonElement;
}

/**
 * @param disabled
 */
function testDisabled(disabled: boolean) {
  return async (element: TestOriginsList) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);

    expect(refs.list).to.have.property('disabled', disabled);
    expect(refs.input).to.have.property('disabled', disabled);
  };
}

/**
 * @param invalid
 */
function testInvalid(invalid: boolean) {
  return async (element: TestOriginsList) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);

    expect(refs.input).to.have.property('invalid', invalid);
    expect(refs.button).to.have.property('disabled', element.disabled || invalid);
  };
}

/**
 * @param element
 */
async function testValue(element: TestOriginsList) {
  await element.updateComplete;
  const refs = getRefs<Refs>(element);

  expect(refs.list).to.have.deep.property('value', element.value);
}

const machine = createMachine({
  id: 'root',
  initial: 'enabled',
  meta: { test: testValue },
  states: {
    enabled: {
      on: { ENTER_VALID: '.valid', ENTER_INVALID: '.invalid', CLEAR: '.clean.afterClear' },
      meta: { test: testDisabled(false) },
      initial: 'clean',
      states: {
        clean: {
          on: { DISABLE: '#root.disabled.clean' },
          meta: { test: testInvalid(false) },
          states: { any: {}, afterClear: {}, afterSubmit: {} },
          initial: 'any',
        },
        valid: {
          on: { DISABLE: '#root.disabled.valid', SUBMIT: 'clean.afterSubmit' },
          meta: { test: testInvalid(false) },
        },
        invalid: {
          on: { DISABLE: '#root.disabled.invalid' },
          meta: { test: testInvalid(true) },
        },
      },
    },
    disabled: {
      meta: { test: testDisabled(true) },
      initial: 'clean',
      states: {
        clean: { on: { ENABLE: '#root.enabled.clean' }, meta: { test: testInvalid(false) } },
        valid: { on: { ENABLE: '#root.enabled.valid' }, meta: { test: testInvalid(false) } },
        invalid: { on: { ENABLE: '#root.enabled.invalid' }, meta: { test: testInvalid(true) } },
      },
    },
  },
});

const model = createModel<TestOriginsList>(machine).withEvents({
  CLEAR: {
    exec: async function execClear(element) {
      await element.updateComplete;
      const refs = getRefs<Refs>(element);

      refs.input.value = '';
      refs.input.dispatchEvent(new InputEvent('input'));
      await element.updateComplete;

      refs.list.value = [];
      refs.list.dispatchEvent(new ListChangeEvent([]));
      await element.updateComplete;
    },
  },
  SUBMIT: {
    cases: [{ trigger: 'keyboard' }, { trigger: 'mouse' }],
    exec: async function execSubmit(element, event) {
      await element.updateComplete;

      const refs = getRefs<Refs>(element);
      const trigger = (event as EventObject & { trigger: string }).trigger;

      if (trigger === 'keyboard') {
        refs.input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));
      } else {
        refs.button.click();
      }
    },
  },
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
  ENTER_VALID: {
    cases: [{ value: 'http://localhost:8080' }, { value: 'https://foxy.io' }],
    exec: async function execEnterValid(element, event) {
      await element.updateComplete;

      const value = (event as unknown as { value: string }).value;
      const input = getRefs<Refs>(element).input;

      input.value = value;
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new Event('change'));
    },
  },
  ENTER_INVALID: {
    cases: [{ value: 'not a url' }, { value: 'http://insecure.foxy.io' }],
    exec: async function execEnterInvalid(element, event) {
      await element.updateComplete;

      const value = (event as unknown as { value: string }).value;
      const input = getRefs<Refs>(element).input;

      input.value = value;
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new Event('change'));
    },
  },
});

describe('CustomerPortalSettings >>> OriginsList', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestOriginsList>('<x-origins-list></x-origins-list>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
