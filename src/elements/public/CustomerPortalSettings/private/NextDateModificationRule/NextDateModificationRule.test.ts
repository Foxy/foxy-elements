import { expect, fixture } from '@open-wc/testing';
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

const samples = {
  value: {
    minimal: {
      jsonataQuery: '*',
    },
    complete: {
      min: '1m',
      max: '4y',
      jsonataQuery: '$contains(frequency, "w")',
      disallowedDates: [
        new Date(2020, 2, 14).toISOString(),
        new Date(2019, 4, 24).toISOString(),
        new Date(2018, 5, 28).toISOString(),
      ],
      allowedDays: {
        type: 'month' as const,
        days: [23, 16, 31],
      },
    },
  },
};

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

function testInteractivity(disabled: boolean) {
  return async (element: TestNextDateModificationRule) => {
    await element.updateComplete;
    expect(element.disabled).to.equal(disabled);
    Object.values(getRefs(element)).forEach(ref => {
      if (ref && 'disabled' in ref) expect(ref.disabled).to.equal(disabled);
    });
  };
}

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

function testContent(rule: Rule) {
  return async (element: TestNextDateModificationRule) => {
    await element.updateComplete;

    if (!element.open) return;
    const refs = getRefs(element);

    expect(refs.allowed?.value).to.deep.equal(rule.allowedDays);
    expect(refs.disallowed?.value).to.deep.equal(rule.disallowedDates ?? []);
    expect(refs.jsonata?.value).to.deep.equal(rule.jsonataQuery);
    expect(refs.max?.value).to.deep.equal(rule.max);
    expect(refs.min?.value).to.deep.equal(rule.min);
  };
}

async function testRemoval(element: TestNextDateModificationRule) {
  await element.updateComplete;
  const whenRemoved = new Promise(resolve =>
    element.addEventListener('remove', resolve, { once: true })
  );

  getRefs(element).remove.click();
  expect(await whenRemoved).to.be.instanceOf(NextDateModificationRuleRemoveEvent);
}

const machine = createMachine({
  initial: 'existing',
  states: {
    existing: {
      on: { REMOVE: 'removed' },
      meta: { test: () => true },
      type: 'parallel',
      states: {
        interactivity: {
          meta: { test: () => true },
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
          meta: { test: () => true },
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
          meta: { test: () => true },
          initial: 'default',
          states: {
            default: {
              on: { SET_CUSTOM: 'custom', ENTER_CUSTOM: 'custom' },
              meta: { test: testContent(samples.value.minimal) },
            },
            custom: {
              meta: { test: testContent(samples.value.complete) },
            },
          },
        },
      },
    },
    removed: {
      meta: { test: testRemoval },
    },
  },
});

const model = createModel<TestNextDateModificationRule>(machine).withEvents({
  OPEN: { exec: element => void (element.open = true) },
  CLOSE: { exec: element => void (element.open = false) },
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CUSTOM: { exec: element => void (element.value = samples.value.complete) },
  ENTER_CUSTOM: {
    exec: async element => {
      if (!element.open) return;

      const refs = getRefs(element);
      const rule = samples.value.complete;

      refs.allowed!.value = rule.allowedDays;
      refs.allowed!.dispatchEvent(new AllowedDaysChangeEvent(rule.allowedDays));

      refs.disallowed!.value = rule.disallowedDates;
      refs.disallowed!.dispatchEvent(new DisallowedDatesChangeEvent(rule.disallowedDates));

      refs.jsonata!.value = rule.jsonataQuery;
      refs.jsonata!.dispatchEvent(new JSONataInputChangeEvent(rule.jsonataQuery));

      refs.max!.value = rule.max;
      refs.max!.dispatchEvent(new OffsetInputChangeEvent(rule.max));

      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      refs.min!.value = rule.min;
      refs.min!.dispatchEvent(new OffsetInputChangeEvent(rule.min));

      await whenChanged;
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

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
