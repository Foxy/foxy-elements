import { Context, Event } from './types';
import { addPage, setError, setFirst, setPages } from './actions';
import { isCollectionEmpty, isEmptyArray, isEmptyString, isLastPage } from './guards';

import { createMachine } from 'xstate';

export const machine = createMachine<Context, Event>({
  id: 'pages',
  initial: 'idle',

  context: {
    error: null,
    first: '',
    pages: [],
  },

  states: {
    busy: {
      invoke: {
        onDone: [
          { cond: isCollectionEmpty, target: 'idle.empty' },
          { actions: addPage, cond: isLastPage, target: 'idle.end' },
          { actions: addPage, target: 'idle.paused' },
        ],
        onError: { actions: setError, target: 'fail' },
        src: 'sendGet',
      },
    },

    fail: {},

    idle: {
      initial: 'empty',
      states: {
        empty: {},
        end: {},
        paused: {
          invoke: { src: 'observeChildren' },
          on: { INTERSECTION: '#pages.busy' },
        },
      },
    },
  },

  on: {
    SET_FIRST: [
      { actions: setFirst, cond: isEmptyString, target: 'idle.empty' },
      { actions: setFirst, target: 'busy' },
    ],

    SET_PAGES: [
      { actions: setPages, cond: isEmptyArray, target: 'idle.empty' },
      { actions: setPages, target: 'idle.paused' },
    ],
  },
});
