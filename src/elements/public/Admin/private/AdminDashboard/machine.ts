import { createMachine, actions } from 'xstate';
import { FxStore, FxBookmark } from '../../../../../types/hapi';
import { ErrorScreen, FriendlyError } from '../../../../private/ErrorScreen/ErrorScreen';
import { Preset, createPresets } from './WidgetEditor/defaults';

export const WIDGETS_ATTRIBUTE = '@foxy.io/elements/admin::widgets';
export const WIDGETS_TOTAL_ATTRIBUTE = '@foxy.io/elements/admin::widgets_total';

export interface AdminDashboardWidget {
  jsonata: string;
  source: string;
  label: string;
}

export interface AdminDashboardContext {
  bookmark: FxBookmark | null;
  widgets: AdminDashboardWidget[];
  store: FxStore | null;
  error: ErrorScreen['type'] | null;
}

export interface AdminDashboardLoadSuccessEvent {
  type: 'done.invoke.load';
  data: {
    bookmark: FxBookmark;
    store: FxStore;
  };
}

export interface AdminDashboardLoadErrorEvent {
  type: 'error.execution';
  data: FriendlyError;
}

export interface AdminDashboardOpenEvent {
  type: 'OPEN';
  data?: { index: number; preset: Preset };
}

export interface AdminDashboardUpsertEvent {
  type: 'UPSERT';
  data: { index: number | null; preset: Preset };
}

export interface AdminDashboardRemoveEvent {
  type: 'REMOVE';
  data: number;
}

export interface AdminDashboardSwapEvent {
  type: 'SWAP';
  data: {
    oldIndex: number;
    newIndex: number;
  };
}

export const machine = createMachine<AdminDashboardContext>({
  id: 'ad',
  initial: 'unknown',
  context: {
    bookmark: null,
    widgets: [],
    store: null,
    error: null,
  },
  states: {
    unknown: {
      always: [
        { target: 'error', cond: ctx => ctx.error !== null },
        { target: 'idle', cond: ctx => ctx.store !== null },
        { target: 'loading' },
      ],
    },
    loading: {
      invoke: {
        src: 'load',
        onDone: {
          target: 'idle',
          actions: actions.assign({
            store: (_, evt) => (evt as AdminDashboardLoadSuccessEvent).data.store,
            bookmark: (_, evt) => (evt as AdminDashboardLoadSuccessEvent).data.bookmark,
            widgets: (_, evt) => {
              const store = (evt as AdminDashboardLoadSuccessEvent).data.store;
              const attributes = store._embedded['fx:attributes'];
              const total = attributes.find(({ name }) => name === WIDGETS_TOTAL_ATTRIBUTE);

              if (total === undefined) {
                return createPresets();
              } else {
                return attributes
                  .filter(({ name }) => name === WIDGETS_ATTRIBUTE)
                  .map(({ value }) => JSON.parse(value) as Preset);
              }
            },
          }),
        },
        onError: {
          target: 'error',
          actions: actions.assign({
            error: (_, evt) => (evt as AdminDashboardLoadErrorEvent).data.type,
          }),
        },
      },
    },
    saving: {
      invoke: {
        src: 'save',
        onDone: 'idle',
        onError: {
          target: 'error',
          actions: actions.assign({
            error: (_, evt) => (evt as AdminDashboardLoadErrorEvent).data.type,
          }),
        },
      },
    },
    error: {},
    idle: {
      initial: 'default',
      states: {
        default: { on: { EDIT: 'editable' } },
        editable: {
          on: {
            SAVE: '#ad.saving',
            OPEN: { actions: 'openEditor' },
            SWAP: {
              actions: actions.assign<AdminDashboardContext>({
                widgets: (ctx, evt) => {
                  const { oldIndex, newIndex } = (evt as AdminDashboardSwapEvent).data;
                  ctx.widgets.splice(newIndex, 0, ...ctx.widgets.splice(oldIndex, 1));
                  return ctx.widgets;
                },
              }),
            },
            REMOVE: {
              actions: actions.assign<AdminDashboardContext>({
                widgets: (ctx, evt) => {
                  return ctx.widgets.filter(
                    (_, i) => i !== (evt as AdminDashboardRemoveEvent).data
                  );
                },
              }),
            },
            UPSERT: {
              actions: actions.assign<AdminDashboardContext>({
                widgets: (ctx, evt) => {
                  const { index, preset } = (evt as AdminDashboardUpsertEvent).data;
                  if (index === null) return [...ctx.widgets, preset];
                  return ctx.widgets.map((v, i) => (i === index ? preset : v));
                },
              }),
            },
          },
        },
      },
    },
  },
  on: {
    ERROR: '.error',
  },
});
