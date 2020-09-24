import { expect, fixture, oneEvent } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Checkbox } from '../../../../private';
import { CheckboxChangeEvent } from '../../../../private/Checkbox/CheckboxChangeEvent';
import { FrequencyModificationRule } from '../FrequencyModificationRule/FrequencyModificationRule';
import { FrequencyModificationRuleChangeEvent } from '../FrequencyModificationRule/FrequencyModificationRuleChangeEvent';
import { FrequencyModificationRuleRemoveEvent } from '../FrequencyModificationRule/FrequencyModificationRuleRemoveEvent';
import { Rule } from '../FrequencyModificationRule/types';
import { FrequencyModification } from './FrequencyModification';
import { FrequencyModificationChangeEvent } from './FrequencyModificationChangeEvent';
import { Ruleset } from './types';

customElements.define('x-ruleset', FrequencyModification);

const samples = {
  modified: { jsonataQuery: '$contains(frequency, "m")', values: ['2m', '3y'] },
  custom: [{ jsonataQuery: '*', values: [] }],
};

function getRefs(element: FrequencyModification) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector) as unknown;
  const $$ = (selector: string) => element.shadowRoot!.querySelectorAll(selector) as unknown;

  return {
    toggle: $('[data-testid=toggle]') as Checkbox,
    rules: Array.from($$('[data-testid=rule]') as FrequencyModificationRule[]),
    add: $('[data-testid=add') as HTMLButtonElement,
  };
}

function testInteractivity(disabled: boolean) {
  return async (element: FrequencyModification) => {
    await element.updateComplete;

    expect(element).to.have.property('disabled', disabled);
    const { rules, add } = getRefs(element);
    rules.every(rule => expect(rule).to.have.property('disabled', disabled));

    if (element.value) expect(add).to.have.property('disabled', disabled);
  };
}

function testContent(value: Ruleset) {
  return async (element: FrequencyModification) => {
    await element.updateComplete;
    const rules = getRefs(element).rules;

    if (typeof value === 'boolean') {
      expect(rules).to.be.empty;
    } else {
      expect(rules.length).to.equal(value.length);
      Array.from(rules).every((rule, index) => {
        const item = value[index];
        expect(rule.value).to.deep.equal(item);
      });
    }

    if (!element.disabled && typeof value !== 'boolean' && value.length > 0) {
      let whenGotEvent = oneEvent(element, 'change');
      rules[0].dispatchEvent(new FrequencyModificationRuleChangeEvent(samples.modified));

      expect(await whenGotEvent).to.be.instanceOf(FrequencyModificationChangeEvent);
      expect((element.value as Rule[])[0]).to.deep.equal(samples.modified);

      whenGotEvent = oneEvent(element, 'change');
      rules[0].dispatchEvent(new FrequencyModificationRuleRemoveEvent());

      const expectedValue = value.length > 1 ? value.slice(1) : true;
      expect(await whenGotEvent).to.be.instanceOf(FrequencyModificationChangeEvent);
      expect(element.value).to.deep.equal(expectedValue);

      element.value = value;
    }
  };
}

const machine = createMachine({
  type: 'parallel',
  states: {
    interactivity: {
      meta: { test: () => true },
      initial: 'enabled',
      states: {
        enabled: {
          on: { DISABLE: 'disabled' },
          meta: { test: testInteractivity(false) },
        },
        disabled: {
          on: { ENABLE: 'enabled' },
          meta: { test: testInteractivity(true) },
        },
      },
    },
    content: {
      meta: { test: () => true },
      initial: 'disallowed',
      states: {
        disallowed: {
          on: { ALLOW: 'allowed' },
          meta: { test: testContent(false) },
        },
        allowed: {
          on: { DISALLOW: 'disallowed' },
          initial: 'basic',
          states: {
            basic: { meta: { test: testContent(true) }, on: { CUSTOMIZE: 'custom' } },
            custom: { meta: { test: testContent(samples.custom) } },
          },
        },
      },
    },
  },
});

describe('FrequencyModification', () => {
  describe('Actor: USER', () => {
    const model = createModel<FrequencyModification>(machine).withEvents({
      DISALLOW: { exec: e => void getRefs(e).toggle.dispatchEvent(new CheckboxChangeEvent(false)) },
      ALLOW: { exec: e => void getRefs(e).toggle.dispatchEvent(new CheckboxChangeEvent(true)) },
      ENABLE: { exec: e => void (e.disabled = false) },
      DISABLE: { exec: e => void (e.disabled = true) },
      CUSTOMIZE: { exec: e => void getRefs(e).add.dispatchEvent(new Event('click')) },
    });

    model.getShortestPathPlans().forEach(plan => {
      describe(plan.description, () => {
        plan.paths.forEach(path => {
          it(path.description, async () => path.test(await fixture('<x-ruleset></x-ruleset>')));
        });
      });
    });
  });

  describe('Actor: APP', () => {
    const model = createModel<FrequencyModification>(machine).withEvents({
      DISALLOW: { exec: e => void (e.value = false) },
      ALLOW: { exec: e => void (e.value = true) },
      ENABLE: { exec: e => void (e.disabled = false) },
      DISABLE: { exec: e => void (e.disabled = true) },
      CUSTOMIZE: { exec: e => void (e.value = samples.custom) },
    });

    model.getShortestPathPlans().forEach(plan => {
      describe(plan.description, () => {
        plan.paths.forEach(path => {
          it(path.description, async () => path.test(await fixture('<x-ruleset></x-ruleset>')));
        });
      });
    });
  });
});
