import { createMachine, actions } from 'xstate';
import { ErrorType, FriendlyError } from '../../../../../private/ErrorScreen/ErrorScreen';

export type WidgetResource = Record<PropertyKey, any>;

export interface WidgetContext {
  resource: WidgetResource | null;
  error: ErrorType | null;
}

export interface WidgetLoadSuccessEvent {
  type: 'done.invoke.load';
  data: WidgetResource;
}

export interface WidgetLoadErrorEvent {
  type: 'error.execution';
  data: FriendlyError;
}

export const machine = createMachine<WidgetContext>({
  initial: 'unknown',
  context: {
    resource: null,
    error: null,
  },
  states: {
    unknown: {
      always: [
        { target: 'idle', cond: ctx => ctx.resource !== null },
        { target: 'idle', cond: ctx => ctx.error !== null },
        { target: 'loading' },
      ],
    },
    loading: {
      invoke: {
        src: 'load',
        onDone: {
          target: 'idle',
          actions: actions.assign<WidgetContext>({
            resource: (_, evt) => (evt as WidgetLoadSuccessEvent).data,
          }),
        },
        onError: {
          target: 'error',
          actions: actions.assign<WidgetContext>({
            error: (_, evt) => (evt as WidgetLoadErrorEvent).data.type,
          }),
        },
      },
    },
    error: {},
    idle: {},
  },
  on: {
    ERROR: '.error',
    RESET: {
      target: 'loading',
      actions: actions.assign<WidgetContext>({ resource: null, error: null }),
    },
  },
});
