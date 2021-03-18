import './index';

import { AddressForm } from './AddressForm';
import { ButtonElement } from '@vaadin/vaadin-button';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { ConfirmDialog } from '../../private/ConfirmDialog/ConfirmDialog';
import { Data } from './types';
import { Dialog } from '../../private/Dialog/Dialog';
import { Spinner } from '../Spinner/Spinner';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  address_name: TextFieldElement;
  first_name: TextFieldElement;
  last_name: TextFieldElement;
  company: TextFieldElement;
  phone: TextFieldElement;
  address1: TextFieldElement;
  address2: TextFieldElement;
  country: ComboBoxElement;
  region: ComboBoxElement;
  city: TextFieldElement;
  postal_code: TextFieldElement;
  action: ButtonElement;
  spinner: Spinner;
  wrapper: HTMLDivElement;
  confirm: ConfirmDialog;
};

describe('AddressForm', () => {
  generateTests<Data, AddressForm, Refs>({
    tag: 'foxy-address-form',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/addresses',
    isEmptyValid: false,
    maxTestsPerState: 3,

    invalidate(form) {
      return {
        ...form,
        address_name: '',
        address1: '',
        first_name: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        last_name: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        region: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        city: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        phone: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        company: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
        address2: `More than 100 characters: ${new Array(100).fill(0).join('')}`,
        postal_code: `More than 50 characters: ${new Array(50).fill(0).join('')}`,
      };
    },

    actions: {
      async edit({ refs, form }) {
        refs.address_name.value = form.address_name;
        refs.address_name.dispatchEvent(new CustomEvent('input'));

        refs.first_name.value = form.first_name;
        refs.first_name.dispatchEvent(new CustomEvent('input'));

        refs.last_name.value = form.last_name;
        refs.last_name.dispatchEvent(new CustomEvent('input'));

        refs.company.value = form.company;
        refs.company.dispatchEvent(new CustomEvent('input'));

        refs.phone.value = form.phone;
        refs.phone.dispatchEvent(new CustomEvent('input'));

        refs.address1.value = form.address1;
        refs.address1.dispatchEvent(new CustomEvent('input'));

        refs.address2.value = form.address2;
        refs.address2.dispatchEvent(new CustomEvent('input'));

        refs.country.value = form.country;
        refs.country.dispatchEvent(new CustomEvent('change'));

        refs.region.value = form.region;
        refs.region.dispatchEvent(new CustomEvent('change'));

        refs.city.value = form.city;
        refs.city.dispatchEvent(new CustomEvent('input'));

        refs.postal_code.value = form.postal_code;
        refs.postal_code.dispatchEvent(new CustomEvent('input'));
      },

      async submit({ refs }) {
        refs.first_name.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      },

      async delete({ refs, element }) {
        refs.action.click();
        await element.updateComplete;
        refs.confirm.dispatchEvent(new Dialog.HideEvent());
      },
    },

    assertions: {
      busy({ refs }) {
        expect(refs.address_name).to.have.attribute('disabled');
        expect(refs.first_name).to.have.attribute('disabled');
        expect(refs.last_name).to.have.attribute('disabled');
        expect(refs.company).to.have.attribute('disabled');
        expect(refs.phone).to.have.attribute('disabled');
        expect(refs.address1).to.have.attribute('disabled');
        expect(refs.address2).to.have.attribute('disabled');
        expect(refs.country).to.have.attribute('disabled');
        expect(refs.region).to.have.attribute('disabled');
        expect(refs.city).to.have.attribute('disabled');
        expect(refs.postal_code).to.have.attribute('disabled');

        expect(refs.spinner).to.be.visible;
        expect(refs.spinner).to.have.property('state', 'busy');
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
      },

      fail({ refs }) {
        expect(refs.spinner).to.be.visible;
        expect(refs.spinner).to.have.property('state', 'error');
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
      },

      idle: {
        test({ refs }) {
          expect(refs.address_name).not.to.have.attribute('disabled');
          expect(refs.first_name).not.to.have.attribute('disabled');
          expect(refs.last_name).not.to.have.attribute('disabled');
          expect(refs.company).not.to.have.attribute('disabled');
          expect(refs.phone).not.to.have.attribute('disabled');
          expect(refs.address1).not.to.have.attribute('disabled');
          expect(refs.address2).not.to.have.attribute('disabled');
          expect(refs.country).not.to.have.attribute('disabled');
          expect(refs.region).not.to.have.attribute('disabled');
          expect(refs.city).not.to.have.attribute('disabled');
          expect(refs.postal_code).not.to.have.attribute('disabled');

          expect(refs.spinner, "spinner mustn't be rendered").to.be.undefined;
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        },

        template: {
          clean: {
            test({ refs }) {
              expect(refs.address_name).to.have.property('value', '');
              expect(refs.first_name).to.have.property('value', '');
              expect(refs.last_name).to.have.property('value', '');
              expect(refs.company).to.have.property('value', '');
              expect(refs.phone).to.have.property('value', '');
              expect(refs.address1).to.have.property('value', '');
              expect(refs.address2).to.have.property('value', '');
              expect(refs.country).to.have.property('value', '');
              expect(refs.region).to.have.property('value', '');
              expect(refs.city).to.have.property('value', '');
              expect(refs.postal_code).to.have.property('value', '');
            },

            invalid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be invalid').to.be.false;
              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.company.checkValidity(), 'company must be valid').to.be.true;
              expect(refs.phone.checkValidity(), 'phone must be valid').to.be.true;
              expect(refs.address1.checkValidity(), 'address1 must be invalid').to.be.false;
              expect(refs.address2.checkValidity(), 'address2 must be valid').to.be.true;
              expect(refs.city.checkValidity(), 'city must be valid').to.be.true;
              expect(refs.postal_code.checkValidity(), 'postal_code must be valid').to.be.true;

              expect(refs.action).to.have.attribute('disabled');
            },
          },

          dirty: {
            test({ refs, element }) {
              expect(refs.address_name).to.have.property('value', element.form.address_name);
              expect(refs.first_name).to.have.property('value', element.form.first_name);
              expect(refs.last_name).to.have.property('value', element.form.last_name);
              expect(refs.company).to.have.property('value', element.form.company);
              expect(refs.phone).to.have.property('value', element.form.phone);
              expect(refs.address1).to.have.property('value', element.form.address1);
              expect(refs.address2).to.have.property('value', element.form.address2);
              expect(refs.country).to.have.property('value', element.form.country);
              expect(refs.region).to.have.property('value', element.form.region);
              expect(refs.city).to.have.property('value', element.form.city);
              expect(refs.postal_code).to.have.property('value', element.form.postal_code);
            },

            invalid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be invalid').to.be.false;
              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.company.checkValidity(), 'company must be invalid').to.be.false;
              expect(refs.phone.checkValidity(), 'phone must be invalid').to.be.false;
              expect(refs.address1.checkValidity(), 'address1 must be invalid').to.be.false;
              expect(refs.address2.checkValidity(), 'address2 must be invalid').to.be.false;
              expect(refs.city.checkValidity(), 'city must be invalid').to.be.false;
              expect(refs.postal_code.checkValidity(), 'postal_code must be invalid').to.be.false;

              expect(refs.action).to.have.attribute('disabled');
            },

            valid({ refs, element }) {
              if (element.form.is_default_billing || element.form.is_default_shipping) {
                expect(refs.action).to.have.attribute('disabled');
              } else {
                expect(refs.action).not.to.have.attribute('disabled');
              }
            },
          },
        },

        snapshot: {
          test({ refs, element }) {
            expect(refs.address_name).to.have.property('value', element.form.address_name);
            expect(refs.first_name).to.have.property('value', element.form.first_name);
            expect(refs.last_name).to.have.property('value', element.form.last_name);
            expect(refs.company).to.have.property('value', element.form.company);
            expect(refs.phone).to.have.property('value', element.form.phone);
            expect(refs.address1).to.have.property('value', element.form.address1);
            expect(refs.address2).to.have.property('value', element.form.address2);
            expect(refs.country).to.have.property('value', element.form.country);
            expect(refs.region).to.have.property('value', element.form.region);
            expect(refs.city).to.have.property('value', element.form.city);
            expect(refs.postal_code).to.have.property('value', element.form.postal_code);

            if (element.form.is_default_billing || element.form.is_default_shipping) {
              expect(refs.action).to.have.attribute('disabled');
            } else {
              expect(refs.action).not.to.have.attribute('disabled');
            }
          },

          clean: {
            valid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be valid').to.be.true;
              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.company.checkValidity(), 'company must be valid').to.be.true;
              expect(refs.phone.checkValidity(), 'phone must be valid').to.be.true;
              expect(refs.address1.checkValidity(), 'address1 must be valid').to.be.true;
              expect(refs.address2.checkValidity(), 'address2 must be valid').to.be.true;
              expect(refs.city.checkValidity(), 'city must be valid').to.be.true;
              expect(refs.postal_code.checkValidity(), 'postal_code must be valid').to.be.true;
            },

            invalid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be invalid').to.be.false;
              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.company.checkValidity(), 'company must be invalid').to.be.false;
              expect(refs.phone.checkValidity(), 'phone must be invalid').to.be.false;
              expect(refs.address1.checkValidity(), 'address1 must be invalid').to.be.false;
              expect(refs.address2.checkValidity(), 'address2 must be invalid').to.be.false;
              expect(refs.city.checkValidity(), 'city must be invalid').to.be.false;
              expect(refs.postal_code.checkValidity(), 'postal_code must be invalid').to.be.false;
            },
          },

          dirty: {
            valid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be valid').to.be.true;
              expect(refs.first_name.checkValidity(), 'first_name must be valid').to.be.true;
              expect(refs.last_name.checkValidity(), 'last_name must be valid').to.be.true;
              expect(refs.company.checkValidity(), 'company must be valid').to.be.true;
              expect(refs.phone.checkValidity(), 'phone must be valid').to.be.true;
              expect(refs.address1.checkValidity(), 'address1 must be valid').to.be.true;
              expect(refs.address2.checkValidity(), 'address2 must be valid').to.be.true;
              expect(refs.city.checkValidity(), 'city must be valid').to.be.true;
              expect(refs.postal_code.checkValidity(), 'postal_code must be valid').to.be.true;
            },

            invalid({ refs }) {
              expect(refs.address_name.checkValidity(), 'address_name must be invalid').to.be.false;
              expect(refs.first_name.checkValidity(), 'first_name must be invalid').to.be.false;
              expect(refs.last_name.checkValidity(), 'last_name must be invalid').to.be.false;
              expect(refs.company.checkValidity(), 'company must be invalid').to.be.false;
              expect(refs.phone.checkValidity(), 'phone must be invalid').to.be.false;
              expect(refs.address1.checkValidity(), 'address1 must be invalid').to.be.false;
              expect(refs.address2.checkValidity(), 'address2 must be invalid').to.be.false;
              expect(refs.city.checkValidity(), 'city must be invalid').to.be.false;
              expect(refs.postal_code.checkValidity(), 'postal_code must be invalid').to.be.false;
            },
          },
        },
      },
    },
  });
});
