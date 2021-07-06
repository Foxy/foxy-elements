import { Context, Event } from './types';
import { addPage, setError, setFirst, setManual, setPages } from './actions';
import { isCollectionEmpty, isEmptyArray, isEmptyString, isLastPage, isManual } from './guards';

import { createMachine } from 'xstate';

export const machine = createMachine<Context, Event>({
  id: 'pages',
  initial: 'idle',

  context: {
    first: '',
    pages: [],
    error: null,
    manual: false,
  },

  states: {
    busy: {
      invoke: {
        src: 'sendGet',
        onError: { target: 'fail', actions: setError },
        onDone: [
          { target: 'idle.empty', cond: isCollectionEmpty },
          { target: 'idle.end', cond: isLastPage, actions: addPage },
          { target: 'idle.paused.manual', cond: isManual, actions: addPage },
          { target: 'idle.paused.auto', actions: addPage },
        ],
      },

      on: { SET_MANUAL: { actions: setManual } },
    },

    fail: {
      on: { SET_MANUAL: { actions: setManual } },
    },

    idle: {
      initial: 'empty',
      states: {
        paused: {
          states: {
            auto: { invoke: { src: 'observeChildren' } },
            manual: {},
          },

          on: {
            RESUME: '#pages.busy',
            SET_MANUAL: [
              { cond: isManual, actions: setManual, target: '.manual' },
              { actions: setManual, target: '.auto' },
            ],
          },
        },
        empty: { on: { SET_MANUAL: { actions: setManual } } },
        end: { on: { SET_MANUAL: { actions: setManual } } },
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
