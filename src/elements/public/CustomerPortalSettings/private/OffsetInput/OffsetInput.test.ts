import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Choice } from '../../../../private/index';
import { ChoiceChangeEvent } from '../../../../private/events';
import { FrequencyInput } from '../FrequencyInput/FrequencyInput';
import { OffsetInput } from './OffsetInput';
import { OffsetInputChangeEvent } from './OffsetInputChangeEvent';

customElements.define('x-offset-input', OffsetInput);

const samples = {
  value: {
    none: undefined,
    custom: ['1w', '4y'],
  },
};

async function getRefs(element: OffsetInput) {
  await element.requestUpdate();
  const $ = (selector: string) => element.renderRoot.querySelector(selector);

  return {
    input: $('[data-testid=input]') as FrequencyInput | null,
    choice: $('[data-testid=choice') as Choice,
  };
}

async function testEnabled(element: OffsetInput) {
  const refs = await getRefs(element);
  expect(refs.choice.disabled).to.be.false;
  expect(refs.input?.disabled).to.be.oneOf([false, undefined]);
}

async function testDisabled(element: OffsetInput) {
  const refs = await getRefs(element);
  expect(refs.choice.disabled).to.be.true;
  expect(refs.input?.disabled).to.be.oneOf([true, undefined]);
}

async function testNone(element: OffsetInput) {
  const { choice, input } = await getRefs(element);
  expect(choice.value).to.equal('none');
  expect(input).to.be.null;
}

async function testCustom(element: OffsetInput) {
  const { choice, input } = await getRefs(element);

  expect(element.value).to.equal(samples.value.custom[0]);
  expect(choice.value).to.equal('custom');
  expect(input).to.be.visible;

  if (!element.disabled) {
    const whenChanged = new Promise(resolve =>
      element.addEventListener('change', resolve, { once: true })
    );

    input!.value = samples.value.custom[1];
    input!.dispatchEvent(new OffsetInputChangeEvent(samples.value.custom[1]));

    const event = (await whenChanged) as OffsetInputChangeEvent;

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
      initial: 'none',
      states: {
        none: {
          on: { CHOOSE_CUSTOM: 'custom', SET_CUSTOM: 'custom' },
          meta: { test: testNone },
        },
        custom: {
          on: { CHOOSE_NONE: 'none', SET_NONE: 'none' },
          meta: { test: testCustom },
        },
      },
    },
  },
});

const model = createModel<OffsetInput>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CUSTOM: { exec: element => void (element.value = samples.value.custom[0]) },
  SET_NONE: { exec: element => void (element.value = samples.value.none) },
  CHOOSE_NONE: {
    exec: async element => {
      const { choice } = await getRefs(element);
      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      choice.value = 'none';
      choice.dispatchEvent(new ChoiceChangeEvent('none'));
      await whenChanged;
    },
  },
  CHOOSE_CUSTOM: {
    exec: async element => {
      const { choice } = await getRefs(element);
      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      choice.value = 'custom';
      choice.dispatchEvent(new ChoiceChangeEvent('custom'));
      await whenChanged;
    },
  },
});

describe('CustomerPortalSettings >>> OffsetInput', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-offset-input></x-offset-input>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
