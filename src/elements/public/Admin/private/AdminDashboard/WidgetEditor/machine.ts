import jsonata from 'jsonata';
import { createMachine, actions } from 'xstate';
import { Preset, createPresets } from './defaults';

type JSON = Record<string, unknown>;

export interface WidgetEditorContext {
  index: number | null;
  label: string;
  store: string;
  source: string;
  preset: string;
  presets: Preset[];
  jsonata: string;
  jsonataError: null | string;
  resource: null | JSON;
  resourceError: null | JSON;
}

export interface WidgetEditorJSONEvent {
  type: string;
  data: JSON;
}

export interface WidgetEditorStringEvent {
  type: string;
  data: string;
}

export interface WidgetEditorResetEvent {
  type: 'RESET';
  data?: {
    preset: Preset;
    index: number;
  };
}

export const machine = createMachine<WidgetEditorContext>({
  context: {
    index: null,
    source: '',
    label: '',
    store: '',
    preset: '',
    presets: [],
    jsonata: '',
    jsonataError: null,
    resource: null,
    resourceError: null,
  },
  entry: actions.assign(ctx => {
    if (ctx.presets.length > 0) return ctx;
    const presets = createPresets();
    return { ...ctx, ...presets[0], presets, preset: presets[0].label };
  }),
  initial: 'unknown',
  states: {
    unknown: {
      always: [{ target: 'idle', cond: ctx => !!ctx.resource }, { target: 'loading' }],
    },
    loading: {
      invoke: {
        src: 'load',
        onDone: {
          target: 'idle',
          actions: actions.assign<WidgetEditorContext>({
            resource: (_, evt) => (evt as WidgetEditorJSONEvent).data,
            resourceError: null,
            jsonataError: (ctx, evt) => {
              try {
                jsonata(ctx.jsonata).evaluate((evt as WidgetEditorStringEvent).data);
                return null;
              } catch (err) {
                return err.message;
              }
            },
          }),
        },
        onError: {
          target: 'idle',
          actions: actions.assign<WidgetEditorContext>({
            resourceError: (_, evt) => (evt as WidgetEditorJSONEvent).data,
            resource: null,
          }),
        },
      },
    },
    idle: {
      type: 'parallel',
      states: {
        source: {
          initial: 'hidden',
          states: {
            hidden: { on: { SHOW_SOURCE: { target: 'visible', actions: 'showSource' } } },
            visible: { on: { HIDE_SOURCE: { target: 'hidden', actions: 'hideSource' } } },
          },
        },
        content: {
          initial: 'unknown',
          states: {
            unknown: {
              always: [
                { target: 'error', cond: ctx => !!ctx.jsonataError || !!ctx.resourceError },
                { target: 'complete', cond: ctx => !!ctx.resource },
                { target: 'incomplete' },
              ],
            },
            incomplete: {},
            complete: {
              on: { SUBMIT: { actions: 'submit' } },
            },
            error: {},
          },
        },
      },
      on: {
        SET_LABEL: {
          target: 'unknown',
          actions: actions.assign({ label: (_, evt) => (evt as WidgetEditorStringEvent).data }),
        },
        SET_PRESET: {
          target: 'unknown',
          actions: actions.assign((ctx, evt) => {
            const preset = (evt as WidgetEditorStringEvent).data;
            const oldPreset = ctx.presets.find(({ label: key }) => key === ctx.preset);
            const newPreset = ctx.presets.find(({ label: key }) => key === preset) ?? oldPreset;
            return { ...ctx, ...newPreset, preset };
          }),
        },
        SET_JSONATA: {
          target: 'unknown',
          actions: actions.assign({
            jsonata: (_, evt) => (evt as WidgetEditorStringEvent).data,
            jsonataError: (ctx, evt) => {
              try {
                jsonata((evt as WidgetEditorStringEvent).data).evaluate(ctx.resource);
                return null;
              } catch (err) {
                return err.message;
              }
            },
          }),
        },
      },
    },
  },
  on: {
    SET_STORE: {
      target: 'loading',
      actions: actions.assign({ store: (_, evt) => (evt as WidgetEditorStringEvent).data }),
    },
    SET_HREF: {
      target: 'loading',
      actions: actions.assign({ source: (_, evt) => (evt as WidgetEditorStringEvent).data }),
    },
    RESET: {
      target: 'unknown',
      actions: actions.assign<WidgetEditorContext>((ctx, evt) => {
        const data = (evt as WidgetEditorResetEvent).data;
        const preset = data?.preset ?? ctx.presets[0];

        return {
          index: data?.index ?? null,
          label: preset.label,
          preset: data?.index === undefined ? preset.label : 'custom',
          source: preset.source,
          jsonata: preset.jsonata,
          jsonataError: null,
          resource: null,
          resourceError: null,
        };
      }),
    },
  },
});
