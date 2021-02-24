import './index';

import { CustomersTableElement } from './CustomersTableElement';
import { Data } from './types';
import { FormDialogElement } from '../FormDialog';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import sinon from 'sinon';

type Refs = {
  customerDialog: FormDialogElement;
  previewButtons: HTMLButtonElement[];
  wrapper: HTMLDivElement;
  emails: HTMLSpanElement[];
  names: HTMLSpanElement[];
  i18n: HTMLElement[];
  ids: HTMLSpanElement[];
};

describe('CustomersTable', () => {
  generateTests<Data, CustomersTableElement, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    href: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    tag: 'foxy-customers-table',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.customerDialog).to.have.attribute('parent', element.href);

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      fail({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.customerDialog).to.have.attribute('parent', element.href);

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      test({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.customerDialog).to.have.attribute('parent', element.href);

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));

        element.data?._embedded['fx:customers'].forEach((customer, index) => {
          const previewButton = refs.previewButtons[index];
          const email = refs.emails[index];
          const name = refs.names[index];
          const id = refs.ids[index];

          expect(email).to.contain.text(customer.email);
          expect(name).to.contain.text(`${customer.first_name} ${customer.last_name}`);
          expect(id).to.contain.text(customer.id.toString());

          const showMethod = sinon.stub(refs.customerDialog, 'show');
          previewButton.click();

          expect(showMethod).to.have.been.called;
          expect(refs.customerDialog).to.have.property('href', customer._links.self.href);

          showMethod.restore();
          refs.customerDialog.href = '';
        });
      },
    },
  });
});
