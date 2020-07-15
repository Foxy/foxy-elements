import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { NextDateModification } from './NextDateModification';
import { NextDateModificationChangeEvent } from './NextDateModificationChangeEvent';
import { NextDateModificationRule } from '../NextDateModificationRule/NextDateModificationRule';
import { NextDateModificationRuleRemoveEvent } from '../NextDateModificationRule/NextDateModificationRuleRemoveEvent';
import { Rule } from './Rule';

customElements.define('x-next-date-modification', NextDateModification);

const samples = {
  value: [{ jsonataQuery: '*' }, { jsonataQuery: '*', min: '2m' }],
  basicValue: [{ jsonataQuery: '*' }],
};

function getRefs(element: NextDateModification) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector) as unknown;
  const $$ = (selector: string) => element.shadowRoot!.querySelectorAll(selector) as unknown;

  return {
    rules: Array.from($$('[data-testid=rule]') as NextDateModificationRule[]),
    add: $('[data-testid=add') as HTMLButtonElement,
  };
}

function testInteractivity(disabled: boolean) {
  return async (element: NextDateModification) => {
    await element.updateComplete;

    expect(element.disabled).to.equal(disabled);
    const { rules, add } = getRefs(element);
    rules.every(rule => expect(rule.disabled).to.equal(disabled));

    if (element.value) expect(add.disabled).to.equal(disabled);
  };
}

function testContent(value: Rule[] | boolean) {
  return async (element: NextDateModification) => {
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
      const originalValue = element.value;
      const whenGotChange = new Promise<Event>(resolve => {
        element.addEventListener('change', resolve);
      });

      rules[0].dispatchEvent(new NextDateModificationRuleRemoveEvent());

      expect(await whenGotChange).to.be.instanceOf(NextDateModificationChangeEvent);
      expect(element.value).to.deep.equal(value.slice(1));
      element.value = originalValue;
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
          on: {
            ADD_RULES: 'allowedWithBasicRules',
            SET_RULES: 'allowedWithCustomRules',
            DISALLOW: 'disallowed',
          },
          meta: { test: testContent(true) },
        },
        allowedWithBasicRules: {
          on: { DISALLOW: 'disallowed' },
          meta: { test: testContent(samples.basicValue) },
        },
        allowedWithCustomRules: {
          on: { DISALLOW: 'disallowed' },
          meta: { test: testContent(samples.value) },
        },
      },
    },
  },
});

const model = createModel<NextDateModification>(machine).withEvents({
  ALLOW: { exec: element => void (element.value = true) },
  DISALLOW: { exec: element => void (element.value = false) },
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_RULES: { exec: element => void (element.value = samples.value) },
  ADD_RULES: {
    exec: async element => {
      await element.updateComplete;

      if (element.disabled) {
        element.value = samples.basicValue;
      } else {
        const whenChanged = new Promise(resolve => {
          element.addEventListener('change', resolve, { once: true });
        });

        getRefs(element).add.click();
        await whenChanged;
      }
    },
  },
});

describe('NextDateModification', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () =>
          path.test(await fixture('<x-next-date-modification></x-next-date-modification>'))
        );
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
