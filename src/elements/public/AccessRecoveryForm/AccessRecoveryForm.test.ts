import './index';

import { Data, Templates } from './types';

import { AccessRecoveryForm } from './AccessRecoveryForm';
import { ButtonElement } from '@vaadin/vaadin-button';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { Spinner } from '../Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { testSlot } from '../../../testgen/testSlot';
import { testTemplateFunction } from '../../../testgen/testTemplateFunction';
import { testTemplateMarkup } from '../../../testgen/testTemplateMarkup';

type Refs = {
  spinner: Spinner;
  wrapper: HTMLElement;
  message: HTMLParagraphElement;
  submit: ButtonElement;
  email: EmailFieldElement;
};

describe('AccessRecoveryForm', () => {
  generateTests<Data, AccessRecoveryForm, Refs>({
    tag: 'foxy-access-recovery-form',
    href: 'https://demo.foxycart.com/s/virtual/recovery',
    parent: 'https://demo.foxycart.com/s/virtual/recovery',
    maxTestsPerState: 2,
    isEmptyValid: false,
    invalidate: form => ({ ...form, detail: { email: '' } }),

    actions: {
      async edit({ refs, form }) {
        refs.email.value = form.detail.email;
        refs.email.dispatchEvent(new CustomEvent('input'));
      },

      async submit({ refs }) {
        refs.submit.click();
      },
    },

    assertions: {
      test: async ({ refs, element }) => {
        expect(refs.spinner).to.have.attribute('lang', element.lang);
        expect(refs.spinner).to.have.attribute('ns', element.ns);
        expect(refs.email.value ?? '').to.equal(element.form.detail?.email ?? '');

        for (const control of ['email', 'submit']) {
          for (const position of ['before', 'after']) {
            const slot = [control, position].join(':') as keyof Templates;

            await testSlot(element, slot);
            await testTemplateMarkup(element, slot);
            await testTemplateFunction(element, slot);
          }
        }
      },

      busy: async ({ refs, element }) => {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.spinner).to.have.attribute('state', 'busy');
        expect(refs.submit).to.have.attribute('disabled');
        expect(refs.email).to.have.attribute('disabled');

        for (const slot of ['message:before', 'message:after']) {
          await testSlot(element, slot).catch(err => expect(err).to.exist);
          await testTemplateMarkup(element, slot).catch(err => expect(err).to.exist);
          await testTemplateFunction(element, slot).catch(err => expect(err).to.exist);
        }
      },

      idle: {
        test: async ({ refs, element }) => {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner.parentElement).to.have.class('opacity-0');

          for (const slot of ['message:before', 'message:after']) {
            await testSlot(element, slot).catch(err => expect(err).to.exist);
            await testTemplateMarkup(element, slot).catch(err => expect(err).to.exist);
            await testTemplateFunction(element, slot).catch(err => expect(err).to.exist);
          }
        },

        snapshot: {
          test: async ({ refs }) => {
            expect(refs.message).to.have.attribute('key', 'recover_access_success');
          },
          clean: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: async ({ refs }) => expect(refs.submit).not.to.have.attribute('disabled'),
          },
          dirty: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: async ({ refs }) => expect(refs.submit).not.to.have.attribute('disabled'),
          },
        },

        template: {
          test: async ({ refs }) => {
            expect(refs.message).to.be.undefined;
          },
          clean: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: async ({ refs }) => expect(refs.submit).not.to.have.attribute('disabled'),
          },
          dirty: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: async ({ refs }) => expect(refs.submit).not.to.have.attribute('disabled'),
          },
        },
      },

      fail: async ({ refs, element }) => {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.spinner.parentElement).to.have.class('opacity-0');
        expect(refs.email).to.have.attribute('disabled');
        expect(refs.message).to.have.attribute('key', 'unknown_error');
        expect(refs.submit).to.have.attribute('disabled');

        for (const slot of ['message:before', 'message:after']) {
          await testSlot(element, slot);
          await testTemplateMarkup(element, slot);
          await testTemplateFunction(element, slot);
        }
      },
    },
  });
});
