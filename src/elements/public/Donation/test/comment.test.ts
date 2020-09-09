import { expect } from '@open-wc/testing';
import { createModel } from '@xstate/test';
import { createMachine } from 'xstate';
import { Donation } from '../..';
import { exec, getRefs } from '../../../../utils/test-utils';
import { Refs } from './types';

const samples = {
  comment: 'Prefilled comment',
  enteredComment: 'Entered comment',
};

async function expectNoErrorScreen(element: Donation) {
  await element.updateComplete;
  const { error } = getRefs<Refs>(element);
  expect(error, 'error screen must not be rendered').to.be.undefined;
}

async function expectNoComment(element: Donation) {
  await element.updateComplete;

  const { comment, form } = getRefs<Refs>(element);
  const field = form?.elements.namedItem('comment');

  expect(element.comment, 'comment property must be null').to.be.null;
  expect(comment, 'comment input must not be rendered').to.be.undefined;
  expect(field, 'comment must not be in the form data').to.be.null;
}

async function expectEmptyComment(element: Donation) {
  await element.updateComplete;

  const { comment, form } = getRefs<Refs>(element);
  const field = form?.elements.namedItem('comment') as HTMLTextAreaElement;

  expect(element.comment, 'comment property must be empty').to.equal('');
  expect(comment?.value, 'comment input must be empty').to.equal('');
  expect(field.value, 'comment must be in the form data').to.equal('');
}

async function expectEnteredComment(element: Donation) {
  await element.updateComplete;

  const { comment, form } = getRefs<Refs>(element);
  const field = form?.elements.namedItem('comment') as HTMLTextAreaElement;
  const sample = samples.enteredComment;

  expect(element.comment, 'comment property must equal sample').to.equal(sample);
  expect(comment?.value, 'comment input must have sample value').to.equal(sample);
  expect(field.value, 'comment must be in the form data').to.equal(sample);
}

async function expectPrefilledComment(element: Donation) {
  await element.updateComplete;

  const { comment, form } = getRefs<Refs>(element);
  const field = form?.elements.namedItem('comment') as HTMLTextAreaElement;
  const sample = samples.comment;

  expect(element.comment, 'comment property must equal sample').to.equal(sample);
  expect(comment?.value, 'comment input must have sample value').to.equal(sample);
  expect(field.value, 'comment must be in the form data').to.equal(sample);
}

const machine = createMachine({
  id: 'comment',
  meta: { test: expectNoErrorScreen },
  initial: 'off',
  states: {
    off: { meta: { test: expectNoComment } },
    empty: { meta: { test: expectEmptyComment }, on: { ENTER_COMMENT: 'entered' } },
    entered: { meta: { test: expectEnteredComment } },
    prefilled: { meta: { test: expectPrefilledComment }, on: { ENTER_COMMENT: 'entered' } },
  },
  on: {
    PREFILL_COMMENT: '.prefilled',
    DISABLE_COMMENT: '.off',
    ENABLE_COMMENT: '.empty',
  },
});

export const model = createModel<Donation>(machine).withEvents({
  PREFILL_COMMENT: {
    exec: exec<Refs, Donation>(({ element }) => (element.comment = samples.comment)),
  },
  ENABLE_COMMENT: {
    exec: exec<Refs, Donation>(({ element }) => (element.comment = '')),
  },
  DISABLE_COMMENT: {
    exec: exec<Refs, Donation>(({ element }) => (element.comment = null)),
  },
  ENTER_COMMENT: {
    exec: exec<Refs, Donation>(({ comment }) => {
      comment!.value = samples.enteredComment;
      comment!.dispatchEvent(new InputEvent('input'));
    }),
  },
});
