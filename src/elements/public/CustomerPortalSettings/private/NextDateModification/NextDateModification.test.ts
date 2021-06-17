import { Switch, SwitchChangeEvent } from '../../../../private';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { NextDateModification } from './NextDateModification';
import { NextDateModificationChangeEvent } from './NextDateModificationChangeEvent';
import { NextDateModificationRule } from '../NextDateModificationRule/NextDateModificationRule';
import { NextDateModificationRuleChangeEvent } from '../NextDateModificationRule/NextDateModificationRuleChangeEvent';
import { NextDateModificationRuleRemoveEvent } from '../NextDateModificationRule/NextDateModificationRuleRemoveEvent';
import { Rule } from './Rule';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';

class TestNextDateModification extends NextDateModification {
  get whenReady() {
    return this._whenI18nReady;
  }
}

customElements.define('x-next-date-modification', TestNextDateModification);

const samples = {
  basicValue: [{ jsonataQuery: '*' }],
  modifiedRule: { jsonataQuery: '$contains(frequency, "w")', max: '1y' },
  value: [{ jsonataQuery: '*' }, { jsonataQuery: '*', min: '2m' }],
};

/**
 * @param element
 */
function getRefs(element: TestNextDateModification) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector) as unknown;
  const $$ = (selector: string) => element.shadowRoot!.querySelectorAll(selector) as unknown;

  return {
    add: $('[data-testid=add]') as HTMLButtonElement,
    rules: Array.from($$('[data-testid=rule]') as NextDateModificationRule[]),
    toggle: $('[data-testid=toggle]') as Switch,
  };
}

/**
 * @param disabled
 */
function testInteractivity(disabled: boolean) {
  return async (element: TestNextDateModification) => {
    await element.updateComplete;

    expect(element.disabled).to.equal(disabled);
    const { rules, add } = getRefs(element);
    rules.every(rule => expect(rule.disabled).to.equal(disabled));

    if (element.value) expect(add.disabled).to.equal(disabled);
  };
}

/**
 * @param value
 */
function testContent(value: Rule[] | boolean) {
  return async (element: TestNextDateModification) => {
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

      // test updating rule
      let whenGotChange = oneEvent(element, 'change');
      rules[0].dispatchEvent(new NextDateModificationRuleChangeEvent(samples.modifiedRule));
      expect(await whenGotChange).to.be.instanceOf(NextDateModificationChangeEvent);
      expect(element).to.have.deep.property('value', [samples.modifiedRule, ...value.slice(1)]);

      // test deleting rule
      whenGotChange = oneEvent(element, 'change');
      rules[0].dispatchEvent(new NextDateModificationRuleRemoveEvent());
      expect(await whenGotChange).to.be.instanceOf(NextDateModificationChangeEvent);
      expect(element).to.have.deep.property('value', value.slice(1));

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
          on: { ALLOW: 'allowed.setInCode', CHECK: 'allowed.setByUser' },
          meta: { test: testContent(false) },
          initial: 'setInCode',
          states: {
            setInCode: {},
            setByUser: {},
          },
        },
        allowed: {
          meta: { test: testContent(true) },
          initial: 'setInCode',
          states: {
            setInCode: {},
            setByUser: {},
          },
          on: {
            ADD_RULES: 'allowedWithBasicRules',
            SET_RULES: 'allowedWithCustomRules',
            DISALLOW: 'disallowed.setInCode',
            UNCHECK: 'disallowed.setByUser',
          },
        },
        allowedWithBasicRules: {
          on: { DISALLOW: 'disallowed.setInCode', UNCHECK: 'disallowed.setByUser' },
          meta: { test: testContent(samples.basicValue) },
        },
        allowedWithCustomRules: {
          on: { DISALLOW: 'disallowed.setInCode', UNCHECK: 'disallowed.setByUser' },
          meta: { test: testContent(samples.value) },
        },
      },
    },
  },
});

const model = createModel<TestNextDateModification>(machine).withEvents({
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
  UNCHECK: {
    exec: async element => {
      await element.updateComplete;
      const toggle = getRefs(element).toggle;
      toggle.checked = false;
      toggle.dispatchEvent(new SwitchChangeEvent(false));
    },
  },
  CHECK: {
    exec: async element => {
      await element.updateComplete;
      const toggle = getRefs(element).toggle;
      toggle.checked = true;
      toggle.dispatchEvent(new SwitchChangeEvent(true));
    },
  },
});

describe('CustomerPortalSettings >>> NextDateModification', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-next-date-modification></x-next-date-modification>';
          const element = await fixture<TestNextDateModification>(layout);
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
