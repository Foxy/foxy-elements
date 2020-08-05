import { expect, fixture } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { RequestEvent } from '../../../events/request';
import { FxCustomerPortalSettings } from '../../../types/hapi';
import { ErrorScreen, ErrorType } from '../../private/ErrorScreen/ErrorScreen';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { store } from '../Admin/mocks';
import { CustomerPortalSettings } from './CustomerPortalSettings';
import { customerPortalSettings, customerPortalSettingsMinimal } from './mocks';
import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';
import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';

customElements.define('foxy-customer-portal-settings', CustomerPortalSettings);

/**
 * Since `setTimeout(cb, Infinite)` doesn't work, we need something else to
 * keep promises pending in the "infinite loading" scenario. A few decades should do it.
 */
const KINDA_INFINITE = Date.now();

const samples: Record<string, FxCustomerPortalSettings> = {
  minimal: customerPortalSettingsMinimal,
  complete: customerPortalSettings,
};

// #region utils

function getRefs(element: CustomerPortalSettings) {
  const $ = (selector: string) => element.shadowRoot!.querySelector(selector);

  return {
    origins: $('[data-testid=origins]') as OriginsList | null,
    session: $('[data-testid=session]') as HTMLInputElement | null,
    loading: $('[data-testid=loading]') as LoadingScreen | null,
    error: $('[data-testid=error]') as ErrorScreen | null,
    ndmod: $('[data-testid=ndmod]') as NextDateModification | null,
    reset: $('[data-testid=reset]') as HTMLButtonElement | null,
    fmod: $('[data-testid=fmod]') as FrequencyModification | null,
    save: $('[data-testid=save]') as HTMLButtonElement | null,
    jwt: $('[data-testid=jwt]') as HTMLInputElement | null,
  };
}

async function waitForRef(getRef: () => HTMLElement | null) {
  while (getRef() === null) await new Promise(resolve => setTimeout(resolve));
}

function clearListeners(target: EventTarget) {
  target.removeEventListener('request', handleRequestWithError);
  target.removeEventListener('request', handleRequestWithSuccess);
  target.removeEventListener('request', handleRequestWithInfiniteLoading);
  target.removeEventListener('request', handleRequestWithUnauthorizedError);
}

// #endregion utils

// #region assertions

function testError(type: ErrorType) {
  return async (element: CustomerPortalSettings) => {
    await waitForRef(() => getRefs(element).error);
    await element.updateComplete;
    expect(getRefs(element).error?.type).to.equal(type);
  };
}

function testContent(value: FxCustomerPortalSettings) {
  return async (element: CustomerPortalSettings) => {
    await waitForRef(() => getRefs(element).jwt);
    await element.updateComplete;

    const refs = getRefs(element);

    expect(refs.jwt!.value).to.deep.equal(value.jwtSharedSecret);
    expect(refs.fmod!.value).to.deep.equal(value.subscriptions.allowFrequencyModification);
    expect(refs.ndmod!.value).to.deep.equal(value.subscriptions.allowNextDateModification);
    expect(refs.origins!.value).to.deep.equal(value.allowedOrigins);
    expect(refs.session!.value).to.deep.equal(String(value.sessionLifespanInMinutes));
  };
}

async function testLoading(element: CustomerPortalSettings) {
  await waitForRef(() => getRefs(element).loading);
  await element.updateComplete;
  expect(getRefs(element).loading).to.be.visible;
}

// #endregion assertions

// #region handlers

function handleRequestWithError(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => Promise.resolve(new Response(null, { status: 500 })));
}

function handleRequestWithSuccess(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;

  detail.handle(async url => {
    if (url.toString().endsWith('/stores/8')) return new Response(JSON.stringify(store));
    if (url.toString().endsWith('/stores/8/customer_portal_settings')) {
      return new Response(JSON.stringify(samples.minimal));
    }

    return new Response(null, { status: 404 });
  });
}

function handleRequestWithInfiniteLoading(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => new Promise(resolve => setTimeout(resolve, KINDA_INFINITE)));
}

function handleRequestWithUnauthorizedError(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => Promise.resolve(new Response(null, { status: 403 })));
}

// #endregion handlers

const machine = createMachine({
  id: 'customer-portal-settings',
  initial: 'unconfigured',
  states: {
    unconfigured: {
      meta: { test: testError('setup_needed') },
      on: {
        LOAD_UNAUTHORIZED: 'unauthorized',
        LOAD_INFINITE: 'loading',
        LOAD_SUCCESS: 'clean',
        LOAD_ERROR: 'error',
      },
    },
    unauthorized: {
      meta: { test: testError('unauthorized') },
    },
    loading: {
      meta: { test: testLoading },
    },
    clean: {
      meta: { test: testContent(samples.minimal) },
      on: { EMULATE_INPUT: 'dirty' },
    },
    dirty: {
      meta: { test: testContent(samples.complete) },
      on: {
        SAVE_UNAUTHORIZED: 'unauthorized',
        SAVE_INFINITE: 'saving',
        SAVE_SUCCESS: 'saved',
        SAVE_ERROR: 'error',
        RESET: 'clean',
      },
    },
    saving: {
      meta: { test: testLoading },
    },
    saved: {
      meta: { test: testContent(samples.complete) },
    },
    error: {
      meta: { test: testError('unknown') },
    },
  },
});

const model = createModel<CustomerPortalSettings>(machine).withEvents({
  LOAD_UNAUTHORIZED: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithUnauthorizedError);
      element.href = samples.minimal._links.self.href;
    },
  },
  LOAD_INFINITE: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithInfiniteLoading);
      element.href = samples.minimal._links.self.href;
    },
  },
  LOAD_SUCCESS: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithSuccess);
      element.href = samples.minimal._links.self.href;
    },
  },
  LOAD_ERROR: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithError);
      element.href = samples.minimal._links.self.href;
    },
  },
  SAVE_UNAUTHORIZED: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithUnauthorizedError);
      getRefs(element).save!.click();
    },
  },
  SAVE_INFINITE: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithInfiniteLoading);
      getRefs(element).save!.click();
    },
  },
  SAVE_SUCCESS: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithSuccess);
      getRefs(element).save!.click();
    },
  },
  SAVE_ERROR: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithError);
      getRefs(element).save!.click();
    },
  },
  EMULATE_INPUT: {
    exec: async element => {
      const refs = getRefs(element);

      refs.fmod!.value = samples.complete.subscriptions.allowFrequencyModification;
      refs.fmod!.dispatchEvent(new FrequencyModificationChangeEvent(refs.fmod!.value));

      refs.jwt!.value = samples.complete.jwtSharedSecret;
      refs.jwt!.dispatchEvent(new Event('change'));

      refs.ndmod!.value = samples.complete.subscriptions.allowNextDateModification;
      refs.ndmod!.dispatchEvent(new NextDateModificationChangeEvent(refs.ndmod!.value));

      refs.origins!.value = samples.complete.allowedOrigins;
      refs.origins!.dispatchEvent(new OriginsListChangeEvent(refs.origins!.value));

      refs.session!.value = samples.complete.sessionLifespanInMinutes.toString();
      refs.session!.dispatchEvent(new Event('change'));

      await new Promise(resolve => setTimeout(resolve, 5000));
    },
  },
  RESET: {
    exec: element => getRefs(element).reset!.click(),
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
