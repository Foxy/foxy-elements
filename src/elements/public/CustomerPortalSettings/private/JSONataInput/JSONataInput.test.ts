import { expect, fixture } from '@open-wc/testing';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { ChoiceChangeEvent } from '../../../../private/events';
import { Choice } from '../../../../private/index';
import { JSONataInput } from './JSONataInput';
import { JSONataInputChangeEvent } from './JSONataInputChangeEvent';

class TestJSONataInput extends JSONataInput {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-jsonata-input', TestJSONataInput);

const samples = {
  value: {
    wildcard: '*',
    invalid: '$ooooowhatsthis(def_not_a_function, right)',
    custom: ['$contains(frequency, "w")', '$contains(frequency, "y")'],
  },
};

/**
 * @param element
 */
function getRefs(element: TestJSONataInput) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    input: $('[data-testid=input]') as TextFieldElement | null,
    choice: $('[data-testid=choice]') as Choice,
  };
}

/**
 * @param element
 */
function testEnabled(element: TestJSONataInput) {
  const refs = getRefs(element);
  expect(refs.choice.disabled).to.be.false;
  expect(refs.input?.disabled).to.be.oneOf([false, undefined]);
}

/**
 * @param element
 */
function testDisabled(element: TestJSONataInput) {
  const refs = getRefs(element);
  expect(refs.choice.disabled).to.be.true;
  expect(refs.input?.disabled).to.be.oneOf([true, undefined]);
}

/**
 * @param element
 */
function testWildcard(element: TestJSONataInput) {
  const { choice, input } = getRefs(element);
  expect(choice.value).to.equal('all');
  expect(input).to.be.null;
}

/**
 * @param element
 */
async function testCustom(element: TestJSONataInput) {
  const { choice, input } = getRefs(element);

  expect(element.value).to.equal(samples.value.custom[0]);
  expect(choice.value).to.equal('some');
  expect(input).to.be.visible;

  if (!element.disabled) {
    const whenChanged = new Promise(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    // test navigation blocker
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    // test updates
    input!.value = samples.value.custom[1];
    input!.dispatchEvent(new Event('change'));
    input!.dispatchEvent(new InputEvent('input', { data: samples.value.custom[1] }));

    const event = (await whenChanged) as JSONataInputChangeEvent;

    expect(event.detail).to.equal(samples.value.custom[1]);
    expect(element.value).to.equal(samples.value.custom[1]);

    // test invalid state
    input!.value = samples.value.invalid;
    input!.dispatchEvent(new InputEvent('input', { data: samples.value.invalid }));

    const start = Date.now();
    const retryPeriod = 5000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        expect(input).to.have.property('invalid', true);
        expect(element).to.have.property('value', samples.value.custom[1]);
        break;
      } catch (err) {
        if (Date.now() - start > retryPeriod) throw err;
        await new Promise(resolve => setTimeout(resolve, 25));
      }
    }

    element.value = samples.value.custom[0];
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
      meta: { test: () => true },
      initial: 'wildcard',
      states: {
        wildcard: {
          on: { CHOOSE_CUSTOM: 'custom', SET_CUSTOM: 'custom' },
          meta: { test: testWildcard },
        },
        custom: {
          on: { CHOOSE_WILDCARD: 'wildcard', SET_WILDCARD: 'wildcard' },
          meta: { test: testCustom },
        },
      },
    },
  },
});

const model = createModel<TestJSONataInput>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CUSTOM: { exec: element => void (element.value = samples.value.custom[0]) },
  SET_WILDCARD: { exec: element => void (element.value = samples.value.wildcard) },
  CHOOSE_WILDCARD: {
    exec: async element => {
      const { choice } = getRefs(element);
      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      choice.value = 'all';
      choice.dispatchEvent(new ChoiceChangeEvent('all'));
      await whenChanged;
    },
  },
  CHOOSE_CUSTOM: {
    exec: async element => {
      const { choice } = getRefs(element);
      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      choice.value = 'some';
      choice.dispatchEvent(new ChoiceChangeEvent('some'));
      await whenChanged;
    },
  },
});

describe('CustomerPortalSettings >>> JSONataInput', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestJSONataInput>('<x-jsonata-input></x-jsonata-input>');
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
