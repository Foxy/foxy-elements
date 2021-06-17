import { expect, fixture, oneEvent } from '@open-wc/testing';
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
import { getRefs } from '../../../utils/test-utils';
import { ErrorScreen, ErrorType, LoadingScreen, Switch, SwitchChangeEvent } from '../../private';

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
  invalid: {
    ...customerPortalSettings,
    // validity of the values not listed below is ensured by the respective elements
    sessionLifespanInMinutes: 999999999,
    jwtSharedSecret: 'ohno',
  },
};

// #region utils

interface Refs {
  origins: OriginsList;
  session: SessionDuration;
  loading: LoadingScreen;
  secret: SessionSecret;
  switch: Switch;
  error: ErrorScreen;
  ndmod: NextDateModification;
  reset: ButtonElement;
  fmod: FrequencyModification;
  save: ButtonElement;
}

/**
 * @param getRef
 */
async function waitForRef(getRef: () => HTMLElement | null) {
  while (getRef() === null) await new Promise(resolve => setTimeout(resolve));
}

/**
 * @param target
 */
function clearListeners(target: EventTarget) {
  target.removeEventListener('request', handleRequestWithError);
  target.removeEventListener('request', handleRequestWithSuccess);
  target.removeEventListener('request', handleRequestWithNotFound);
  target.removeEventListener('request', handleRequestWithInfiniteLoading);
  target.removeEventListener('request', handleRequestWithUnauthorizedError);
}

// #endregion utils

// #region assertions

/**
 * @param type
 */
function testError(type: ErrorType) {
  return async (element: CustomerPortalSettings) => {
    await element.updateComplete;
    expect(getRefs<Refs>(element).error).to.have.property('type', type);
  };
}

/**
 * @param value
 */
function testContent(value: FxCustomerPortalSettings) {
  return async (element: CustomerPortalSettings) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);

    expect(refs.fmod.value).to.deep.equal(value.subscriptions.allowFrequencyModification);
    expect(refs.ndmod.value).to.deep.equal(value.subscriptions.allowNextDateModification);
    expect(refs.secret.value).to.equal(value.jwtSharedSecret);
    expect(refs.origins.value).to.deep.equal(value.allowedOrigins);
    expect(refs.session.value).to.equal(value.sessionLifespanInMinutes);
  };
}

/**
 * @param element
 */
async function testLoading(element: CustomerPortalSettings) {
  await waitForRef(() => getRefs<Refs>(element).loading);
  await element.updateComplete;
  expect(getRefs<Refs>(element).loading).to.be.visible;
}

/**
 * @param disabled
 */
function testDisabled(disabled: boolean) {
  return async (element: CustomerPortalSettings) => {
    await element.updateComplete;
    const refs = getRefs<Refs>(element);

    expect(refs.fmod).to.have.property('disabled', disabled);
    expect(refs.ndmod).to.have.property('disabled', disabled);
    expect(refs.secret).to.have.property('disabled', disabled);
    expect(refs.origins).to.have.property('disabled', disabled);
    expect(refs.session).to.have.property('disabled', disabled);
  };
}

/**
 *
 */
function testPreset() {
  // TODO
}

// #endregion assertions

// #region handlers

/**
 * @param evt
 */
function handleRequestWithError(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => Promise.resolve(new Response(null, { status: 500 })));
}

/**
 * @param evt
 */
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

/**
 * @param evt
 */
function handleRequestWithNotFound(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;

  detail.handle(async (url, init) => {
    const { method = 'GET' } = init ?? {};

    if (method === 'GET') {
      if (url === '/') return new Response(JSON.stringify(bookmark));
      if (url.toString().endsWith('/stores/8')) return new Response(JSON.stringify(store));
      if (url.toString().endsWith('/stores/8/customer_portal_settings')) {
        return new Response(null, { status: 404 });
      }
    }

    if (method === 'PUT') {
      if (url.toString().endsWith('/stores/8/customer_portal_settings')) {
        return new Response(init?.body);
      }
    }

    return new Response(null, { status: 404 });
  });
}

