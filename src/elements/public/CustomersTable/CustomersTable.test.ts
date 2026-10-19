import './index';

import { CustomersTable } from './CustomersTable';
import { Data } from './types';
import { I18n } from '../I18n';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { getTestData } from '../../../testgen/getTestData';

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
    parent: 'https://demo.api/hapi/customers',
    href: 'https://demo.api/hapi/customers',
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

  describe('current user scope', () => {
    const create = async () => {
      const element = new CustomersTable();
      element.data = await getTestData<Data>('./hapi/customers');
      return element;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const element = await create();

      [null, 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only with customers_read transactions_read', async () => {
      const element = await create();
      element.currentUserScope = 'customers_read transactions_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
      expect(element.hiddenSelector.matches('delete', true)).to.be.true;

      element.currentUserScope = 'customers_write';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
    });
  });
});
