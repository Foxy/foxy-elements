import { StateMachine, assign, createMachine, send } from 'xstate';

import { RequestEvent } from '../../../events/request';
import { editor } from './editor.machine';

export type ElementContext<T> = {
  href: string | null;
  error: string | null;
  element: HTMLElement | null;
  resource: T | null;
};

export type ElementEvent<T> =
  | { type: 'RELOAD' }
  | { type: 'SAVE' }
  | {
      type: 'SET_HREF';
      data: string | null;
    }
  | {
      type: 'SET_RESOURCE';
      data: T | null;
    };

export type ElementState<T> =
  | {
      value: 'unknown';
      context: ElementContext<T>;
    }
  | {
      value: 'loading';
      context: { resource: null; element: HTMLElement; error: null; href: string };
    }
  | {
      value: 'saving' | 'ready';
      context: { resource: T; element: HTMLElement; error: null; href: string };
    }
  | {
      value: 'error';
      context: ElementContext<T> & { error: string };
    };

export type Element<T> = StateMachine<ElementContext<T>, ElementState<T>, ElementEvent<T>>;

export const element = createMachine<
  ElementContext<unknown>,
  ElementEvent<unknown>,
  ElementState<unknown>
>({
  context: {
    href: null,
    error: null,
    element: null,
    resource: null,
  },

  initial: 'unknown',

  states: {
    unknown: {
      always: [
        { target: 'error', cond: ctx => !!ctx.error || !ctx.href || !ctx.element },
        { target: 'ready', cond: ctx => !!ctx.resource },
        { target: 'loading' },
      ],
    },

    loading: {
      invoke: {
        src: async ctx => {
          const response = await RequestEvent.emit({ source: ctx.element!, init: [ctx.href!] });
          if (!response.ok) throw new Error(response.statusText);
          return await response.json();
        },

        onDone: {
          target: 'ready',
          actions: assign<ElementContext<unknown>>({
            resource: (_: unknown, evt: unknown) => (evt as Record<string, unknown>).data,
          }),
        },

        onError: {
          target: 'error',
          actions: assign<ElementContext<unknown>>({
            error: (_: unknown, evt: unknown) => (evt as Record<string, string>).data,
          }),
        },
      },
    },

    saving: {
      invoke: {
        src: async ctx => {
          const response = await RequestEvent.emit({
            source: ctx.element!,
            init: [
              ctx.href!,
              {
                method: 'PUT',
                body: JSON.stringify(ctx.resource),
              },
            ],
          });

          if (!response.ok) throw new Error(response.statusText);
          return await response.json();
        },

        onDone: {
          target: 'ready',
          actions: assign<ElementContext<unknown>>({
            resource: (_: unknown, evt: unknown) => (evt as Record<string, unknown>).data,
          }),
        },

        onError: {
          target: 'error',
          actions: assign<ElementContext<unknown>>({
            error: (_: unknown, evt: unknown) => (evt as Record<string, string>).data,
          }),
        },
      },
    },

    ready: {
      invoke: {
        id: 'editor',
        src: editor,
        onDone: {
          target: 'saving',
          actions: assign({ resource: (_, evt) => evt.data }),
        },
      },

      on: {
        SAVE: { actions: send('SAVE', { to: 'editor' }) },
      },
    },

    error: {
      on: {
        RELOAD: {
          target: 'loading',
          actions: assign<ElementContext<unknown>>({ error: null }),
        },
      },
    },
  },

  on: {
    SET_HREF: {
      target: 'unknown',
      actions: assign<ElementContext<unknown>>({
        resource: null,
        error: null,
        href: (_, evt) => (evt as any).data,
      }),
    },

    SET_RESOURCE: {
      target: 'unknown',
      actions: assign<ElementContext<unknown>>({
        resource: (_: ElementContext<unknown>, evt: any) => evt.data,
        error: null,
        href: (_, evt) => (evt as any).data?._links.self.href,
      }),
    },
  },
});
