import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';
import { ChoiceChangeEvent } from '../../../private/events';

const samples = {
  amount: {
    predefined: 25,
    custom: 150,
  },
  amounts: [25, 50, 75],
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
async function expectAmountChoice(element: Donation) {
  await element.updateComplete;

  const { amount } = getRefs<Refs>(element);
  const choiceItems = samples.amounts.map(String);

  expect(amount, 'amount choice be visible').to.be.visible;
  expect(amount?.items, 'sample amounts must be rendered').to.deep.equal(choiceItems);
  expect(element.amounts, 'sample amounts must be set').to.deep.equal(samples.amounts);
}

/**
 * @param element
 */
async function expectNoAmountChoice(element: Donation) {
  await element.updateComplete;
  const { amount } = getRefs<Refs>(element);
  expect(amount, 'amount choice must not be rendered').to.be.undefined;
}

/**
 * @param element
 */
async function expectPredefinedAmount(element: Donation) {
  await element.updateComplete;

  const { amount } = getRefs<Refs>(element);
  const value = samples.amount.predefined;

  expect(amount?.value, 'predefined amount must be chosen').to.equal(String(value));
  expect(element.amount, 'predefined amount must be set').to.equal(value);
}

/**
 * @param element
 */
async function expectCustomAmount(element: Donation) {
  await element.updateComplete;

  const { amount } = getRefs<Refs>(element);
  const value = samples.amount.custom;

  expect(amount?.value, 'custom amount must be chosen').to.equal(String(value));
  expect(element.amount, 'custom amount must be set').to.equal(value);
}

/**
 * @param element
 */
async function expectCustomAmountToBeAvailable(element: Donation) {
  await element.updateComplete;
  const { amount } = getRefs<Refs>(element);
  expect(amount?.custom, 'custom amount must be available').to.be.true;
}

const machine = createMachine({
  id: 'amounts',
  initial: 'off',
  meta: { test: expectNoErrorScreen },
  states: {
    off: {
      meta: { test: expectNoAmountChoice },
      on: { SET_AMOUNTS: 'on' },
    },
    on: {
      meta: { test: expectAmountChoice },
      on: { UNSET_AMOUNTS: 'off' },
      initial: 'predefined',
      states: {
        predefined: {
          meta: { test: expectPredefinedAmount },
          on: { ENABLE_CUSTOM_AMOUNTS: 'custom' },
        },
        custom: {
          meta: { test: expectCustomAmountToBeAvailable },
          on: { DISABLE_CUSTOM_AMOUNTS: 'predefined' },
          initial: 'available',
          states: {
            available: {
              meta: { test: expectPredefinedAmount },
              on: {
                SET_CUSTOM_AMOUNT: 'checked.programmatically',
                ENTER_CUSTOM_AMOUNT: 'checked.manually',
              },
            },
            checked: {
              meta: { test: expectCustomAmount },
              on: { SET_PREDEFINED_AMOUNT: 'available' },
              initial: 'programmatically',
              states: {
                programmatically: { meta: { test: () => true } },
                manually: { meta: { test: () => true } },
              },
            },
          },
        },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  ENABLE_CUSTOM_AMOUNTS: {
    exec: exec<Refs, Donation>(({ element }) => {
      element.custom = Array.from(new Set([...(element.custom ?? []), 'amount']));
    }),
  },
  DISABLE_CUSTOM_AMOUNTS: {
    exec: exec<Refs, Donation>(({ element }) => {
      element.custom = element.custom?.filter(v => v !== 'amount') ?? null;
    }),
  },
  SET_AMOUNTS: {
    exec: exec<Refs, Donation>(({ element }) => (element.amounts = samples.amounts)),
  },
  UNSET_AMOUNTS: {
    exec: exec<Refs, Donation>(({ element }) => (element.amounts = null)),
  },
  SET_CUSTOM_AMOUNT: {
    exec: exec<Refs, Donation>(({ element }) => (element.amount = samples.amount.custom)),
  },
  SET_PREDEFINED_AMOUNT: {
    exec: exec<Refs, Donation>(({ element }) => (element.amount = samples.amount.predefined)),
  },
  ENTER_CUSTOM_AMOUNT: {
    exec: exec<Refs, Donation>(({ amount }) => {
      amount!.value = samples.amount.custom.toString();
      amount!.dispatchEvent(new ChoiceChangeEvent(samples.amount.custom.toString()));
    }),
  },
  ENTER_PREDEFINED_AMOUNT: {
    exec: exec<Refs, Donation>(({ amount }) => {
      amount!.value = samples.amount.predefined.toString();
      amount!.dispatchEvent(new ChoiceChangeEvent(samples.amount.predefined.toString()));
    }),
  },
});
