import { Machine } from 'xstate/dist/xstate.web.js';

export interface ChooseValueSchema {
  states: {
    pending: any;
    selected: any;
    other: any;
  };
}

export interface ChooseValueEvent {
  type: 'OTHER' | 'SELECT';
}

export const ChooseValueMachine = Machine<void, ChooseValueSchema, ChooseValueEvent>({
  id: 'choose-value',
  initial: 'pending',
  states: {
    pending: {
      on: {
        OTHER: 'other',
        SELECT: 'selected',
      },
    },
    selected: {
      on: {
        OTHER: 'other',
      },
    },
    other: {
      on: {
        SELECT: 'selected',
      },
    },
  },
});
