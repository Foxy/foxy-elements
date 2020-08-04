import { Machine, actions } from 'xstate/dist/xstate.web.js';

import { QuickOrderContext, QuickOrderSchema, QuickOrderEvent } from './types';

export const machine = Machine<QuickOrderContext, QuickOrderSchema, QuickOrderEvent>(
  {
    initial: 'enabled',
    states: {
      enabled: {
        on: {
          DISABLE: 'disabled',
          SET_FREQUENCY_MODIFICATION: { actions: 'setFrequencyModification' },
          SET_NEXT_DATE_MODIFICATION: { actions: 'setNextDateModification' },
        },
      },
      disabled: {
        on: { ENABLE: 'enabled' },
      },
    },
  },
  {
    actions: {
      setFrequencyModification: actions.assign({
        subscriptions: (ctx, evt) => {
          if (evt.type !== 'SET_FREQUENCY_MODIFICATION') return ctx!.subscriptions;
          return { ...ctx!.subscriptions, allowFrequencyModification: evt.value };
        },
      }),
      setNextDateModification: actions.assign({
        subscriptions: (ctx, evt) => {
          if (evt.type !== 'SET_NEXT_DATE_MODIFICATION') return ctx!.subscriptions;
          return { ...ctx!.subscriptions, allowNextDateModification: evt.value };
        },
      }),
    },
  }
);
