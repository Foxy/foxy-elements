import { expect, fixture, oneEvent } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { FrequencyModificationRule } from '../FrequencyModificationRule/FrequencyModificationRule';
import { FrequencyModificationRuleChangeEvent } from '../FrequencyModificationRule/FrequencyModificationRuleChangeEvent';
import { FrequencyModificationRuleRemoveEvent } from '../FrequencyModificationRule/FrequencyModificationRuleRemoveEvent';
import { FrequencyModification } from './FrequencyModification';
import { FrequencyModificationChangeEvent } from './FrequencyModificationChangeEvent';

class TestFrequencyModification extends FrequencyModification {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-ruleset', TestFrequencyModification);

/**
 * @param element
 */
function getRefs(element: TestFrequencyModification) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector) as unknown;
  const $$ = (selector: string) => element.shadowRoot!.querySelectorAll(selector) as unknown;

  return {
    rules: Array.from($$('[data-testid=rule]') as FrequencyModificationRule[]),
    add: $('[data-testid=add]') as HTMLButtonElement,
  };
}

/**
 * @param disabled
 */
function testDisabled(disabled: boolean) {
  return async (element: TestFrequencyModification) => {
    await element.updateComplete;

    expect(element).to.have.property('disabled', disabled);
    const { rules, add } = getRefs(element);
    rules.every(rule => expect(rule).to.have.property('disabled', disabled));

    if (element.value) expect(add).to.have.property('disabled', disabled);
  };
}

/**
 * @param element
 */
async function testValue(element: TestFrequencyModification) {
  await element.updateComplete;
  getRefs(element).rules.every((rule, index) => {
    const item = element.value[index];
    expect(rule.value).to.deep.equal(item);
  });
}

const machine = createMachine({
  id: 'root',
  initial: 'empty',
  meta: { test: testValue },
  states: {
    empty: {
      initial: 'enabled',
      states: {
        enabled: {
          on: { ADD_RULE: '#root.custom', SET_VALUE: '#root.preset', DISABLE: 'disabled' },
          meta: { test: testDisabled(false) },
          initial: 'byDefault',
          states: {
            byDefault: {},
            cleared: {},
          },
        },
        disabled: {
          on: { SET_VALUE: '#root.preset.disabled', ENABLE: 'enabled' },
          meta: { test: testDisabled(true) },
        },
      },
    },
    preset: {
      initial: 'enabled',
      states: {
        enabled: {
          initial: 'clean',
          meta: { test: testDisabled(false) },
          on: {
            UPDATE_RULE: '.dirty',
            ADD_RULE: '#root.custom',
            DISABLE: 'disabled',
            CLEAR: '#root.empty.enabled.cleared',
          },
          states: {
            clean: {},
            dirty: {},
          },
        },
        disabled: {
          on: { ENABLE: 'enabled' },
          meta: { test: testDisabled(true) },
        },
      },
    },
    custom: {
      initial: 'enabled',
      states: {
        enabled: {
          initial: 'clean',
          meta: { test: testDisabled(false) },
          on: {
            UPDATE_RULE: '.dirty',
            ADD_RULE: '#root.custom',
            DISABLE: 'disabled',
            CLEAR: '#root.empty.enabled.cleared',
          },
          states: {
            clean: {},
            dirty: {},
          },
        },
        disabled: {
          on: { ENABLE: 'enabled' },
          meta: { test: testDisabled(true) },
        },
      },
    },
  },
});

const model = createModel<TestFrequencyModification>(machine).withEvents({
  CLEAR: {
    exec: async element => {
      await element.updateComplete;

      const rules = getRefs(element).rules.reverse();
      const events: FrequencyModificationRuleChangeEvent[] = [];
      const listener = (event: Event) => events.push(event as FrequencyModificationRuleChangeEvent);

      element.addEventListener('change', listener);

      for (const rule of rules) {
        rule.dispatchEvent(new FrequencyModificationRuleRemoveEvent());
        await element.updateComplete;
      }

      element.removeEventListener('change', listener);

      const event = events.pop()!;

      expect(event).to.be.instanceOf(FrequencyModificationChangeEvent);
      expect(event).to.have.deep.property('detail', element.value);
      expect(event.detail).to.be.empty;
    },
  },
  ENABLE: {
    exec: async element => {
      await element.updateComplete;
      element.disabled = false;
    },
  },
  DISABLE: {
    exec: async element => {
      await element.updateComplete;
      element.disabled = true;
    },
  },
  ADD_RULE: {
    exec: async element => {
      await element.updateComplete;

      const whenGotEvent = oneEvent(element, 'change');
      getRefs(element).add.dispatchEvent(new Event('click'));
      const event = (await whenGotEvent) as FrequencyModificationChangeEvent;

      expect(event).to.be.instanceOf(FrequencyModificationChangeEvent);
      expect(event).to.have.deep.property('detail', element.value);
      expect(event.detail[event.detail.length - 1]).to.deep.equal({
        jsonataQuery: '*',
        values: [],
      });
    },
  },
  SET_VALUE: {
    exec: async element => {
      const newValue = [
        { jsonataQuery: '*', values: [] },
        { jsonataQuery: '$contains(frequency, "y")', values: ['.5m'] },
      ];

      element.value = newValue;
      await element.updateComplete;

      expect(element).to.have.deep.property('value', newValue);
    },
  },
  UPDATE_RULE: {
    exec: async element => {
      await element.updateComplete;

      const [rule] = getRefs(element).rules;
      const newRuleValue = { jsonataQuery: '$contains(frequency, "d")', values: ['1d', '2d'] };
      const whenGotEvent = oneEvent(element, 'change');

      rule.value = newRuleValue;
      rule.dispatchEvent(new FrequencyModificationRuleChangeEvent(newRuleValue));

      const event = (await whenGotEvent) as FrequencyModificationChangeEvent;

      expect(event).to.be.instanceOf(FrequencyModificationChangeEvent);
      expect(event).to.have.deep.property('detail', element.value);
      expect(event.detail[0]).to.deep.equal(newRuleValue);
    },
  },
});

describe('CustomerPortalSettings >>> FrequencyModification', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const element = await fixture<TestFrequencyModification>('<x-ruleset></x-ruleset>');
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
