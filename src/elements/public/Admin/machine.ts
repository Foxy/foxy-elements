import { createMachine, actions } from 'xstate';
import { FxStore, FxUser, FxBookmark } from './types';
import { ErrorScreen, FriendlyError } from '../../private/ErrorScreen/ErrorScreen';

export interface AdminContext {
  bookmark: FxBookmark | null;
  store: FxStore | null;
  user: FxUser | null;
  error: ErrorScreen['type'] | null;
}

export interface AdminLoadSuccessEvent {
  type: 'done.invoke.load';
  data: {
    bookmark: FxBookmark;
    store: FxStore;
    user: FxUser;
  };
}

export interface AdminLoadErrorEvent {
  type: 'error.execution';
  data: FriendlyError;
}

export const load = (): Promise<void> => Promise.reject(new Error('not implemented'));
export const reset = actions.assign<AdminContext>(() => ({ store: null, user: null }));
export const isSignedIn = (ctx: AdminContext): boolean => ctx.user !== null && ctx.store !== null;
export const isUnauthorized = (ctx: AdminContext): boolean => ctx.error === 'unauthorized';

export const handleLoadingError = actions.assign<AdminContext>({
  error: (_, evt) => (evt as AdminLoadErrorEvent).data.type,
});

export const handleLoadingSuccess = actions.assign<AdminContext>({
  bookmark: (_, evt) => (evt as AdminLoadSuccessEvent).data.bookmark,
  store: (_, evt) => (evt as AdminLoadSuccessEvent).data.store,
  user: (_, evt) => (evt as AdminLoadSuccessEvent).data.user,
});

export const machine = createMachine<AdminContext>(
  {
    initial: 'unknown',
    context: {
      bookmark: null,
      error: null,
      store: null,
      user: null,
    },
    states: {
      unauthorized: {
        on: { SIGN_IN: 'loading' },
      },
      unknown: {
        always: [{ target: 'idle', cond: 'isSignedIn' }, { target: 'loading' }],
      },
      loading: {
        invoke: {
          src: 'load',
          onDone: { target: 'idle', actions: 'handleLoadingSuccess' },
          onError: { target: 'error', actions: 'handleLoadingError' },
        },
      },
      error: {
        always: [{ target: 'unauthorized', cond: 'isUnauthorized' }],
        on: { RESET: { target: 'loading', actions: 'reset' } },
      },
      idle: {
        on: { SIGN_OUT: { target: 'unauthorized', actions: 'reset' } },
      },
    },
    on: {
      ERROR: '.error',
    },
  },
  {
    services: { load },
    actions: { reset, handleLoadingSuccess, handleLoadingError },
    guards: { isSignedIn, isUnauthorized },
  }
);
