import './index';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialogElement } from '../../private/ConfirmDialog';
import { CustomerFormElement } from './CustomerFormElement';
import { Data } from '../Customer/types';
import { DialogElement } from '../../private/Dialog';
import { SpinnerElement } from '../Spinner';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  first_name: TextFieldElement;
  last_name: TextFieldElement;
  tax_id: TextFieldElement;
  email: TextFieldElement;
  action: ButtonElement;
  confirm: ConfirmDialogElement;
  wrapper: HTMLDivElement;
  spinner: SpinnerElement;
};

describe('CustomerForm', () => {
  generateTests<Data, CustomerFormElement, Refs>({
    tag: 'foxy-customer-form',
    href: 'https://demo.foxycart.com/s/admin/customers/0',
    parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    isEmptyValid: false,
    maxTestsPerState: 3,

    invalidate(form) {
      return {
        ...form,
        first_name: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        last_name: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        tax_id: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        email: '',
      };
    },

    actions: {
      async edit({ form, refs }) {
        refs.first_name.value = form.first_name;
        refs.first_name.dispatchEvent(new CustomEvent('input'));

        refs.last_name.value = form.last_name;
        refs.last_name.dispatchEvent(new CustomEvent('input'));

        refs.tax_id.value = form.tax_id;
        refs.tax_id.dispatchEvent(new CustomEvent('input'));

        refs.email.value = form.email;
        refs.email.dispatchEvent(new CustomEvent('input'));
      },

      async delete({ refs, element }) {
        refs.action.click();
        await element.updateComplete;
        refs.confirm.dispatchEvent(new DialogElement.HideEvent());
      },

      async submit({ refs }) {
        refs.first_name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      },
    },

    assertions: {
      busy({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.spinner).to.have.property('state', 'busy');

        expect(refs.first_name).to.have.attribute('disabled');
        expect(refs.last_name).to.have.attribute('disabled');
        expect(refs.email).to.have.attribute('disabled');
        expect(refs.tax_id).to.have.attribute('disabled');
      },

      fail({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.spinner).to.have.property('state', 'error');

        expect(refs.first_name).to.have.attribute('disabled');
        expect(refs.last_name).to.have.attribute('disabled');
        expect(refs.email).to.have.attribute('disabled');
        expect(refs.tax_id).to.have.attribute('disabled');
      },

      idle: {
        test({ refs }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner).to.be.undefined;

          expect(refs.first_name).not.to.have.attribute('disabled');
          expect(refs.last_name).not.to.have.attribute('disabled');
          expect(refs.email).not.to.have.attribute('disabled');
          expect(refs.tax_id).not.to.have.attribute('disabled');
        },

        template: {
          clean: {
            test({ refs }) {
              expect(refs.first_name).to.have.property('value', '');
              expect(refs.last_name).to.have.property('value', '');
              expect(refs.email).to.have.property('value', '');
              expect(refs.tax_id).to.have.property('value', '');
            },

            invalid({ refs }) {
              expect(refs.action).to.have.attribute('disabled');

              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.email.checkValidity(), 'email must be invalid').to.be.false;
              expect(refs.tax_id.checkValidity(), 'tax_id must be valid').to.be.true;
            },
          },

          dirty: {
            test({ refs, element }) {
              expect(refs.first_name).to.have.property('value', element.form.first_name);
              expect(refs.last_name).to.have.property('value', element.form.last_name);
              expect(refs.email).to.have.property('value', element.form.email);
              expect(refs.tax_id).to.have.property('value', element.form.tax_id);
            },

            valid({ refs }) {
              expect(refs.action).not.to.have.attribute('disabled');

              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.email.checkValidity(), 'email must be valid').to.be.true;
              expect(refs.tax_id.checkValidity(), 'tax_id must be valid').to.be.true;
            },

            invalid({ refs }) {
              expect(refs.action).to.have.attribute('disabled');

              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.email.checkValidity(), 'email must be invalid').to.be.false;
              expect(refs.tax_id.checkValidity(), 'tax_id must be invalid').to.be.false;
            },
          },
        },

        snapshot: {
          test({ refs, element }) {
            expect(refs.action).not.to.have.attribute('disabled');
            expect(refs.confirm).to.have.attribute('lang', element.lang);
            expect(refs.first_name).to.have.property('value', element.form.first_name);
            expect(refs.last_name).to.have.property('value', element.form.last_name);
            expect(refs.email).to.have.property('value', element.form.email);
            expect(refs.tax_id).to.have.property('value', element.form.tax_id);
          },

          clean: {
            valid({ refs }) {
              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.email.checkValidity(), 'email must be valid').to.be.true;
              expect(refs.tax_id.checkValidity(), 'tax_id must be valid').to.be.true;
            },

            invalid({ refs }) {
              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.email.checkValidity(), 'email must be invalid').to.be.false;
              expect(refs.tax_id.checkValidity(), 'tax_id must be invalid').to.be.false;
            },
          },

          dirty: {
            valid({ refs }) {
              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.email.checkValidity(), 'email must be valid').to.be.true;
              expect(refs.tax_id.checkValidity(), 'tax_id must be valid').to.be.true;
            },

            invalid({ refs }) {
              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.email.checkValidity(), 'email must be invalid').to.be.false;
              expect(refs.tax_id.checkValidity(), 'tax_id must be invalid').to.be.false;
            },
          },
        },
      },
    },
  });
});
