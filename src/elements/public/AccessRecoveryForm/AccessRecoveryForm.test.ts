import './index';

import { Data, Templates } from './types';

import { AccessRecoveryForm } from './AccessRecoveryForm';
import { ButtonElement } from '@vaadin/vaadin-button';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { Spinner } from '../Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { testDisabledSelector } from '../../../testgen/testDisabledSelector';
import { testHiddenSelector } from '../../../testgen/testHiddenSelector';
import { testReadonlySelector } from '../../../testgen/testReadonlySelector';
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
    maxTestsPerState: 3,
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

        await testReadonlySelector(element, 'email');

        for (const control of ['email', 'submit']) {
          await testHiddenSelector(element, control);

          for (const position of ['before', 'after']) {
            const slot = [control, position].join(':') as keyof Templates;

            await testSlot(element, slot);
            await testTemplateMarkup(element, slot);
            await testTemplateFunction(element, slot);
          }
        }
      },

      busy: async ({ refs }) => {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.spinner).to.have.attribute('state', 'busy');
        expect(refs.submit).to.have.attribute('disabled');
        expect(refs.email).to.have.attribute('disabled');
      },

      idle: {
        test: async ({ refs, element }) => {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner.parentElement).to.have.class('opacity-0');
          await testDisabledSelector(element, 'email');
        },

        snapshot: {
          test: async ({ refs, element }) => {
            expect(refs.message).to.have.attribute('key', 'recover_access_success');
            await testHiddenSelector(element, 'message');
          },
          clean: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: ({ element }) => testDisabledSelector(element, 'submit'),
          },
          dirty: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: ({ element }) => testDisabledSelector(element, 'submit'),
          },
        },

        template: {
          test: async ({ refs }) => {
            expect(refs.message).to.be.undefined;
          },
          clean: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: ({ element }) => testDisabledSelector(element, 'submit'),
          },
          dirty: {
            invalid: async ({ refs }) => expect(refs.submit).to.have.attribute('disabled'),
            valid: ({ element }) => testDisabledSelector(element, 'submit'),
          },
        },
      },

      fail: async ({ refs, element }) => {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.spinner.parentElement).to.have.class('opacity-0');
        expect(refs.email).to.have.attribute('disabled');
        expect(refs.message).to.have.attribute('key', 'unknown_error');
        expect(refs.submit).to.have.attribute('disabled');

        await testHiddenSelector(element, 'message');

        for (const slot of ['message:before', 'message:after']) {
          await testSlot(element, slot);
          await testTemplateMarkup(element, slot);
          await testTemplateFunction(element, slot);
        }
      },
    },
  });
});
