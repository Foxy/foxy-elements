import { EventObject, StateMachine, assign, createMachine } from 'xstate';

import { RequestEvent } from '../../../events/request';

export type Collection = {
  readonly _links: Record<'next' | 'last', { href: string }>;
  readonly _embedded: unknown;
  readonly total_items: number;
  readonly returned_items: number;
  readonly offset: number;
};

export type SliderContext<T extends Collection = any> = {
  first: string | null;
  error: string | null;
  pages: T[];
  element: HTMLElement | null;
};

export type SliderEvent<T extends Collection = any> =
  | {
      type: 'RELOAD';
    }
  | {
      type: 'LOAD_NEXT';
    }
  | {
      type: 'SET_FIRST';
      data: string | null;
    }
  | {
      type: 'SET_PAGES';
      data: T[];
    };

export type SliderState<T extends Collection = any> =
  | {
      value: 'unknown';
      context: SliderContext<T>;
    }
  | {
      value: 'loading' | 'idle';
      context: SliderContext<T> & { element: HTMLElement; error: null; first: string };
    }
  | {
      value: 'error';
      context: SliderContext<T> & { error: string };
    };

export type Slider<T extends Collection = any> = StateMachine<
  SliderContext<T>,
  SliderState<T>,
  SliderEvent<T>
>;

export const machine = createMachine<SliderContext, SliderEvent, SliderState>({
  context: {
    first: null,
    error: null,
    pages: [],
    element: null,
  },

  initial: 'unknown',

  states: {
    unknown: {
      always: [
        { target: 'error', cond: ctx => !!ctx.error || !ctx.first || !ctx.element },
        { target: 'idle', cond: ctx => !!ctx.pages },
        { target: 'loading' },
      ],
    },

    loading: {
      invoke: {
        src: async ctx => {
          const lastPage = ctx.pages[ctx.pages.length - 1];
          const href = lastPage?._links.next.href ?? ctx.first!;
          const response = await RequestEvent.emit({ source: ctx.element!, init: [href!] });
          if (!response.ok) throw new Error(response.statusText);
          return await response.json();
        },

        onDone: {
          target: 'idle',
          actions: assign<SliderContext>({
            pages: (ctx, evt) => [...ctx.pages, (evt as EventObject & { data: Collection }).data],
          }),
        },

        onError: {
          target: 'error',
          actions: assign<SliderContext>({
            error: (_: unknown, evt: unknown) => (evt as Record<string, string>).data,
          }),
        },
      },
    },

    idle: {
      on: {
        LOAD_NEXT: 'loading',
      },
    },

    error: {
      on: {
        RELOAD: {
          target: 'loading',
          actions: assign<SliderContext>({ error: null }),
        },
      },
    },
  },

  on: {
    SET_FIRST: {
      target: 'unknown',
      actions: assign({ first: (_, evt) => (evt as any).data }),
    },

    SET_PAGES: {
      target: 'unknown',
      actions: assign({ pages: (_, evt) => (evt as any).data }),
    },
  },
});
