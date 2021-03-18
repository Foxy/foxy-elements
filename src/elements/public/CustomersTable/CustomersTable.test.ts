import './index';

import { CustomersTable } from './CustomersTable';
import { Data } from './types';
import { I18n } from '../I18n';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  wrapper: HTMLDivElement;
  emails: HTMLSpanElement[];
  names: HTMLSpanElement[];
  dates: I18n[];
  i18n: HTMLElement[];
  ids: HTMLSpanElement[];
};

describe('CustomersTable', () => {
  generateTests<Data, CustomersTable, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    href: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    tag: 'foxy-customers-table',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      fail({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      idle({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));

        element.data?._embedded['fx:customers'].forEach((customer, index) => {
          const emailRef = refs.emails[index];
          const nameRef = refs.names[index];
          const dateRef = refs.dates[index];
          const idRef = refs.ids[index];

          expect(emailRef).to.contain.text(customer.email);
          expect(nameRef).to.contain.text(`${customer.first_name} ${customer.last_name}`);

          expect(dateRef).to.have.deep.property('options', { value: customer.date_created });
          expect(dateRef).to.have.attribute('key', 'date');
          expect(dateRef).to.have.attribute('ns', 'customers-table');

          expect(idRef).to.contain.text(customer.id.toString());
        });
      },
    },
  });
});
