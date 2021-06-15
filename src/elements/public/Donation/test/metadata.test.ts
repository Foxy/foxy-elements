import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Donation } from '../Donation';
import { Refs } from './types';

const samples = {
  image: 'https://picsum.photos/480',
  code: '86JGHFV36AKX',
  url: 'https://foxy.io',
};

/**
 * @param element
 */
async function expectImage(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('image') as HTMLInputElement;

  expect(element.image, 'image must equal sample').to.equal(samples.image);
  expect(field.value, 'form data must include image').to.equal(samples.image);
}

/**
 * @param element
 */
async function expectNoImage(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('image');

  expect(element.image, 'image must equal null').to.be.null;
  expect(field, 'form data must not include image').to.be.null;
}

/**
 * @param element
 */
async function expectCode(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('code') as HTMLInputElement;

  expect(element.code, 'code must equal sample').to.equal(samples.code);
  expect(field.value, 'form data must include code').to.equal(samples.code);
}

/**
 * @param element
 */
async function expectNoCode(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('code');

  expect(element.code, 'code must equal null').to.be.null;
  expect(field, 'form data must not include code').to.be.null;
}

/**
 * @param element
 */
async function expectUrl(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('url') as HTMLInputElement;

  expect(element.url, 'url must equal sample').to.equal(samples.url);
  expect(field.value, 'form data must include url').to.equal(samples.url);
}

/**
 * @param element
 */
async function expectNoUrl(element: Donation) {
  await element.updateComplete;

  const form = getRefs<Refs>(element).form!;
  const field = form.elements.namedItem('url');

  expect(element.url, 'url must equal null').to.be.null;
  expect(field, 'form data must not include url').to.be.null;
}

const machine = createMachine({
  id: 'metadata',
  type: 'parallel',
  states: {
    image: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectImage }, on: { UNSET_IMAGE: 'unset' } },
        unset: { meta: { test: expectNoImage }, on: { SET_IMAGE: 'set' } },
      },
    },
    code: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectCode }, on: { UNSET_CODE: 'unset' } },
        unset: { meta: { test: expectNoCode }, on: { SET_CODE: 'set' } },
      },
    },
    url: {
      meta: { test: () => true },
      initial: 'unset',
      states: {
        set: { meta: { test: expectUrl }, on: { UNSET_URL: 'unset' } },
        unset: { meta: { test: expectNoUrl }, on: { SET_URL: 'set' } },
      },
    },
  },
});

export const model = createModel<Donation>(machine).withEvents({
  SET_IMAGE: { exec: exec<Refs, Donation>(({ element }) => (element.image = samples.image)) },
  SET_CODE: { exec: exec<Refs, Donation>(({ element }) => (element.code = samples.code)) },
  SET_URL: { exec: exec<Refs, Donation>(({ element }) => (element.url = samples.url)) },
  UNSET_IMAGE: { exec: exec<Refs, Donation>(({ element }) => (element.image = null)) },
  UNSET_CODE: { exec: exec<Refs, Donation>(({ element }) => (element.code = null)) },
  UNSET_URL: { exec: exec<Refs, Donation>(({ element }) => (element.url = null)) },
});
