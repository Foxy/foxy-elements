import { Machine } from 'xstate/dist/xstate.web.js';

export interface ChoiceContext {
  value: string;
  items: string[];
  getText: (value: string) => string;
}

export interface ChoiceStateSchema {
  states: {
    enabled: Record<string, unknown>;
    disabled: Record<string, unknown>;
  };
}

export type ChoiceEvent =
  | { type: 'DISABLE' | 'ENABLE' }
  | { type: 'CHOOSE'; value: string }
  | ({ type: 'INIT' } & Partial<ChoiceContext>);

export const ChoiceMachine = Machine<ChoiceContext, ChoiceStateSchema, ChoiceEvent>({
  id: 'choice',
  initial: 'enabled',
  context: {
    getText: v => v,
    items: [],
    value: '',
  },
  states: {
    enabled: {
      on: {
        DISABLE: 'disabled',
        CHOOSE: { actions: 'choose' },
      },
    },
    disabled: {
      on: {
        ENABLE: 'enabled',
      },
    },
  },
  on: {
    INIT: { actions: 'init' },
  },
});
