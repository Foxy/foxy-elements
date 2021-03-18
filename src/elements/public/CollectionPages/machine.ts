import { Context, Event } from './types';
import { addPage, setError, setFirst, setPages } from './actions';
import { isCollectionEmpty, isEmptyArray, isEmptyString, isLastPage } from './guards';

import { createMachine } from 'xstate';

export const machine = createMachine<Context, Event>({
  id: 'pages',
  initial: 'idle',

  context: {
    first: '',
    pages: [],
    error: null,
  },

  states: {
    busy: {
      invoke: {
        src: 'sendGet',
        onError: { target: 'fail', actions: setError },
        onDone: [
          { target: 'idle.empty', cond: isCollectionEmpty },
          { target: 'idle.end', cond: isLastPage, actions: addPage },
          { target: 'idle.paused', actions: addPage },
        ],
      },
    },

    fail: {},

    idle: {
      initial: 'empty',
      states: {
        paused: {
          invoke: { src: 'observeChildren' },
          on: { INTERSECTION: '#pages.busy' },
        },
        empty: {},
        end: {},
      },
    },
  },

  on: {
    SET_FIRST: [
      { cond: isEmptyString, target: 'idle.empty', actions: setFirst },
      { target: 'busy', actions: setFirst },
    ],

    SET_PAGES: [
      { cond: isEmptyArray, target: 'idle.empty', actions: setPages },
      { target: 'idle.paused', actions: setPages },
    ],
  },
});
