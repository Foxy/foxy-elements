import { actions, createMachine } from 'xstate';

interface SetEvent<TPayload = string> {
  type: string;
  data: TPayload;
}

interface SetErrorEvent {
  type: string;
  data: AuthError;
}

interface Context {
  error: AuthErrorCode | null;
  email: string;
  password: string;
  newPassword: string;
  persistence: boolean;
}

export type AuthErrorCode = 'unknown' | 'unauthorized' | 'reset_required' | 'invalid_new_password';

export class AuthError extends Error {
  public code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.code = code;
  }
}

export const machine = createMachine<Context>(
  {
    initial: 'idle',
    context: {
      error: null,
      email: '',
      password: '',
      newPassword: '',
      persistence: false,
    },
    states: {
      idle: {
        on: {
          RESET: { actions: 'reset' },
          SET_EMAIL: { actions: 'setEmail' },
          SET_PASSWORD: { actions: 'setPassword' },
          SET_NEW_PASSWORD: { actions: 'setNewPassword' },
          SET_PERSISTENCE: { actions: 'setPersistence' },
          SUBMIT_RESET: 'resetting',
          SUBMIT: 'authenticating',
        },
      },
      resetting: {
        entry: 'clearError',
        invoke: {
          src: 'reset',
          onDone: 'reset',
          onError: { actions: 'setError', target: 'idle' },
        },
      },
      authenticating: {
        entry: 'clearError',
        invoke: {
          src: 'authenticate',
          onDone: 'done',
          onError: { actions: 'setError', target: 'idle' },
        },
      },
      reset: { on: { RESET: { actions: 'reset', target: 'idle' } } },
      done: { type: 'final' },
    },
  },
  {
    actions: {
      setEmail: actions.assign({ email: (_, evt) => (evt as SetEvent).data }),
      setPassword: actions.assign({ password: (_, evt) => (evt as SetEvent).data }),
      setNewPassword: actions.assign({ newPassword: (_, evt) => (evt as SetEvent).data }),
      setPersistence: actions.assign({ persistence: (_, evt) => (evt as SetEvent<boolean>).data }),
      clearError: actions.assign<Context>({ error: null }),
      setError: actions.assign({ error: (_, evt) => (evt as SetErrorEvent).data.code }),
      reset: actions.assign<Context>({
        error: null,
        password: '',
        newPassword: '',
      }),
    },
  }
);
