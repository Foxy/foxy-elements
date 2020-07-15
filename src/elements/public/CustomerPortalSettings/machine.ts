import { Machine, actions } from 'xstate/dist/xstate.web.js';

import {
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSchema,
  CustomerPortalSettingsEvent,
} from './types';

export const machine = Machine<
  CustomerPortalSettingsContext,
  CustomerPortalSettingsSchema,
  CustomerPortalSettingsEvent
>(
  {
    initial: 'enabled',
    states: {
      enabled: {
        on: {
          DISABLE: 'disabled',
          SET_ORIGINS: { actions: 'setOrigins' },
          SET_FREQUENCY_MODIFICATION: { actions: 'setFrequencyModification' },
          SET_NEXT_DATE_MODIFICATION: { actions: 'setNextDateModification' },
          SET_SESSION: { actions: 'setSession' },
          SET_SECRET: { actions: 'setSecret' },
        },
      },
      disabled: {
        on: { ENABLE: 'enabled' },
      },
    },
  },
  {
    actions: {
      setOrigins: actions.assign({
        allowedOrigins: (ctx, evt) => {
          return evt.type === 'SET_ORIGINS' ? evt.value : ctx.allowedOrigins;
        },
      }),
      setFrequencyModification: actions.assign({
        subscriptions: (ctx, evt) => {
          if (evt.type !== 'SET_FREQUENCY_MODIFICATION') return ctx.subscriptions;
          return { ...ctx.subscriptions, allowFrequencyModification: evt.value };
        },
      }),
      setNextDateModification: actions.assign({
        subscriptions: (ctx, evt) => {
          if (evt.type !== 'SET_NEXT_DATE_MODIFICATION') return ctx.subscriptions;
          return { ...ctx.subscriptions, allowNextDateModification: evt.value };
        },
      }),
      setSession: actions.assign({
        sessionLifespanInMinutes: (ctx, evt) => {
          return evt.type === 'SET_SESSION' ? evt.value : ctx.sessionLifespanInMinutes;
        },
      }),
      setSecret: actions.assign({
        jwtSharedSecret: (ctx, evt) => {
          return evt.type === 'SET_SECRET' ? evt.value : ctx.jwtSharedSecret;
        },
      }),
    },
  }
);
