import { expect, fixture, oneEvent } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { FrequencyList } from '../FrequencyList/FrequencyList';
import { FrequencyListChangeEvent } from '../FrequencyList/FrequencyListChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { FrequencyModificationRule } from './FrequencyModificationRule';
import { FrequencyModificationRuleRemoveEvent } from './FrequencyModificationRuleRemoveEvent';
import { Rule } from './types';

class TestFrequencyModificationRule extends FrequencyModificationRule {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-rule', TestFrequencyModificationRule);

const samples = {
  default: { jsonataQuery: '*', values: [] },
  custom: { jsonataQuery: '$contains(frequency, "w")', values: ['.5m', '1y'] },
};

/**
 * @param element
 */
function getRefs(element: TestFrequencyModificationRule) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    remove: $('[data-testid=remove]') as HTMLButtonElement,
    details: $('[data-testid=details]') as HTMLDetailsElement,
    jsonata: $('[data-testid=jsonata]') as JSONataInput,
    frequency: $('[data-testid=frequency]') as FrequencyList,
  };
}

/**
 * @param value
 */
function testDisabled(value: boolean) {
  return async (element: TestFrequencyModificationRule) => {
    await element.updateComplete;
    const { remove, jsonata, frequency } = getRefs(element);

    expect(element, 'element must be disabled').to.have.property('disabled', value);
    expect(remove, 'remove button must be disabled').to.have.property('disabled', value);
    expect(jsonata, 'jsonata input must be disabled').to.have.property('disabled', value);
    expect(frequency, 'frequency input must be disabled').to.have.property('disabled', value);

    if (value === false) {
      const whenEventFired = oneEvent(element, 'remove');
      remove.click();
      expect(await whenEventFired).to.be.instanceOf(FrequencyModificationRuleRemoveEvent);
    }
  };
}

/**
 * @param value
 */
function testOpen(value: boolean) {
  return async (element: TestFrequencyModificationRule) => {
    await element.updateComplete;
    const { details } = getRefs(element);

    expect(element).to.have.property('open', value);
    expect(details).to.have.property('open', value);
  };
}

/**
 * @param value
 */
function testContent(value: Rule) {
  return async (element: TestFrequencyModificationRule) => {
    await element.updateComplete;
    const { jsonata, frequency } = getRefs(element);

    expect(element).to.have.deep.property('value', value);
    expect(jsonata).to.have.property('value', value.jsonataQuery);
    expect(frequency).to.have.deep.property('value', value.values);
  };
}

const machine = createMachine({
  type: 'parallel',
  states: {
    interactivity: {
      initial: 'enabled',
      states: {
        enabled: { on: { DISABLE: 'disabled' }, meta: { test: testDisabled(false) } },
        disabled: { on: { ENABLE: 'enabled' }, meta: { test: testDisabled(true) } },
      },
    },
    visibility: {
      initial: 'closed',
      states: {
        open: { on: { CLOSE: 'closed' }, meta: { test: testOpen(true) } },
        closed: { on: { OPEN: 'open' }, meta: { test: testOpen(false) } },
      },
    },
    content: {
      initial: 'default',
      states: {
        default: { on: { CUSTOMIZE: 'custom' }, meta: { test: testContent(samples.default) } },
        custom: { meta: { test: testContent(samples.custom) } },
      },
    },
  },
});

describe('CustomerPortalSettings >>> FrequencyModificationRule', () => {
  describe('Actor: USER', () => {
    const model = createModel<TestFrequencyModificationRule>(machine).withEvents({
      CUSTOMIZE: {
        exec: async element => {
          const { jsonata, frequency } = getRefs(element);

          jsonata.value = samples.custom.jsonataQuery;
          jsonata.dispatchEvent(new JSONataInputChangeEvent(jsonata.value));

          frequency.value = samples.custom.values;
          frequency.dispatchEvent(new FrequencyListChangeEvent(frequency.value));
        },
      },
      DISABLE: { exec: async element => (element.disabled = true) },
      ENABLE: { exec: async element => (element.disabled = false) },
      CLOSE: { exec: async element => getRefs(element).details.dispatchEvent(new Event('toggle')) },
      OPEN: { exec: async element => getRefs(element).details.dispatchEvent(new Event('toggle')) },
    });

    model.getShortestPathPlans().forEach(plan => {
      describe(plan.description, () => {
        plan.paths.forEach(path => {
          it(path.description, async () => {
            const element = await fixture<TestFrequencyModificationRule>('<x-rule></x-rule>');
            await element.whenReady;
            return path.test(element);
          });
        });
      });
    });
  });

  describe('Actor: APP', () => {
    const model = createModel<TestFrequencyModificationRule>(machine).withEvents({
      CUSTOMIZE: { exec: async element => (element.value = samples.custom) },
      DISABLE: { exec: async element => (element.disabled = true) },
      ENABLE: { exec: async element => (element.disabled = false) },
      CLOSE: { exec: async element => (element.open = false) },
      OPEN: { exec: async element => (element.open = true) },
    });

    model.getShortestPathPlans().forEach(plan => {
      describe(plan.description, () => {
        plan.paths.forEach(path => {
          it(path.description, async () => {
            const element = await fixture<TestFrequencyModificationRule>('<x-rule></x-rule>');
            await element.whenReady;
            return path.test(element);
          });
        });
      });
    });
  });
});
