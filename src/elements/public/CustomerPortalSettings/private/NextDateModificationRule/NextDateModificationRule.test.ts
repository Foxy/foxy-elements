import { expect, fixture, oneEvent } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Warning } from '../../../../private/index';
import { AllowedDays } from '../AllowedDays/AllowedDays';
import { AllowedDaysChangeEvent } from '../AllowedDays/AllowedDaysChangeEvent';
import { DisallowedDates } from '../DisallowedDates/DisallowedDates';
import { DisallowedDatesChangeEvent } from '../DisallowedDates/DisallowedDatesChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { OffsetInput } from '../OffsetInput/OffsetInput';
import { OffsetInputChangeEvent } from '../OffsetInput/OffsetInputChangeEvent';
import { NextDateModificationRule } from './NextDateModificationRule';
import { NextDateModificationRuleRemoveEvent } from './NextDateModificationRuleRemoveEvent';
import { Rule } from './Rule';

class TestNextDateModificationRule extends NextDateModificationRule {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('x-next-date-modification-rule', TestNextDateModificationRule);

/**
 * @param element
 */
function getRefs(element: TestNextDateModificationRule) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    disallowed: $('[data-testid=disallowed]') as DisallowedDates | null,
    details: $('[data-testid=details]') as HTMLDetailsElement,
    allowed: $('[data-testid=allowed]') as AllowedDays | null,
    warning: $('[data-testid=warning]') as Warning | null,
    jsonata: $('[data-testid=jsonata]') as JSONataInput | null,
    remove: $('[data-testid=remove]') as HTMLButtonElement,
    min: $('[data-testid=min]') as OffsetInput | null,
    max: $('[data-testid=max]') as OffsetInput | null,
  };
}

/**
 * @param disabled
 */
function testInteractivity(disabled: boolean) {
  return async (element: TestNextDateModificationRule) => {
    await element.updateComplete;
    expect(element.disabled).to.equal(disabled);
    Object.values(getRefs(element)).forEach(ref => {
      if (ref && 'disabled' in ref) expect(ref.disabled).to.equal(disabled);
    });
  };
}

/**
 * @param open
 */
function testDisplay(open: boolean) {
  return async (element: TestNextDateModificationRule) => {
    await element.updateComplete;

    expect(element.open).to.equal(open);
    const refs = getRefs(element);

    if (open) {
      expect(refs.allowed).to.not.be.null;
      expect(refs.disallowed).to.not.be.null;
      expect(refs.jsonata).to.not.be.null;
      expect(refs.max).to.not.be.null;
      expect(refs.min).to.not.be.null;
    }
  };
}

/**
 * @param element
 */
async function testContent(element: TestNextDateModificationRule) {
  await element.updateComplete;

  const refs = getRefs(element);
  const rule = element.value;

  expect(refs.allowed?.value).to.deep.equal(rule.allowedDays);
  expect(refs.disallowed?.value).to.deep.equal(rule.disallowedDates ?? []);
  expect(refs.jsonata?.value).to.deep.equal(rule.jsonataQuery);
  expect(refs.max?.value).to.deep.equal(rule.max);
  expect(refs.min?.value).to.deep.equal(rule.min);
}

const machine = createMachine({
  initial: 'existing',
  states: {
    existing: {
      on: { REMOVE: 'removed' },
      type: 'parallel',
      states: {
        interactivity: {
          initial: 'enabled',
          states: {
            disabled: {
              on: { ENABLE: 'enabled' },
              meta: { test: testInteractivity(true) },
            },
            enabled: {
              on: { DISABLE: 'disabled' },
              meta: { test: testInteractivity(false) },
            },
          },
        },
        display: {
          initial: 'closed',
          states: {
            closed: {
              on: { OPEN: 'open' },
              meta: { test: testDisplay(false) },
            },
            open: {
              on: { CLOSE: 'closed' },
              meta: { test: testDisplay(true) },
            },
          },
        },
        content: {
          initial: 'default',
          states: {
            default: {
              on: { SET_CUSTOM: 'custom.setInCode', ENTER_CUSTOM: 'custom.setByUser' },
              meta: { test: testContent },
            },
            custom: {
              initial: 'setInCode',
              meta: { test: testContent },
              states: {
                setInCode: {},
                setByUser: {},
              },
            },
          },
        },
      },
    },
    removed: {},
  },
});

const model = createModel<TestNextDateModificationRule>(machine).withEvents({
  OPEN: { exec: element => void (element.open = true) },
  CLOSE: { exec: element => void (element.open = false) },
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CUSTOM: {
    exec: element => {
      const newValue: Rule = {
        min: '1d',
        max: '1w',
        jsonataQuery: '$contains(frequency, "y")',
        disallowedDates: [],
        allowedDays: { type: 'month' as const, days: [14, 16] },
      };

      element.value = newValue;
      expect(element).to.have.property('value', newValue);
    },
  },
  ENTER_CUSTOM: {
    exec: async element => {
      const refs = getRefs(element);
      const rule = {
        min: '4m',
        max: '2d',
        jsonataQuery: '$contains(frequency, "m")',
        disallowedDates: ['2020-03-14', '2019-05-24..2018-06-28'],
        allowedDays: { type: 'day' as const, days: [1, 2, 3] },
      };

      refs.allowed!.value = rule.allowedDays;
      refs.allowed!.dispatchEvent(new AllowedDaysChangeEvent(rule.allowedDays));
      await element.updateComplete;

      refs.disallowed!.value = rule.disallowedDates;
      refs.disallowed!.dispatchEvent(new DisallowedDatesChangeEvent(rule.disallowedDates));
      await element.updateComplete;

      refs.jsonata!.value = rule.jsonataQuery;
      refs.jsonata!.dispatchEvent(new JSONataInputChangeEvent(rule.jsonataQuery));
      await element.updateComplete;

      refs.max!.value = rule.max;
      refs.max!.dispatchEvent(new OffsetInputChangeEvent(rule.max));
      await element.updateComplete;

      const whenChanged = oneEvent(element, 'change');

      refs.min!.value = rule.min;
      refs.min!.dispatchEvent(new OffsetInputChangeEvent(rule.min));

      await element.updateComplete;
      await whenChanged;
    },
  },
  REMOVE: {
    exec: async element => {
      await element.updateComplete;
      const whenRemoved = new Promise(resolve =>
        element.addEventListener('remove', resolve, { once: true })
      );

      getRefs(element).remove.click();
      expect(await whenRemoved).to.be.instanceOf(NextDateModificationRuleRemoveEvent);
    },
  },
});

describe('CustomerPortalSettings >>> NextDateModificationRule', () => {
  model.getShortestPathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<x-next-date-modification-rule></x-next-date-modification-rule>';
          const element = await fixture<TestNextDateModificationRule>(layout);
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
