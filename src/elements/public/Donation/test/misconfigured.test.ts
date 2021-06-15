import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { State, createMachine } from 'xstate';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Donation } from '../../index';
import { Refs } from './types';

const samples = {
  currency: 'usd',
  store: 'foxy-demo',
  name: 'Test donation',
  amount: 25,
};

/**
 * @param element
 */
async function expectErrorScreen(element: Donation) {
  await element.updateComplete;
  const { error } = getRefs<Refs>(element);
  expect(error, 'error screen must be rendered').not.to.be.undefined;
  expect(error, 'error screen must be visible').to.be.visible;
}

/**
 * @param element
 */
async function expectCurrency(element: Donation) {
  await element.updateComplete;
  expect(element.currency, 'currency must equal sample').to.equal(samples.currency);
}

/**
 * @param element
 */
async function expectNoCurrency(element: Donation) {
  await element.updateComplete;
  expect(element.currency, 'currency must equal null').to.be.null;
}

/**
 * @param element
 */
async function expectAmount(element: Donation) {
  await element.updateComplete;
  expect(element.amount, 'amount must equal sample').to.equal(samples.amount);
}

/**
 * @param element
 */
async function expectNoAmount(element: Donation) {
  await element.updateComplete;
  expect(element.amount, 'amount must equal null').to.be.null;
}

/**
 * @param element
 */
async function expectStore(element: Donation) {
  await element.updateComplete;
  expect(element.store, 'store must equal sample').to.equal(samples.store);
}

/**
 * @param element
 */
async function expectNoStore(element: Donation) {
  await element.updateComplete;
  expect(element.store, 'store must equal null').to.be.null;
}

/**
 * @param element
 */
async function expectName(element: Donation) {
  await element.updateComplete;
  expect(element.name, 'name must equal sample').to.equal(samples.name);
}

/**
 * @param element
 */
async function expectNoName(element: Donation) {
  await element.updateComplete;
  expect(element.name, 'name must equal null').to.be.null;
}

const machine = createMachine({
  type: 'parallel',
  meta: { test: expectErrorScreen },
  states: {
    currency: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectCurrency }, on: { UNSET_CURRENCY: 'unset' } },
        unset: { meta: { test: expectNoCurrency }, on: { SET_CURRENCY: 'set' } },
      },
    },
    amount: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectAmount }, on: { UNSET_AMOUNT: 'unset' } },
        unset: { meta: { test: expectNoAmount }, on: { SET_AMOUNT: 'set' } },
      },
    },
    store: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectStore }, on: { UNSET_STORE: 'unset' } },
        unset: { meta: { test: expectNoStore }, on: { SET_STORE: 'set' } },
      },
    },
    name: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectName }, on: { UNSET_NAME: 'unset' } },
        unset: { meta: { test: expectNoName }, on: { SET_NAME: 'set' } },
      },
    },
  },
});

/**
 * @param state
 */
function filterStates(state: State<any>) {
  return !['currency', 'amount', 'store', 'name'].every(key => state.matches(`${key}.set`));
}

export const model = createModel<Donation>(machine).withEvents({
  SET_CURRENCY: {
    exec: exec<Refs, Donation>(({ element }) => (element.currency = samples.currency)),
  },
  SET_AMOUNT: {
    exec: exec<Refs, Donation>(({ element }) => (element.amount = samples.amount)),
  },
  SET_STORE: {
    exec: exec<Refs, Donation>(({ element }) => (element.store = samples.store)),
  },
  SET_NAME: {
    exec: exec<Refs, Donation>(({ element }) => (element.name = samples.name)),
  },
  UNSET_CURRENCY: {
    exec: exec<Refs, Donation>(({ element }) => (element.currency = null)),
  },
  UNSET_AMOUNT: {
    exec: exec<Refs, Donation>(({ element }) => (element.amount = null)),
  },
  UNSET_STORE: {
    exec: exec<Refs, Donation>(({ element }) => (element.store = null)),
  },
  UNSET_NAME: {
    exec: exec<Refs, Donation>(({ element }) => (element.name = null)),
  },
});

export const plans = model.getShortestPathPlans({ filter: filterStates });
