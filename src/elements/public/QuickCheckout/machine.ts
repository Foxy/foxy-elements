import { Machine, actions } from 'xstate/dist/xstate.web.js';

import { QuickCheckoutContext, QuickCheckoutSchema, QuickCheckoutEvent } from './types';

export const machine = Machine<QuickCheckoutContext, QuickCheckoutSchema, QuickCheckoutEvent>(
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
