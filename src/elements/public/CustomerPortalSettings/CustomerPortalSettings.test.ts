import { expect, fixture } from '@open-wc/testing';
import { ButtonElement } from '@vaadin/vaadin-button';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { RequestEvent } from '../../../events/request';
import { bookmark } from '../../../mocks/FxBookmark';

import {
  customerPortalSettings,
  customerPortalSettingsMinimal,
} from '../../../mocks/FxCustomerPortalSettings';

import { store } from '../../../mocks/FxStore';
import { FxCustomerPortalSettings } from '../../../types/hapi';
import { getRefs, retry } from '../../../utils/test-utils';
import { ErrorScreen, ErrorType } from '../../private/ErrorScreen/ErrorScreen';
import { LoadingScreen } from '../../private/LoadingScreen/LoadingScreen';
import { CustomerPortalSettings } from './CustomerPortalSettings';
import { FrequencyModification } from './private/FrequencyModification/FrequencyModification';
import { FrequencyModificationChangeEvent } from './private/FrequencyModification/FrequencyModificationChangeEvent';
import { NextDateModification } from './private/NextDateModification/NextDateModification';
import { NextDateModificationChangeEvent } from './private/NextDateModification/NextDateModificationChangeEvent';
import { OriginsList } from './private/OriginsList/OriginsList';
import { OriginsListChangeEvent } from './private/OriginsList/OriginsListChangeEvent';

import {
  SessionDuration,
  SessionDurationChangeEvent,
} from './private/SessionDuration/SessionDuration';

import { SessionSecret, SessionSecretChangeEvent } from './private/SessionSecret/SessionSecret';

class TestCustomerPortalSettings extends CustomerPortalSettings {
  get whenReady() {
    return this._whenI18nReady.then(() => this.updateComplete);
  }
}

customElements.define('foxy-customer-portal-settings', TestCustomerPortalSettings);

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

interface Refs {
  origins: OriginsList;
  session: SessionDuration;
  loading: LoadingScreen;
  secret: SessionSecret;
  error: ErrorScreen;
  ndmod: NextDateModification;
  reset: ButtonElement;
  fmod: FrequencyModification;
  save: ButtonElement;
}

async function waitForRef(getRef: () => HTMLElement | null) {
  while (getRef() === null) await new Promise(resolve => setTimeout(resolve));
}

async function waitForValue<T>(value: T, getValue: () => T) {
  while (getValue() !== value) await new Promise(resolve => setTimeout(resolve));
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
    await waitForRef(() => getRefs<Refs>(element).error);
    await element.updateComplete;
    expect(getRefs<Refs>(element).error?.type).to.equal(type);
  };
}

function testContent(value: FxCustomerPortalSettings) {
  return async (element: CustomerPortalSettings) => {
    await retry(3, async () => {
      const refs = getRefs<Refs>(element);

      expect(refs.fmod!.value).to.deep.equal(value.subscriptions.allowFrequencyModification);
      expect(refs.ndmod!.value).to.deep.equal(value.subscriptions.allowNextDateModification);
      expect(refs.secret!.value).to.equal(value.jwtSharedSecret);
      expect(refs.origins!.value).to.deep.equal(value.allowedOrigins);
      expect(refs.session!.value).to.equal(value.sessionLifespanInMinutes);
    });
  };
}

async function testLoading(element: CustomerPortalSettings) {
  await waitForRef(() => getRefs<Refs>(element).loading);
  await element.updateComplete;
  expect(getRefs<Refs>(element).loading).to.be.visible;
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
    if (url === '/') return new Response(JSON.stringify(bookmark));
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
  detail.handle(() => Promise.resolve(new Response(null, { status: 401 })));
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
      getRefs<Refs>(element).save!.click();
    },
  },
  SAVE_INFINITE: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithInfiniteLoading);
      getRefs<Refs>(element).save!.click();
    },
  },
  SAVE_SUCCESS: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithSuccess);
      getRefs<Refs>(element).save!.click();
    },
  },
  SAVE_ERROR: {
    exec: element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithError);
      getRefs<Refs>(element).save!.click();
    },
  },
  EMULATE_INPUT: {
    exec: async element => {
      const refs = getRefs<Refs>(element);

      refs.fmod!.value = samples.complete.subscriptions.allowFrequencyModification;
      refs.fmod!.dispatchEvent(new FrequencyModificationChangeEvent(refs.fmod!.value));
      await element.updateComplete;

      refs.secret!.value = samples.complete.jwtSharedSecret;
      refs.secret!.dispatchEvent(
        new SessionSecretChangeEvent({
          value: refs.secret.value,
          invalid: false,
        })
      );
      await element.updateComplete;

      refs.ndmod!.value = samples.complete.subscriptions.allowNextDateModification;
      refs.ndmod!.dispatchEvent(new NextDateModificationChangeEvent(refs.ndmod!.value));
      await element.updateComplete;

      refs.origins!.value = samples.complete.allowedOrigins;
      refs.origins!.dispatchEvent(new OriginsListChangeEvent(refs.origins!.value));
      await element.updateComplete;

      refs.session!.value = samples.complete.sessionLifespanInMinutes;
      refs.session!.dispatchEvent(
        new SessionDurationChangeEvent({ value: refs.session.value, invalid: false })
      );
      await element.updateComplete;
    },
  },
  RESET: {
    exec: element => getRefs<Refs>(element).reset!.click(),
  },
});

describe('CustomerPortalSettings', () => {
  model.getSimplePathPlans().forEach(plan => {
    describe(plan.description, () => {
      plan.paths.forEach(path => {
        it(path.description, async () => {
          const layout = '<foxy-customer-portal-settings></foxy-customer-portal-settings>';
          const element = await fixture<TestCustomerPortalSettings>(layout);
          await element.whenReady;
          return path.test(element);
        });
      });
    });
  });
});
