import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';
import { CheckboxChangeEvent } from '../../../private/events';

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
async function expectNoAnonymityCheckbox(element: Donation) {
  await element.updateComplete;
  const { anonymity } = getRefs<Refs>(element);
  expect(anonymity, 'anonymity checkbox must not be rendered').to.be.undefined;
  expect(element.anonymity, 'anonymity must be disabled').to.be.false;
}

/**
 * @param element
 */
async function expectAnonymityCheckbox(element: Donation) {
  await element.updateComplete;
  const { anonymity } = getRefs<Refs>(element);
  expect(anonymity, 'anonymity checkbox must be rendered').to.be.visible;
  expect(element.anonymity, 'anonymity must be enabled').to.be.true;
}

/**
 * @param element
 */
async function expectPublicDonation(element: Donation) {
  await element.updateComplete;
  const field = getRefs<Refs>(element).form?.elements.namedItem('Anonymous') as HTMLInputElement;
  expect(field).not.to.exist;
  expect(element.anonymous, 'anonymous must be set to false').to.be.false;
}

/**
 * @param element
 */
async function expectAnonymousDonation(element: Donation) {
  await element.updateComplete;
  const field = getRefs<Refs>(element).form?.elements.namedItem('Anonymous') as HTMLInputElement;
  expect(field.value, 'form data must have anonymous=true').to.equal('true');
  expect(element.anonymous, 'anonymous must be set to true').to.be.true;
}

/**
 * @param element
 */
async function expectConfigurablePublicDonation(element: Donation) {
  await expectPublicDonation(element);
  const { anonymity } = getRefs<Refs>(element);
  expect(anonymity, 'anonymity box must be rendered').to.be.visible;
  expect(anonymity?.checked, 'anonymity box must not be checked').to.be.false;
}

/**
 * @param element
 */
async function expectConfigurableAnonymousDonation(element: Donation) {
  await expectAnonymousDonation(element);
  const { anonymity } = getRefs<Refs>(element);
  expect(anonymity, 'anonymity box must be rendered').to.be.visible;
  expect(anonymity?.checked, 'anonymity box must be checked').to.be.true;
}

const machine = createMachine({
  id: 'anonymity',
  initial: 'off',
  meta: { test: expectNoErrorScreen },
  states: {
    off: {
      meta: { test: expectNoAnonymityCheckbox },
      initial: 'public',
      states: {
        public: {
          meta: { test: expectPublicDonation },
          on: {
            SET_ANONYMOUS_TRUE: 'anonymous',
            SET_ANONYMITY_TRUE: '#anonymity.on.public.set',
          },
        },
        anonymous: {
          meta: { test: expectAnonymousDonation },
          on: {
            SET_ANONYMOUS_FALSE: 'public',
            SET_ANONYMITY_TRUE: '#anonymity.on.anonymous.set',
          },
        },
      },
    },
    on: {
      meta: { test: expectAnonymityCheckbox },
      initial: 'public',
      states: {
        public: {
          meta: { test: expectConfigurablePublicDonation },
          initial: 'checked',
          states: {
            checked: { meta: { test: () => true } },
            set: { meta: { test: () => true } },
          },
          on: {
            SET_ANONYMOUS_TRUE: 'anonymous.set',
            SET_ANONYMITY_FALSE: '#anonymity.off.public',
            CHECK: 'anonymous.checked',
          },
        },
        anonymous: {
          meta: { test: expectConfigurableAnonymousDonation },
          initial: 'checked',
          states: {
            checked: { meta: { test: () => true } },
            set: { meta: { test: () => true } },
          },
          on: {
            SET_ANONYMOUS_FALSE: 'public.set',
            SET_ANONYMITY_FALSE: '#anonymity.off.anonymous',
            CHECK: 'public.checked',
          },
        },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  SET_ANONYMITY_TRUE: {
    exec: exec<Refs, Donation>(({ element }) => (element.anonymity = true)),
  },
  SET_ANONYMITY_FALSE: {
    exec: exec<Refs, Donation>(({ element }) => (element.anonymity = false)),
  },
  SET_ANONYMOUS_TRUE: {
    exec: exec<Refs, Donation>(({ element }) => (element.anonymous = true)),
  },
  SET_ANONYMOUS_FALSE: {
    exec: exec<Refs, Donation>(({ element }) => (element.anonymous = false)),
  },
  CHECK: {
    exec: exec<Refs, Donation>(({ anonymity }) => {
      anonymity!.checked = !anonymity!.checked;
      anonymity!.dispatchEvent(new CheckboxChangeEvent(anonymity!.checked));
    }),
  },
});
