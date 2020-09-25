import { isEqual, random, times } from 'lodash-es';
import { Machine, actions } from 'xstate';

import {
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSetOriginsEvent,
  CustomerPortalSettingsSetFrequencyModificationEvent,
  CustomerPortalSettingsSetNextDateModificationEvent,
  CustomerPortalSettingsSetSessionEvent,
  CustomerPortalSettingsSetSecretEvent,
  CustomerPortalSettingsLoadSuccessEvent,
  CustomerPortalSettingsLoadErrorEvent,
  CustomerPortalSettingsSetHrefEvent,
} from './types';

// #region guards

const isClean = (ctx: CustomerPortalSettingsContext): boolean => {
  return isEqual(ctx.newResource, ctx.oldResource);
};

const isLoaded = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.store !== null;
};

const isEnabled = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.oldResource !== null;
};

const isCreated = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.oldResource === null && ctx.newResource !== null;
};

const isDeleted = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.oldResource !== null && ctx.newResource === null;
};

const isSetupNeeded = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.href === null;
};

// #endregion guards

// #region actions

const handleError = actions.assign<CustomerPortalSettingsContext>({
  error: (_, evt) => (evt as CustomerPortalSettingsLoadErrorEvent).data.type,
});

const handleLoadingSuccess = actions.assign<CustomerPortalSettingsContext>({
  oldResource: (_, evt) => (evt as CustomerPortalSettingsLoadSuccessEvent).data.resource,
  newResource: (_, evt) => (evt as CustomerPortalSettingsLoadSuccessEvent).data.resource,
  store: (_, evt) => (evt as CustomerPortalSettingsLoadSuccessEvent).data.store,
});

const handleSavingSuccess = actions.assign<CustomerPortalSettingsContext>({
  oldResource: ctx => ctx.newResource,
});

const reset = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ oldResource }) => oldResource,
});

const create = actions.assign<CustomerPortalSettingsContext>({
  newResource: ctx => ({
    allowedOrigins: [],
    subscriptions: { allowFrequencyModification: false, allowNextDateModification: false },
    jwtSharedSecret: times(72, () => random(35).toString(36)).join(''),
    sessionLifespanInMinutes: 40320,
    sso: false,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    _links: {
      'fx:store': ctx.store!._links.self,
      curies: ctx.store!._links.curies,
      self: ctx.store!._links['fx:customer_portal_settings'],
    },
  }),
});

const remove = actions.assign<CustomerPortalSettingsContext>({
  newResource: null,
});

const requireSetup = actions.assign<CustomerPortalSettingsContext>({
  error: 'setup_needed',
});

const setOrigins = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ newResource }, evt) => {
    const allowedOrigins = (evt as CustomerPortalSettingsSetOriginsEvent).value;
    return { ...newResource!, allowedOrigins };
  },
});

const setFrequencyModification = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ newResource }, evt) => {
    const typedEvt = evt as CustomerPortalSettingsSetFrequencyModificationEvent;
    const allowFrequencyModification = typedEvt.value;
    return {
      ...newResource!,
      subscriptions: { ...newResource!.subscriptions, allowFrequencyModification },
    };
  },
});

const setNextDateModification = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ newResource }, evt) => {
    const typedEvt = evt as CustomerPortalSettingsSetNextDateModificationEvent;
    const allowNextDateModification = typedEvt.value;
    return {
      ...newResource!,
      subscriptions: { ...newResource!.subscriptions, allowNextDateModification },
    };
  },
});

const setSession = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ newResource }, evt) => {
    const sessionLifespanInMinutes = (evt as CustomerPortalSettingsSetSessionEvent).value;
    return { ...newResource!, sessionLifespanInMinutes };
  },
});

const setSecret = actions.assign<CustomerPortalSettingsContext>({
  newResource: ({ newResource }, evt) => {
    const jwtSharedSecret = (evt as CustomerPortalSettingsSetSecretEvent).value;
    return { ...newResource!, jwtSharedSecret };
  },
});

const setHref = actions.assign<CustomerPortalSettingsContext>({
  oldResource: null,
  newResource: null,
  store: null,
  error: null,
  href: (_, evt) => (evt as CustomerPortalSettingsSetHrefEvent).data,
});

// #endregion actions

// #region services

const load = (): Promise<void> => Promise.reject(new Error('not implemented'));
const save = (): Promise<void> => Promise.reject(new Error('not implemented'));

// #endregion services

const setters = {
  SET_SECRET: { target: '#cps.idle', actions: 'setSecret' },
  SET_ORIGINS: { target: '#cps.idle', actions: 'setOrigins' },
  SET_SESSION: { target: '#cps.idle', actions: 'setSession' },
  SET_FREQUENCY_MODIFICATION: {
    target: '#cps.idle',
    actions: 'setFrequencyModification',
  },
  SET_NEXT_DATE_MODIFICATION: {
    target: '#cps.idle',
    actions: 'setNextDateModification',
  },
};

export const machine = Machine<CustomerPortalSettingsContext>(
  {
    id: 'cps',
    initial: 'unknown',
    context: {
      oldResource: null,
      newResource: null,
      store: null,
      error: null,
      href: null,
    },
    states: {
      unknown: {
        always: [
          { target: 'error', cond: 'isSetupNeeded', actions: 'requireSetup' },
          { target: 'idle', cond: 'isLoaded' },
          { target: 'busy' },
        ],
      },
      error: { on: { RESET: { target: 'busy.loading' } } },
      busy: {
        initial: 'loading',
        states: {
          loading: {
            invoke: {
              src: 'load',
              onDone: {
                target: '#cps.idle.clean',
                actions: 'handleLoadingSuccess',
              },
              onError: {
                target: '#cps.error',
                actions: 'handleError',
              },
            },
          },
          saving: {
            invoke: {
              src: 'save',
              onDone: {
                target: '#cps.idle.clean',
                actions: 'handleSavingSuccess',
              },
              onError: {
                target: '#cps.error',
                actions: 'handleError',
              },
            },
          },
        },
      },
      idle: {
        initial: 'unknown',
        on: {
          DISABLE: { target: '#cps.idle', actions: 'remove' },
          ENABLE: { target: '#cps.idle', actions: 'create' },
          RESET: { target: '#cps.idle', actions: 'reset' },
        },
        states: {
          unknown: {
            always: [{ target: 'clean', cond: 'isClean' }, { target: 'dirty' }],
          },
          clean: {
            initial: 'unknown',
            states: {
              unknown: {
                always: [{ target: 'enabled', cond: 'isEnabled' }, { target: 'disabled' }],
              },
              enabled: { on: setters },
              disabled: {},
            },
          },
          dirty: {
            on: { SAVE: '#cps.busy.saving' },
            initial: 'unknown',
            states: {
              unknown: {
                always: [
                  { target: 'created', cond: 'isCreated' },
                  { target: 'deleted', cond: 'isDeleted' },
                  { target: 'updated' },
                ],
              },
              created: { on: setters },
              updated: { on: setters },
              deleted: {},
            },
          },
        },
      },
    },
    on: {
      SET_HREF: { actions: 'setHref', target: 'unknown' },
    },
  },
  {
    guards: { isClean, isLoaded, isEnabled, isCreated, isDeleted, isSetupNeeded },
    services: { load, save },
    actions: {
      setFrequencyModification,
      setNextDateModification,
      setOrigins,
      setSession,
      setSecret,
      setHref,
      handleLoadingSuccess,
      handleSavingSuccess,
      handleError,
      create,
      reset,
      remove,
      requireSetup,
    },
  }
);
