import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';
import { ChoiceChangeEvent } from '../../../private/events';

const samples = {
  designations: ['Designation one', 'Designation two', 'Designation three'],
  designation: {
    string: 'Designation one',
    custom: 'Custom designation',
  },
};

async function expectNoErrorScreen(element: Donation) {
  await element.updateComplete;
  const { error } = getRefs<Refs>(element);
  expect(error, 'error screen must not be rendered').to.be.undefined;
}

async function expectNoDesignationPicker(element: Donation) {
  await element.updateComplete;
  const designation = getRefs<Refs>(element).designation;
  expect(designation, 'designations must not be rendered').to.be.undefined;
}

async function expectNullDesignation(element: Donation) {
  await element.updateComplete;
  const field = getRefs<Refs>(element).form?.elements.namedItem('designation');
  expect(field, 'designation must not be included in the form').to.be.null;
  expect(element.designation, 'designation must be null').to.be.null;
}

async function expectStringDesignation(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form;
  const field = form?.elements.namedItem('designation') as HTMLInputElement;
  const sample = samples.designation.string;

  expect(field.value, 'designation must be in the form').to.equal(sample);
  expect(element.designation, 'designation must equal sample').to.equal(sample);
}

async function expectDesignationPicker(element: Donation) {
  await element.updateComplete;

  const { designation: choice } = getRefs<Refs>(element);
  const { designation: value, designations: items } = element;

  expect(choice, 'designations must be rendered').to.be.visible;
  expect(choice?.items, 'designations must be passed down to choice').to.deep.equal(items);
  expect(choice?.value, 'designation must be passed down to choice').to.deep.equal(value);
}

async function expectCustomDesignationToBeDisallowed(element: Donation) {
  await element.updateComplete;
  const message = 'designation must not be customizable';
  expect(element.custom ?? [], message).not.to.include('designation');
}

async function expectCustomDesignationToBeAllowed(element: Donation) {
  await element.updateComplete;
  const message = 'designation must be customizable';
  expect(element.custom, message).to.include('designation');
}

async function expectDesignationPickerNotToBeCustomizable(element: Donation) {
  await expectCustomDesignationToBeDisallowed(element);
  const designation = getRefs<Refs>(element).designation;
  expect(designation?.custom, 'designation must not be customizable').to.be.false;
}

async function expectDesignationPickerToBeCustomizable(element: Donation) {
  await expectCustomDesignationToBeAllowed(element);
  const designation = getRefs<Refs>(element).designation;
  expect(designation?.custom, 'designation must be customizable').to.be.true;
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
          initial: 'predefined',
          states: {
            predefined: {
              meta: { test: expectCustomDesignationToBeDisallowed },
              on: {
                SET_DESIGNATIONS: '#designations.on.null.predefined',
                SET_DESIGNATION_STRING: '#designations.off.string.predefined',
                ENABLE_CUSTOM_DESIGNATIONS: 'custom',
              },
            },
            custom: {
              meta: { test: expectCustomDesignationToBeAllowed },
              on: {
                SET_DESIGNATIONS: '#designations.on.null.custom',
                SET_DESIGNATION_STRING: '#designations.off.string.custom',
                DISABLE_CUSTOM_DESIGNATIONS: 'predefined',
              },
            },
          },
        },
        string: {
          meta: { test: expectStringDesignation },
          initial: 'predefined',
          states: {
            predefined: {
              meta: { test: expectCustomDesignationToBeDisallowed },
              on: {
                SET_DESIGNATIONS: '#designations.on.string.predefined',
                SET_DESIGNATION_NULL: '#designations.off.null.predefined',
                ENABLE_CUSTOM_DESIGNATIONS: 'custom',
              },
            },
            custom: {
              meta: { test: expectCustomDesignationToBeAllowed },
              on: {
                SET_DESIGNATIONS: '#designations.on.string.custom',
                SET_DESIGNATION_NULL: '#designations.off.null.custom',
                DISABLE_CUSTOM_DESIGNATIONS: 'predefined',
              },
            },
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
          initial: 'predefined',
          states: {
            predefined: {
              meta: { test: expectDesignationPickerNotToBeCustomizable },
              on: {
                UNSET_DESIGNATIONS: '#designations.off.null.predefined',
                SET_DESIGNATION_STRING: '#designations.on.string.predefined.set',
                CHECK_DESIGNATION: '#designations.on.string.predefined.checked',
                ENABLE_CUSTOM_DESIGNATIONS: 'custom',
              },
            },
            custom: {
              meta: { test: expectDesignationPickerToBeCustomizable },
              on: {
                UNSET_DESIGNATIONS: '#designations.off.null.custom',
                SET_DESIGNATION_STRING: '#designations.on.string.custom',
                CHECK_DESIGNATION: '#designations.on.string.custom.checked',
                DISABLE_CUSTOM_DESIGNATIONS: 'predefined',
              },
            },
          },
        },
        string: {
          meta: { test: expectStringDesignation },
          initial: 'predefined',
          states: {
            predefined: {
              meta: { test: expectDesignationPickerNotToBeCustomizable },
              initial: 'set',
              states: {
                checked: { meta: { test: () => true } },
                set: { meta: { test: () => true } },
              },
              on: {
                UNSET_DESIGNATIONS: '#designations.off.string.predefined',
                SET_DESIGNATION_NULL: '#designations.on.null.predefined',
                ENABLE_CUSTOM_DESIGNATIONS: 'custom',
              },
            },
            custom: {
              meta: { test: expectDesignationPickerToBeCustomizable },
              initial: 'set',
              states: {
                checked: { meta: { test: () => true } },
                set: { meta: { test: () => true } },
              },
              on: {
                UNSET_DESIGNATIONS: '#designations.off.string.custom',
                SET_DESIGNATION_NULL: '#designations.on.null.custom',
                DISABLE_CUSTOM_DESIGNATIONS: 'predefined',
              },
            },
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
  ENABLE_CUSTOM_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => {
      element.custom = Array.from(new Set([...(element.custom ?? []), 'designation']));
    }),
  },
  DISABLE_CUSTOM_DESIGNATIONS: {
    exec: exec<Refs, Donation>(({ element }) => {
      element.custom = element.custom?.filter(v => v !== 'designation') ?? null;
    }),
  },
  SET_DESIGNATION_STRING: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = samples.designation.string)),
  },
  SET_DESIGNATION_NULL: {
    exec: exec<Refs, Donation>(({ element }) => (element.designation = null)),
  },
  CHECK_DESIGNATION: {
    exec: exec<Refs, Donation>(({ designation }) => {
      designation!.value = samples.designation.string;
      designation!.dispatchEvent(new ChoiceChangeEvent(designation!.value));
    }),
  },
});
