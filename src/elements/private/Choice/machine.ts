import { createMachine, actions } from 'xstate';
import { Choice } from './Choice';

type Context = Pick<Choice, 'custom' | 'items' | 'value' | 'type' | 'min' | 'max'> & {
  customValue: string | null;
};

export const machine = createMachine<Context>(
  {
    id: 'choice',
    type: 'parallel',
    context: {
      customValue: null,
      custom: false,
      items: [],
      value: null,
      type: 'text',
      min: null,
      max: null,
    },
    states: {
      interactivity: {
        initial: 'enabled',
        states: {
          enabled: {},
          disabled: {},
        },
        on: {
          SET_DISABLED: [
            { target: '.enabled', cond: 'isPayloadFalsey' },
            { target: '.disabled', cond: 'isPayloadTruthy' },
          ],
        },
      },

      selection: {
        initial: 'unknown',
        states: {
          unknown: {
            on: { '': [{ target: 'multiple', cond: 'isValueArray' }, { target: 'single' }] },
          },
          none: {},
          single: {},
          multiple: {},
        },
      },

      extension: {
        initial: 'unknown',
        states: {
          unknown: {
            on: { '': [{ target: 'present', cond: 'hasCustom' }, { target: 'absent' }] },
          },
          absent: {},
          present: {
            initial: 'unknown',
            states: {
              unknown: {
                on: {
                  '': [{ target: 'selected', cond: 'hasCustomValue' }, { target: 'available' }],
                },
              },
              available: { on: { SET_TYPE: { actions: 'setType' } } },
              selected: {
                initial: 'unknown',
                states: {
                  unknown: {
                    on: {
                      '': [
                        { target: 'integer', cond: 'showsIntegerField' },
                        { target: 'textarea', cond: 'showsTextarea' },
                        { target: 'text' },
                      ],
                    },
                  },
                  text: {},
                  textarea: {},
                  integer: {
                    type: 'parallel',
                    states: {
                      min: {
                        initial: 'unknown',
                        states: {
                          unknown: {
                            on: {
                              '': [
                                { target: 'custom', cond: 'hasMinConstraint' },
                                { target: 'none' },
                              ],
                            },
                          },
                          none: {},
                          custom: {},
                        },
                      },
                      max: {
                        initial: 'unknown',
                        states: {
                          unknown: {
                            on: {
                              '': [
                                { target: 'custom', cond: 'hasMaxConstraint' },
                                { target: 'none' },
                              ],
                            },
                          },
                          none: {},
                          custom: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    on: {
      SET_CUSTOM: { actions: 'setCustom', target: ['.selection.unknown', '.extension.unknown'] },
      SET_VALUE: { actions: 'setValue', target: ['.selection.unknown', '.extension.unknown'] },
      SET_ITEMS: { actions: 'setItems', target: ['.selection.unknown', '.extension.unknown'] },
      SET_TYPE: { actions: 'setType', target: '.extension.unknown' },
      SET_MIN: { actions: 'setMin', target: '.extension.unknown' },
      SET_MAX: { actions: 'setMax', target: '.extension.unknown' },
    },
  },
  {
    guards: {
      isPayloadFalsey: (_, evt) => !evt.data,
      isPayloadTruthy: (_, evt) => !!evt.data,
      isValueArray: ctx => Array.isArray(ctx.value),
      showsIntegerField: ctx => ctx.type === 'integer',
      showsTextarea: ctx => ctx.type === 'textarea',
      hasMinConstraint: ctx => typeof ctx.min === 'number',
      hasMaxConstraint: ctx => typeof ctx.max === 'number',
      hasCustomValue: ctx => typeof ctx.customValue === 'string',
      hasCustom: ctx => ctx.custom,
    },
    actions: {
      setValue: actions.assign({
        value: (_, evt) => evt.data,
        customValue: (ctx, evt) =>
          Array.isArray(evt.data)
            ? evt.data.find(v => !ctx.items.includes(v))
            : ctx.items.includes(evt.data)
            ? null
            : evt.data,
      }),
      setCustom: actions.assign({ custom: (_, evt) => evt.data }),
      setItems: actions.assign({ items: (_, evt) => evt.data }),
      setType: actions.assign({ type: (_, evt) => evt.data }),
      setMin: actions.assign({ min: (_, evt) => evt.data }),
      setMax: actions.assign({ max: (_, evt) => evt.data }),
    },
  }
);
