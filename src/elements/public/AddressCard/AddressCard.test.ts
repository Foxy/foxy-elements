import './index';

import { AddressCard } from './AddressCard';
import { Data } from './types';
import { I18n } from '../I18n/I18n';
import { Spinner } from '../Spinner';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  fullAddress: I18n;
  wrapper: HTMLButtonElement;
  spinner: Spinner;
};

describe('AddressCard', () => {
  generateTests<Data, AddressCard, Refs>({
    tag: 'foxy-address-card',
    href: 'https://demo.foxycart.com/s/admin/customer_addresses/0',
    parent: 'https://demo.foxycart.com/s/admin/customers/0/addresses',
    maxTestsPerState: 5,
    isEmptyValid: true,
    assertions: {
      async busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.spinner).to.have.attribute('lang', element.lang);
        expect(refs.spinner).to.have.attribute('state', 'busy');
        expect(refs.fullAddress).to.be.undefined;
      },

      idle: {
        async snapshot({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner).to.be.undefined;

          expect(refs.fullAddress).to.have.property('ns', 'address-card');
          expect(refs.fullAddress).to.have.property('key', 'full_address');
          expect(refs.fullAddress).to.have.property('lang', element.lang);
          expect(refs.fullAddress).to.have.deep.property('options', element.form);
        },

        async template({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.spinner).to.have.attribute('lang', element.lang);
          expect(refs.spinner).to.have.attribute('state', 'empty');
          expect(refs.fullAddress).to.be.undefined;
        },
      },

      async fail({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.spinner).to.have.attribute('lang', element.lang);
        expect(refs.spinner).to.have.attribute('state', 'error');
        expect(refs.fullAddress).to.be.undefined;
      },
    },
  });
});
