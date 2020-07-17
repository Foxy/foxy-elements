import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { CustomerPortalSettings } from './CustomerPortalSettings';
import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';
import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';
import { CustomerPortalSettingsResource } from './types';

customElements.define('foxy-customer-portal-settings', CustomerPortalSettings);

const samples: Record<string, CustomerPortalSettingsResource> = {
  minimal: {
    _links: {
      self: {
        href: 'https://foxy.io/s/admin/stores/8/customer_portal_settings',
      },
    },

    sso: true,
    jwtSharedSecret: 'JWT-SHARED-SECRET-VALUE',
    sessionLifespanInMinutes: 10080,
    allowedOrigins: [],

    subscriptions: {
      allowFrequencyModification: false,
      allowNextDateModification: false,
    },

    // eslint-disable-next-line @typescript-eslint/camelcase
    date_created: '2020-07-17T21:27:00.121Z',

    // eslint-disable-next-line @typescript-eslint/camelcase
    date_modified: '2020-07-17T21:27:00.121Z',
  },

  complete: {
    _links: {
      self: {
        href: 'https://foxy.io/s/admin/stores/8/customer_portal_settings',
      },
    },

    sso: true,
    jwtSharedSecret: 'JWT-SHARED-SECRET-VALUE',
    sessionLifespanInMinutes: 10080,
    allowedOrigins: ['http://localhost:8000', 'https://foxy.io'],

    subscriptions: {
      allowFrequencyModification: {
        jsonataQuery: '$contains(frequency, "w")',
        values: ['2w', '4w', '6w'],
      },

      allowNextDateModification: [
        {
          min: '2w',
          max: '6w',
          jsonataQuery: '$contains(frequency, "w")',
          disallowedDates: [new Date().toISOString()],
          allowedDays: {
            type: 'month',
            days: [1, 2, 3, 14, 15, 16],
          },
        },
      ],
    },

    // eslint-disable-next-line @typescript-eslint/camelcase
    date_created: '2020-07-17T21:27:00.121Z',

    // eslint-disable-next-line @typescript-eslint/camelcase
    date_modified: '2020-07-17T21:27:00.121Z',
  },
};

function getRefs(element: CustomerPortalSettings) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    origins: $('[data-testid=origins]') as OriginsList | null,
    session: $('[data-testid=session]') as HTMLInputElement | null,
    ndmod: $('[data-testid=ndmod]') as NextDateModification | null,
    fmod: $('[data-testid=fmod]') as FrequencyModification | null,
    jwt: $('[data-testid=jwt]') as HTMLInputElement | null,
  };
}

function testInteractivity(disabled: boolean) {
  return async (element: CustomerPortalSettings) => {
    await element.updateComplete;
    const refs = getRefs(element);

    expect(element.disabled).to.be.oneOf([disabled, undefined]);
    expect(refs.session?.disabled).to.be.oneOf([disabled, undefined]);
    expect(refs.origins?.disabled).to.be.oneOf([disabled, undefined]);
    expect(refs.ndmod?.disabled).to.be.oneOf([disabled, undefined]);
    expect(refs.fmod?.disabled).to.be.oneOf([disabled, undefined]);
    expect(refs.jwt?.disabled).to.be.oneOf([disabled, undefined]);
  };
}

function testContent(value?: CustomerPortalSettingsResource) {
  return async (element: CustomerPortalSettings) => {
    await element.updateComplete;
    const refs = getRefs(element);

    expect(element.service.state.context).to.deep.equal(value);
    if (!value) return;

    expect(refs.fmod!.value).to.deep.equal(value.subscriptions.allowFrequencyModification);
    expect(refs.jwt!.value).to.deep.equal(value.jwtSharedSecret);
    expect(refs.ndmod!.value).to.deep.equal(value.subscriptions.allowNextDateModification);
    expect(refs.origins!.value).to.deep.equal(value.allowedOrigins);
    expect(refs.session!.value).to.deep.equal(String(value.sessionLifespanInMinutes));
  };
}

const machine = createMachine({
  id: 'cps',
  meta: { test: () => true },
  initial: 'empty',
  states: {
    empty: {
      on: { DISABLE: '.disabled', ENABLE: '.enabled' },
      meta: { test: testContent() },
      initial: 'enabled',
      states: {
        enabled: {
          meta: { test: testInteractivity(false) },
          on: { SET_CONTENT: '#cps.minimal.enabled' },
        },
        disabled: {
          meta: { test: testInteractivity(true) },
          on: { SET_CONTENT: '#cps.minimal.disabled' },
        },
      },
    },
    minimal: {
      on: { DISABLE: '.disabled', ENABLE: '.enabled' },
      meta: { test: testContent(samples.minimal) },
      initial: 'enabled',
      states: {
        enabled: {
          meta: { test: testInteractivity(false) },
          on: { EDIT_CONTENT: '#cps.complete.enabled' },
        },
        disabled: {
          meta: { test: testInteractivity(true) },
        },
      },
    },
    complete: {
      on: { DISABLE: '.disabled', ENABLE: '.enabled' },
      meta: { test: testContent(samples.complete) },
      initial: 'enabled',
      states: {
        enabled: { meta: { test: testInteractivity(false) } },
        disabled: { meta: { test: testInteractivity(true) } },
      },
    },
  },
});

const model = createModel<CustomerPortalSettings>(machine).withEvents({
  ENABLE: { exec: element => void (element.disabled = false) },
  DISABLE: { exec: element => void (element.disabled = true) },
  SET_CONTENT: {
    exec: async element => {
      element.service.state.context = samples.minimal;
      await element.requestUpdate();
    },
  },
  EDIT_CONTENT: {
    exec: async element => {
      if (element.service.state.context === undefined) return;

      const refs = getRefs(element);

      refs.fmod!.value = samples.complete.subscriptions.allowFrequencyModification;
      refs.fmod!.dispatchEvent(new FrequencyModificationChangeEvent(refs.fmod!.value));

      refs.jwt!.value = samples.complete.jwtSharedSecret;
      refs.jwt!.dispatchEvent(new Event('change'));

      refs.ndmod!.value = samples.complete.subscriptions.allowNextDateModification;
      refs.ndmod!.dispatchEvent(new NextDateModificationChangeEvent(refs.ndmod!.value));

      refs.origins!.value = samples.complete.allowedOrigins;
      refs.origins!.dispatchEvent(new OriginsListChangeEvent(refs.origins!.value));

      const whenChanged = new Promise(resolve =>
        element.addEventListener('change', resolve, { once: true })
      );

      refs.session!.value = samples.complete.sessionLifespanInMinutes.toString();
      refs.session!.dispatchEvent(new Event('change'));

      await whenChanged;
    },
  },
});

describe('CustomerPortalSettings', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<foxy-customer-portal-settings></foxy-customer-portal-settings>';
          const element = await fixture<CustomerPortalSettings>(layout);

          await path.test(element);
        });
      });
    });
  });

  describe('has full coverage', () => {
    it('yes', () => model.testCoverage());
  });
});
