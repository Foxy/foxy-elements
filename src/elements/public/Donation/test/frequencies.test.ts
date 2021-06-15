import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';
import { DropdownChangeEvent } from '../../../private/events';

const samples = {
  frequency: '.5m',
  frequencies: [' ', '.5m', '6m', '12y'],
};

/**
 * @param element
 */
async function expectNoErrorScreen(element: Donation) {
  await element.updateComplete;
  const { error } = getRefs<Refs>(element);
  expect(error, 'error screen must not be rendered').to.be.undefined;
}

/**
 * @param element
 */
async function expectFrequency(element: Donation) {
  await element.updateComplete;
  expect(element.frequency, 'sample frequency must be set').to.equal(samples.frequency);
}

/**
 * @param element
 */
async function expectNoFrequency(element: Donation) {
  await element.updateComplete;
  expect(element.frequency, 'frequency must be null').to.be.null;
}

/**
 * @param element
 */
async function expectFrequencyPicker(element: Donation) {
  await element.updateComplete;

  const { frequency } = getRefs<Refs>(element);
  const { frequencies } = samples;

  expect(frequency, 'frequency dropdown must be visible').to.be.visible;
  expect(frequency?.items, 'sample frequencies must be rendered').to.deep.equal(frequencies);
}

/**
 * @param element
 */
async function expectNoFrequencyPicker(element: Donation) {
  await element.updateComplete;
  const { frequency } = getRefs<Refs>(element);
  expect(frequency, 'frequency dropdown must not be rendered').to.be.undefined;
}

const machine = createMachine({
  id: 'frequencies',
  meta: { test: expectNoErrorScreen },
  initial: 'off',
  states: {
    off: {
      meta: { test: expectNoFrequencyPicker },
      initial: 'unset',
      states: {
        unset: {
          meta: { test: expectNoFrequency },
          on: {
            SET_FREQUENCY: 'set',
            SET_FREQUENCIES: '#frequencies.on.unset',
          },
        },
        set: {
          meta: { test: expectFrequency },
          on: {
            UNSET_FREQUENCY: 'unset',
            SET_FREQUENCIES: '#frequencies.on.set',
          },
        },
      },
    },
    on: {
      meta: { test: expectFrequencyPicker },
      on: { UNSET_FREQUENCIES: 'on' },
      initial: 'unset',
      states: {
        unset: {
          meta: { test: expectNoFrequency },
          on: {
            SET_FREQUENCY: 'set.programmatically',
            PICK_FREQUENCY: 'set.manually',
            UNSET_FREQUENCIES: '#frequencies.off.unset',
          },
        },
        set: {
          meta: { test: expectFrequency },
          initial: 'programmatically',
          states: {
            manually: { meta: { test: () => true } },
            programmatically: { meta: { test: () => true } },
          },
          on: {
            UNSET_FREQUENCY: 'unset',
            UNSET_FREQUENCIES: '#frequencies.off.set',
          },
        },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  SET_FREQUENCY: {
    exec: exec<Refs, Donation>(({ element }) => (element.frequency = samples.frequency)),
  },
  PICK_FREQUENCY: {
    exec: exec<Refs, Donation>(({ frequency }) => {
      frequency!.value = samples.frequency;
      frequency!.dispatchEvent(new DropdownChangeEvent(samples.frequency));
    }),
  },
  UNSET_FREQUENCY: {
    exec: exec<Refs, Donation>(({ element }) => (element.frequency = null)),
  },
  SET_FREQUENCIES: {
    exec: exec<Refs, Donation>(({ element }) => (element.frequencies = samples.frequencies)),
  },
  UNSET_FREQUENCIES: {
    exec: exec<Refs, Donation>(({ element }) => (element.frequencies = null)),
  },
});
