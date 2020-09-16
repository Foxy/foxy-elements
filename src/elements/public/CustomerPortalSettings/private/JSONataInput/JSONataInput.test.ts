import { expect, fixture } from '@open-wc/testing';
import { createMachine } from 'xstate';
import { JSONataInput } from './JSONataInput';
import { Choice } from '../../../../private/index';
import { createModel } from '@xstate/test';
import { ChoiceChangeEvent } from '../../../../private/events';
import { JSONataInputChangeEvent } from './JSONataInputChangeEvent';

customElements.define('x-jsonata-input', JSONataInput);

const samples = {
  value: {
    wildcard: '*',
    custom: ['$contains(frequency, "w")', '$contains(frequency, "y")'],
  },
};

function getRefs(element: JSONataInput) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    input: $('[data-testid=input]') as HTMLInputElement | null,
    choice: $('[data-testid=choice') as Choice,
  };
}

function testEnabled(element: JSONataInput) {
  const refs = getRefs(element);
  expect(refs.choice.disabled).to.be.false;
  expect(refs.input?.disabled).to.be.oneOf([false, undefined]);
}

function testDisabled(element: JSONataInput) {
  const refs = getRefs(element);
  expect(refs.choice.disabled).to.be.true;
  expect(refs.input?.disabled).to.be.oneOf([true, undefined]);
}

function testWildcard(element: JSONataInput) {
  const { choice, input } = getRefs(element);
  expect(choice.value).to.equal('all');
  expect(input).to.be.null;
}

async function testCustom(element: JSONataInput) {
  const { choice, input } = getRefs(element);

  expect(element.value).to.equal(samples.value.custom[0]);
  expect(choice.value).to.equal('some');
  expect(input).to.be.visible;

  if (!element.disabled) {
    const whenChanged = new Promise(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input!.value = samples.value.custom[1];

    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    input!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));

    input!.dispatchEvent(new Event('change'));
    input!.dispatchEvent(new InputEvent('input', { data: samples.value.custom[1] }));

    const event = (await whenChanged) as JSONataInputChangeEvent;

    expect(event.detail).to.equal(samples.value.custom[1]);
    expect(element.value).to.equal(samples.value.custom[1]);

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

const model = createModel<JSONataInput>(machine).withEvents({
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
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-jsonata-input></x-jsonata-input>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
