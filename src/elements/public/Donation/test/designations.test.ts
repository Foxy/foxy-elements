import { exec, getRefs } from '../../../../utils/test-utils';
import { ChoiceChangeEvent } from '../../../private/events';
import { Donation } from '../..';
import { Refs } from './types';
import { createMachine } from 'xstate';
import { createModel } from '@xstate/test';
import { expect } from '@open-wc/testing';

const samples = {
  designation: 'Designation one',
  designations: ['Designation one', 'Designation two', 'Designation three'],
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
async function expectNoDesignationPicker(element: Donation) {
  await element.updateComplete;
  const designation = getRefs<Refs>(element).designation;
  expect(designation, 'designations must not be rendered').to.be.undefined;
}

/**
 * @param element
 */
async function expectNullDesignation(element: Donation) {
  await element.updateComplete;
  const field = getRefs<Refs>(element).form?.elements.namedItem('Designation');
  expect(field, 'designation must not be included in the form').to.be.null;
  expect(element.designation, 'designation must be null').to.be.null;
}

/**
 * @param element
 */
async function expectStringDesignation(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form;
  const field = form?.elements.namedItem('Designation') as HTMLInputElement;
  const sample = samples.designation;

  expect(field.value, 'designation must be in the form').to.equal(sample);
  expect(element.designation, 'designation must equal sample').to.equal(sample);
}

/**
 * @param element
 */
async function expectDesignationPicker(element: Donation) {
  await element.updateComplete;

  const { designation: choice } = getRefs<Refs>(element);
  const { designation: value, designations: items } = element;

  expect(choice, 'designations must be rendered').to.be.visible;
  expect(choice?.items, 'designations must be passed down to choice').to.deep.equal(items);
  expect(choice?.value, 'designation must be passed down to choice').to.deep.equal(value);
}

const machine = createMachine({
  id: 'designations',
  initial: 'off',
  meta: { test: expectNoErrorScreen },
  states: {
    off: {
      meta: { test: expectNoDesignationPicker },
      initial: 'null',
      states: {
        null: {
          meta: { test: expectNullDesignation },
          on: {
            SET_DESIGNATIONS: '#designations.on.null',
            SET_DESIGNATION_STRING: '#designations.off.string',
          },
        },
        string: {
          meta: { test: expectStringDesignation },
          on: {
            SET_DESIGNATIONS: '#designations.on.string',
            SET_DESIGNATION_NULL: '#designations.off.null',
          },
        },
      },
    },
    on: {
      meta: { test: expectDesignationPicker },
      initial: 'null',
      states: {
        null: {
          meta: { test: expectNullDesignation },
          on: {
            CHECK_DESIGNATION: '#designations.on.string.checked',
            SET_DESIGNATION_STRING: '#designations.on.string.set',
            UNSET_DESIGNATIONS: '#designations.off.null',
          },
        },
        string: {
          meta: { test: expectStringDesignation },
          initial: 'set',
          states: {
            checked: { meta: { test: () => true } },
            set: { meta: { test: () => true } },
          },
          on: {
            SET_DESIGNATION_NULL: '#designations.on.null',
            UNSET_DESIGNATIONS: '#designations.off.string',
          },
        },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  CHECK_DESIGNATION: {
    exec: exec<Refs, Donation>(({ designation }) => {
      designation!.value = samples.designation;
      designation!.dispatchEvent(new ChoiceChangeEvent(designation!.value));
    }),
  },
  SET_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => (element.designations = samples.designations)),
  },
  SET_DESIGNATION_NULL: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = null)),
  },
  SET_DESIGNATION_STRING: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = samples.designation)),
  },
  UNSET_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => (element.designations = null)),
  },
});