/**
 * @param evt
 */
function handleRequestWithInfiniteLoading(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => new Promise(resolve => setTimeout(resolve, KINDA_INFINITE)));
}

/**
 * @param evt
 */
function handleRequestWithUnauthorizedError(evt: Event) {
  const { detail } = evt as RequestEvent<CustomerPortalSettings>;
  detail.handle(() => Promise.resolve(new Response(null, { status: 401 })));
}

// #endregion handlers

const machine = createMachine({
  id: 'root',
  initial: 'unconfigured',
  states: {
    unconfigured: {
      meta: { test: testError('setup_needed') },
      on: {
        LOAD_UNAUTHORIZED: 'unauthorized',
        LOAD_INFINITE: 'loading',
        LOAD_DISABLED: 'clean.disabled.byApi',
        LOAD_ENABLED: 'clean.enabled.byApi',
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
      initial: 'disabled',
      states: {
        disabled: {
          meta: testDisabled(true),
          on: { ENABLE: '#root.dirty.valid.enabled' },
          initial: 'byUser',
          states: {
            byUser: {},
            byApi: {},
          },
        },
        enabled: {
          meta: testDisabled(false),
          initial: 'byUser',
          states: {
            byUser: { meta: { test: testPreset } },
            byApi: { meta: { test: testContent(samples.minimal) } },
          },
          on: {
            ENTER_INVALID: '#root.dirty.invalid',
            ENTER_VALID: '#root.dirty.valid.updated',
            DISABLE: '#root.dirty.valid.disabled',
          },
        },
      },
    },
    dirty: {
      on: {
        SAVE_UNAUTHORIZED: 'unauthorized',
        SAVE_INFINITE: 'saving',
        SAVE_ERROR: 'error',
      },
      states: {
        valid: {
          initial: 'enabled',
          states: {
            updated: {
              meta: { test: testContent(samples.complete) },
              on: { SAVE_SUCCESS: '#root.saved.updated', RESET: '#root.clean.enabled.byUser' },
            },
            enabled: {
              meta: { test: testPreset },
              on: { SAVE_SUCCESS: '#root.saved.enabled', RESET: '#root.clean.disabled' },
            },
            disabled: {
              meta: { test: testDisabled(true) },
              on: { SAVE_SUCCESS: '#root.saved.disabled', RESET: '#root.clean.enabled.byApi' },
            },
          },
        },
        invalid: {
          meta: { test: testContent(samples.invalid) },
        },
      },
    },
    saving: {
      meta: { test: testLoading },
    },
    saved: {
      initial: 'enabled',
      states: {
        updated: { meta: { test: testContent(samples.complete) } },
        enabled: { meta: { test: testPreset } },
        disabled: { meta: { test: testDisabled(true) } },
      },
    },
    error: {
      meta: { test: testError('unknown') },
    },
  },
});

const model = createModel<CustomerPortalSettings>(machine).withEvents({
  LOAD_UNAUTHORIZED: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithUnauthorizedError);
      const whenReady = oneEvent(element, 'ready');
      element.href = samples.minimal._links.self.href;
      await whenReady;
    },
  },
  LOAD_INFINITE: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithInfiniteLoading);
      element.href = samples.minimal._links.self.href;
    },
  },
  LOAD_DISABLED: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithNotFound);
      const whenReady = oneEvent(element, 'ready');
      element.href = samples.minimal._links.self.href;
      await whenReady;
    },
  },
  LOAD_ENABLED: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithSuccess);
      const whenReady = oneEvent(element, 'ready');
      element.href = samples.minimal._links.self.href;
      await whenReady;
    },
  },
  LOAD_ERROR: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithError);
      const whenReady = oneEvent(element, 'ready');
      element.href = samples.minimal._links.self.href;
      await whenReady;
    },
  },
  SAVE_UNAUTHORIZED: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithUnauthorizedError);
      const whenUpdated = oneEvent(element, 'update');
      getRefs<Refs>(element).save.click();
      await whenUpdated;
    },
  },
  SAVE_INFINITE: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithInfiniteLoading);
      getRefs<Refs>(element).save.click();
    },
  },
  SAVE_SUCCESS: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithSuccess);
      const whenUpdated = oneEvent(element, 'update');
      getRefs<Refs>(element).save.click();
      await whenUpdated;
    },
  },
  SAVE_ERROR: {
    exec: async element => {
      clearListeners(element);
      element.addEventListener('request', handleRequestWithError);
      const whenUpdated = oneEvent(element, 'update');
      getRefs<Refs>(element).save.click();
      await whenUpdated;
    },
  },
  ENTER_INVALID: {
    exec: async element => {
      const refs = getRefs<Refs>(element);

      refs.fmod.value = samples.invalid.subscriptions.allowFrequencyModification;
      refs.fmod.dispatchEvent(new FrequencyModificationChangeEvent(refs.fmod.value));
      await element.updateComplete;

      const newSecret = { value: refs.secret.value, invalid: true };
      refs.secret.value = samples.invalid.jwtSharedSecret;
      refs.secret.dispatchEvent(new SessionSecretChangeEvent(newSecret));
      await element.updateComplete;

      refs.ndmod.value = samples.invalid.subscriptions.allowNextDateModification;
      refs.ndmod.dispatchEvent(new NextDateModificationChangeEvent(refs.ndmod.value));
      await element.updateComplete;

      refs.origins.value = samples.invalid.allowedOrigins;
      refs.origins.dispatchEvent(new OriginsListChangeEvent(refs.origins.value));
      await element.updateComplete;

      const newSession = { value: refs.session.value, invalid: true };
      refs.session.value = samples.invalid.sessionLifespanInMinutes;
      refs.session.dispatchEvent(new SessionDurationChangeEvent(newSession));
    },
  },
  ENTER_VALID: {
    exec: async element => {
      const refs = getRefs<Refs>(element);

      refs.fmod.value = samples.complete.subscriptions.allowFrequencyModification;
      refs.fmod.dispatchEvent(new FrequencyModificationChangeEvent(refs.fmod.value));
      await element.updateComplete;

      const newSecret = { value: refs.secret.value, invalid: false };
      refs.secret.value = samples.complete.jwtSharedSecret;
      refs.secret.dispatchEvent(new SessionSecretChangeEvent(newSecret));
      await element.updateComplete;

      refs.ndmod.value = samples.complete.subscriptions.allowNextDateModification;
      refs.ndmod.dispatchEvent(new NextDateModificationChangeEvent(refs.ndmod.value));
      await element.updateComplete;

      refs.origins.value = samples.complete.allowedOrigins;
      refs.origins.dispatchEvent(new OriginsListChangeEvent(refs.origins.value));
      await element.updateComplete;

      const newSession = { value: refs.session.value, invalid: false };
      refs.session.value = samples.complete.sessionLifespanInMinutes;
      refs.session.dispatchEvent(new SessionDurationChangeEvent(newSession));
    },
  },
  DISABLE: {
    exec: async element => {
      await element.updateComplete;
      const checkbox = getRefs<Refs>(element).switch;
      checkbox.checked = false;
      checkbox.dispatchEvent(new SwitchChangeEvent(false));
    },
  },
  ENABLE: {
    exec: async element => {
      await element.updateComplete;
      const checkbox = getRefs<Refs>(element).switch;
      expect(checkbox).to.have.property('disabled', false);
      checkbox.checked = true;
      checkbox.dispatchEvent(new SwitchChangeEvent(true));
    },
  },
  RESET: {
    exec: element => getRefs<Refs>(element).reset.click(),
  },
});

describe('CustomerPortalSettings', () => {
  model.getShortestPathPlans().forEach(plan => {
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
