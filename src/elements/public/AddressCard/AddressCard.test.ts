import './index';

import { Data, Templates } from './types';

import { AddressCard } from './AddressCard';
import { I18n } from '../I18n/I18n';
import { Spinner } from '../Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { testHiddenSelector } from '../../../testgen/testHiddenSelector';
import { testSlot } from '../../../testgen/testSlot';
import { testTemplateFunction } from '../../../testgen/testTemplateFunction';
import { testTemplateMarkup } from '../../../testgen/testTemplateMarkup';

type Refs = {
  'address-name': I18n;
  'full-address': I18n;
  'full-name': I18n;
  'company': HTMLSpanElement;
  'phone': HTMLSpanElement;
  'wrapper': HTMLButtonElement;
  'spinner': Spinner;
};

describe('AddressCard', () => {
  generateTests<Data, AddressCard, Refs>({
    tag: 'foxy-address-card',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/addresses',
    maxTestsPerState: 5,
    isEmptyValid: true,
    assertions: {
      async test({ refs, element }) {
        expect(refs.spinner).to.have.attribute('ns', 'address-card');
        expect(refs.spinner).to.have.attribute('lang', element.lang);

        for (const control of ['address-name', 'full-name', 'full-address', 'company', 'phone']) {
          await testHiddenSelector(element, control);

          for (const position of ['before', 'after']) {
            const slot = [control, position].join(':') as keyof Templates;

            await testSlot(element, slot);
            await testTemplateMarkup(element, slot);
            await testTemplateFunction(element, slot);
          }
        }

        element.renderRoot.querySelectorAll<I18n>('foxy-i18n').forEach(i18nElement => {
          expect(i18nElement).to.have.attribute('lang', element.lang);
          expect(i18nElement).to.have.attribute('ns', element.ns);
        });
      },

      async busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.spinner).to.have.attribute('lang', element.lang);
        expect(refs.spinner).to.have.attribute('state', 'busy');
      },

      idle: {
        async snapshot({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner.parentElement).to.have.class('opacity-0');

          expect(refs['address-name']).to.have.attribute(
            'key',
            element.data!.is_default_billing
              ? 'default_billing_address'
              : element.data!.is_default_shipping
              ? 'default_shipping_address'
              : element.data!.address_name
          );

          expect(refs['full-address']).to.have.attribute('key', 'full_address');
          expect(refs['full-address']).to.have.attribute('options', JSON.stringify(element.data));

          expect(refs['full-name']).to.have.attribute('key', 'full_name');
          expect(refs['full-name']).to.have.attribute('options', JSON.stringify(element.data));

          expect(refs.company).to.have.text(element.data!.company || '–');
          expect(refs.phone).to.have.text(element.data!.phone || '–');
        },

        async template({ refs }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner).to.have.attribute('state', 'empty');
        },
      },

      async fail({ refs }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.spinner).to.have.attribute('state', 'error');
      },
    },
  });
});
