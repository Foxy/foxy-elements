import { StateMachine, assign, createMachine } from 'xstate';

type EditorError = {
  target: string;
  type: string;
};

type EditorContext<T> = {
  resource: T | null;
  backup: T | null;
  errors: EditorError[];
};

type EditorEvent<T> =
  | {
      type: 'UPDATE';
      errors?: EditorError[];
      resource?: T;
    }
  | { type: 'RESET' }
  | { type: 'SAVE' };

type EditorState<T> =
  | {
      value: 'unknown';
      context: EditorContext<T> & { resource: null; backup: null };
    }
  | {
      value: 'clean';
      context: EditorContext<T> & { resource: T; backup: null };
    }
  | {
      value: 'dirty' | 'ready';
      context: EditorContext<T> & { resource: T; backup: T };
    };

export type Editor<T> = StateMachine<EditorContext<T>, EditorState<T>, EditorEvent<T>>;

export const editor = createMachine<
  EditorContext<unknown>,
  EditorEvent<unknown>,
  EditorState<unknown>
>({
  context: {
    resource: null,
    backup: null,
    errors: [],
  },

  initial: 'unknown',

  states: {
    unknown: {
      always: [{ target: 'clean', cond: ctx => ctx.backup === null }, { target: 'dirty' }],
    },

    clean: {
      on: {
        UPDATE: {
          target: 'dirty',
          actions: assign({
            resource: (ctx, evt) => evt.resource ?? ctx.resource,
            backup: ctx => ctx.resource,
          }),
        },
      },
    },

    dirty: {
      initial: 'unknown',

      states: {
        unknown: {
          always: [{ target: 'invalid', cond: ctx => ctx.errors.length > 0 }, { target: 'valid' }],
        },
        invalid: {},
        valid: { on: { SAVE: 'ready' } },
        ready: { type: 'final' },
      },

      on: {
        UPDATE: {
          target: 'unknown',
          actions: assign({
            resource: (ctx, evt) => evt.resource ?? ctx.resource,
            errors: (ctx, evt) => evt.errors ?? ctx.errors,
          }),
        },
      },
    },

    ready: {
      type: 'final',
      data: ctx => ctx.resource,
    },
  },

  on: {
    RESET: '.clean',
  },
});
