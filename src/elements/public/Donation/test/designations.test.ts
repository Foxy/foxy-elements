import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';
import { ChoiceChangeEvent } from '../../../private/events';

const samples = {
  designations: ['Designation one', 'Designation two', 'Designation three'],
  designation: 'Designation one',
};

async function expectNoErrorScreen(element: Donation) {
  await element.requestUpdate();
  const { error } = getRefs<Refs>(element);
  expect(error, 'error screen must not be rendered').to.be.undefined;
}

async function expectNoDesignationPicker(element: Donation) {
  await element.requestUpdate();
  const designation = getRefs<Refs>(element).designation;
  expect(designation, 'designations must not be rendered').to.be.undefined;
}

async function expectNullDesignation(element: Donation) {
  await element.requestUpdate();
  const field = getRefs<Refs>(element).form?.elements.namedItem('Designation');
  expect(field, 'designation must not be included in the form').to.be.null;
  expect(element.designation, 'designation must be null').to.be.null;
}

async function expectStringDesignation(element: Donation) {
  await element.requestUpdate();

  const form = getRefs<Refs>(element).form;
  const field = form?.elements.namedItem('Designation') as HTMLInputElement;
  const sample = samples.designation;

  expect(field.value, 'designation must be in the form').to.equal(sample);
  expect(element.designation, 'designation must equal sample').to.equal(sample);
}

async function expectDesignationPicker(element: Donation) {
  await element.requestUpdate();

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
            UNSET_DESIGNATIONS: '#designations.off.null',
            SET_DESIGNATION_STRING: '#designations.on.string.set',
            CHECK_DESIGNATION: '#designations.on.string.checked',
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
            UNSET_DESIGNATIONS: '#designations.off.string',
            SET_DESIGNATION_NULL: '#designations.on.null',
          },
        },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  SET_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => (element.designations = samples.designations)),
  },
  UNSET_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => (element.designations = null)),
  },
  SET_DESIGNATION_STRING: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = samples.designation)),
  },
  SET_DESIGNATION_NULL: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = null)),
  },
  CHECK_DESIGNATION: {
    exec: exec<Refs, Donation>(({ designation }) => {
      designation!.value = samples.designation;
      designation!.dispatchEvent(new ChoiceChangeEvent(designation!.value));
    }),
  },
});
