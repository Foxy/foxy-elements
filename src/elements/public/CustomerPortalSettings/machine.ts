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

const isLoaded = (ctx: CustomerPortalSettingsContext): boolean => {
  return ctx.oldResource !== null && ctx.newResource !== null && ctx.store !== null;
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

export const machine = Machine<CustomerPortalSettingsContext>(
  {
    id: 'customer-portal-settings',
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
      error: {
        on: {
          RESET: { target: 'busy.loading' },
        },
      },
      busy: {
        initial: 'loading',
        states: {
          loading: {
            invoke: {
              src: 'load',
              onDone: {
                target: '#customer-portal-settings.idle.clean',
                actions: 'handleLoadingSuccess',
              },
              onError: {
                target: '#customer-portal-settings.error',
                actions: 'handleError',
              },
            },
          },
          saving: {
            invoke: {
              src: 'save',
              onDone: {
                target: '#customer-portal-settings.idle.clean',
                actions: 'handleSavingSuccess',
              },
              onError: {
                target: '#customer-portal-settings.error',
                actions: 'handleError',
              },
            },
          },
        },
      },
      idle: {
        initial: 'clean',
        states: {
          clean: {
            entry: 'reset',
            on: {
              SET_ORIGINS: 'dirty',
              SET_FREQUENCY_MODIFICATION: 'dirty',
              SET_NEXT_DATE_MODIFICATION: 'dirty',
              SET_SESSION: 'dirty',
              SET_SECRET: 'dirty',
            },
          },
          dirty: {
            on: {
              SAVE: '#customer-portal-settings.busy.saving',
              RESET: 'clean',
            },
          },
        },
        on: {
          SET_ORIGINS: { actions: 'setOrigins' },
          SET_FREQUENCY_MODIFICATION: { actions: 'setFrequencyModification' },
          SET_NEXT_DATE_MODIFICATION: { actions: 'setNextDateModification' },
          SET_SESSION: { actions: 'setSession' },
          SET_SECRET: { actions: 'setSecret' },
        },
      },
    },
    on: {
      SET_HREF: { actions: 'setHref', target: 'unknown' },
    },
  },
  {
    guards: { isLoaded, isSetupNeeded },
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
      reset,
      requireSetup,
    },
  }
);
