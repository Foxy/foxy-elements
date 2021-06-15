import { expect, fixture } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { getRefs } from '../../../../../utils/test-utils';
import { SessionSecret } from './SessionSecret';

class TestSessionSecret extends SessionSecret {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-session-secret', TestSessionSecret);

interface Refs {
  input: PasswordFieldElement;
  button: ButtonElement;
}

/**
 * @param disabled
 */
function testDisabled(disabled: boolean) {
  return async (element: TestSessionSecret) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);
    expect(refs.input).to.have.property('disabled', disabled);
    expect(refs.button).to.have.property('disabled', disabled);
  };
}

/**
 * @param invalid
 */
function testInvalid(invalid: boolean) {
  return async (element: TestSessionSecret) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);
    expect(refs.input).to.have.property('invalid', invalid && !element.disabled);
  };
}

/**
 * @param element
 */
async function testValue(element: TestSessionSecret) {
  await element.updateComplete;
  const refs = getRefs<Refs>(element);

  expect(refs.input).to.have.property('value', element.value);
}

const machine = createMachine({
  id: 'root',
  initial: 'enabled',
  meta: { test: testValue },
  states: {
    enabled: {
      on: { ENTER_VALID: '.valid', ENTER_INVALID: '.invalid' },
      meta: { test: testDisabled(false) },
      initial: 'clean',
      states: {
        clean: {
          on: { DISABLE: '#root.disabled.clean' },
          meta: { test: testInvalid(true) },
        },
        valid: {
          on: { DISABLE: '#root.disabled.valid', RESET: '.afterReset' },
          meta: { test: testInvalid(false) },
          states: { any: {}, afterReset: {} },
          initial: 'any',
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
        clean: { on: { ENABLE: '#root.enabled.clean' }, meta: { test: testInvalid(true) } },
        valid: { on: { ENABLE: '#root.enabled.valid' }, meta: { test: testInvalid(false) } },
        invalid: { on: { ENABLE: '#root.enabled.invalid' }, meta: { test: testInvalid(true) } },
      },
    },
  },
});

const model = createModel<TestSessionSecret>(machine).withEvents({
  RESET: {
    exec: async function execReset(element) {
      await element.updateComplete;
      getRefs<Refs>(element).button.click();
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
    exec: async function execEnterValid(element) {
      await element.updateComplete;
      const input = getRefs<Refs>(element).input;

      input.value = 'jwt-shared-secret-value-that-is-40-or-more-characters-long';
      input.dispatchEvent(new InputEvent('input'));
      input.dispatchEvent(new Event('change'));
    },
  },
  ENTER_INVALID: {
    cases: [
      { value: 'too-short' },
      { value: 'будьте добры писать латиницей с цифрами, уважаемые' },
      {
        value:
          'totally-random-json-web-token-shared-secret-value-that-is-more-than-one-hundred-characters-in-length-and-therefore-invalid',
      },
    ],
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

describe('CustomerPortalSettings >>> SessionSecret', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestSessionSecret>('<x-session-secret></x-session-secret>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
