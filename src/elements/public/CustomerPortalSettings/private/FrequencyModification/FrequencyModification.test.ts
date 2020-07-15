import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Checkbox } from '../../../../private';
import { CheckboxChangeEvent } from '../../../../private/events';
import { FrequencyList } from '../FrequencyList/FrequencyList';
import { FrequencyListChangeEvent } from '../FrequencyList/FrequencyListChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { FrequencyModification } from './FrequencyModification';
import { FrequencyModificationRule } from './FrequencyModificationRule';

customElements.define('x-frequency-modification', FrequencyModification);

const samples = {
  value: {
    default: false,
    wildcard: true,
    custom: [
      { jsonataQuery: '*', values: [] },
      { jsonataQuery: '$contains(frequency, "w")', values: ['2m', '1y'] },
    ],
  },
};

function getRefs(element: FrequencyModification) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    toggle: $('[data-testid=toggle]') as Checkbox,
    jsonata: $('[data-testid=jsonata') as JSONataInput | null,
    frequency: $('[data-testid=frequency') as FrequencyList | null,
  };
}

async function toggle(element: FrequencyModification, checked: boolean) {
  const { toggle } = getRefs(element);
  const whenChanged = new Promise(resolve =>
    element.addEventListener('change', resolve, { once: true })
  );

  toggle.checked = checked;
  toggle.dispatchEvent(new CheckboxChangeEvent(checked));
  await whenChanged;
}

function testEnabled(element: FrequencyModification) {
  const refs = getRefs(element);

  expect(refs.toggle.disabled).to.be.false;
  expect(refs.jsonata?.disabled).to.be.oneOf([false, undefined]);
  expect(refs.frequency?.disabled).to.be.oneOf([false, undefined]);
}

function testDisabled(element: FrequencyModification) {
  const refs = getRefs(element);

  expect(refs.toggle.disabled).to.be.true;
  expect(refs.jsonata?.disabled).to.be.oneOf([true, undefined]);
  expect(refs.frequency?.disabled).to.be.oneOf([true, undefined]);
}

function testRule(rule: FrequencyModificationRule | boolean) {
  return (element: FrequencyModification) => {
    const { toggle, jsonata, frequency } = getRefs(element);
    const resolvedRule = rule === true ? samples.value.custom[0] : rule;

    expect(element.value).to.deep.equal(rule);
    expect(toggle.checked).to.equal(Boolean(rule));

    if (!rule) expect(jsonata).to.be.null;
    if (resolvedRule) expect(jsonata?.value).to.equal(resolvedRule.jsonataQuery);

    if (!rule) expect(frequency).to.be.null;
    if (resolvedRule) expect(frequency?.value).to.deep.equal(resolvedRule.values);
  };
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
      initial: 'disallowed',
      states: {
        disallowed: {
          on: { ALLOW: 'allowed' },
          meta: { test: testRule(false) },
        },
        allowed: {
          on: { ENTER_CUSTOM: 'allowedWithCustomLimits', DISALLOW: 'disallowed' },
          meta: { test: testRule(true) },
        },
        allowedWithCustomLimits: {
          on: { DISALLOW: 'disallowed' },
          meta: { test: testRule(samples.value.custom[1]) },
        },
      },
      on: {
        SET_CUSTOM: '.allowedWithCustomLimits',
        SET_TRUE: '.allowed',
        SET_NONE: '.disallowed',
      },
    },
  },
});

const model = createModel<FrequencyModification>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CUSTOM: { exec: element => void (element.value = samples.value.custom[1]) },
  SET_TRUE: { exec: element => void (element.value = samples.value.wildcard) },
  SET_NONE: { exec: element => void (element.value = samples.value.default) },
  DISALLOW: { exec: element => toggle(element, false) },
  ALLOW: { exec: element => toggle(element, true) },
  ENTER_CUSTOM: {
    exec: async element => {
      const { jsonata, frequency } = getRefs(element);
      const { jsonataQuery, values } = samples.value.custom[1];

      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      jsonata!.value = jsonataQuery;
      jsonata!.dispatchEvent(new JSONataInputChangeEvent(jsonataQuery));

      frequency!.value = values;
      frequency!.dispatchEvent(new FrequencyListChangeEvent(values));

      await whenChanged;
    },
  },
});

describe('CustomerPortalSettings >>> FrequencyModification', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-frequency-modification></x-frequency-modification>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
