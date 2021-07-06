import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/customer';
import { AnyEventObject, assign, createMachine } from 'xstate';

export type Settings = Resource<Rels.CustomerPortalSettings>;

export type Context = { settings: Settings | null };

export type State =
  | { value: 'idle'; context: Context }
  | { value: 'busy'; context: Context }
  | { value: 'fail'; context: Context }
  | { value: { idle: 'home' }; context: Context & { settings: Settings } }
  | { value: { idle: 'signIn' }; context: Context & { settings: null } }
  | { value: { idle: 'accessRecovery' }; context: Context & { settings: null } }
  | { value: { busy: 'loading' }; context: Context }
  | { value: { busy: 'signingOut' }; context: Context };

export const machine = createMachine<Context, AnyEventObject, State>(
  {
    id: 'root',

    initial: 'busy',

    context: {
      settings: null,
    },

    states: {
      idle: {
        states: {
          home: { on: { SIGN_OUT: '#root.busy.signingOut' } },
          signIn: { on: { RECOVER_ACCESS: 'accessRecovery', SIGN_IN: '#root.busy.loading' } },
          accessRecovery: { on: { SIGN_IN: 'signIn' } },
        },
      },

      busy: {
        initial: 'loading',

        states: {
          loading: {
            invoke: {
              src: 'load',
              onDone: { target: '#root.idle.home', actions: 'setSettings' },
              onError: '#root.idle.signIn',
            },
          },

          signingOut: {
            invoke: {
              src: 'signOut',
              onDone: { target: '#root.idle.signIn', actions: 'unsetSettings' },
              onError: '#root.fail',
            },
          },
        },
      },

      fail: {},
    },

    on: {
      RESET: { target: '.busy.loading', actions: 'unsetSettings' },
    },
  },
  {
    actions: {
      setSettings: assign<Context, AnyEventObject>({ settings: (_, evt) => evt.data }),
      unsetSettings: assign<Context, AnyEventObject>({ settings: null }),
    },
  }
);
