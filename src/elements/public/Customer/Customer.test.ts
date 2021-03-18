import './index';

import { expect, waitUntil } from '@open-wc/testing';
import { generateTests, getRefs } from '../NucleonElement/generateTests';

import { AddressCard } from '../AddressCard';
import { AttributeCard } from '../AttributeCard';
import { ButtonElement } from '@vaadin/vaadin-button';
import { CollectionPages } from '../CollectionPages/CollectionPages';
import { Customer } from './Customer';
import { Data } from './types';
import { FormDialog } from '../FormDialog/FormDialog';
import { PaymentMethodCard } from '../PaymentMethodCard/PaymentMethodCard';
import { Spinner } from '../Spinner/index';
import { SubscriptionsTable } from '../SubscriptionsTable/SubscriptionsTable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import sinon from 'sinon';

type Refs = {
  subscriptionDialog: FormDialog;
  attributeDialog: FormDialog;
  attributeCards: AttributeCard[];
  addressDialog: FormDialog;
  customerDialog: FormDialog;
  subscriptions: SubscriptionsTable;
  paymentMethod: PaymentMethodCard;
  transactions: TransactionsTable;
  addAttribute: ButtonElement;
  addressCards: AddressCard[];
  topSpinner: Spinner;
  addAddress: ButtonElement;
  attributes: CollectionPages<any>;
  addresses: CollectionPages<any>;
  wrapper: HTMLDivElement;
  email: HTMLDivElement;
  name: HTMLDivElement;
  edit: ButtonElement;
  i18n: HTMLElement[];
};

describe('Customer', () => {
  generateTests<Data, Customer, Refs>({
    tag: 'foxy-customer',
    href: 'https://demo.foxycart.com/s/admin/customers/0',
    parent: 'https://demo.foxycart.com/s/admin/stores/0/customers',
    isEmptyValid: true,
    maxTestsPerState: 5,

    assertions: {
      busy({ refs, element }) {
        expect(refs.edit).to.have.attribute('disabled');
        expect(refs.addAddress).to.have.attribute('disabled');
        expect(refs.addAttribute).to.have.attribute('disabled');

        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.topSpinner).to.have.attribute('state', 'busy');

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      fail({ refs, element }) {
        expect(refs.edit).to.have.attribute('disabled');
        expect(refs.addAddress).to.have.attribute('disabled');
        expect(refs.addAttribute).to.have.attribute('disabled');

        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.topSpinner).to.have.attribute('state', 'error');

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      idle: {
        test({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');

          refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
        },

        async snapshot({ refs, element }) {
          expect(refs.topSpinner).to.be.undefined;

          expect(refs.edit).not.to.have.attribute('disabled');
          expect(refs.addAddress).not.to.have.attribute('disabled');
          expect(refs.addAttribute).not.to.have.attribute('disabled');

          const name = `${element.data!.first_name} ${element.data!.last_name}`;
          expect(refs.name).to.contain.text(name);

          const email = element.data!.email;
          expect(refs.email).to.contain.text(email);

          const customer = element.data!._links.self.href;
          expect(refs.customerDialog).to.have.attribute('href', customer);

          const addresses = element.data!._links['fx:customer_addresses'].href;
          expect(refs.addressDialog).to.have.attribute('parent', addresses);
          expect(refs.addresses).to.have.attribute('first', addresses);

          const attributes = element.data!._links['fx:attributes'].href;
          expect(refs.attributeDialog).to.have.attribute('parent', attributes);
          expect(refs.attributes).to.have.attribute('first', attributes);

          const paymentMethod = element.data!._links['fx:default_payment_method'].href;
          expect(refs.paymentMethod).to.have.attribute('href', paymentMethod);

          const transactionsZoom = '&zoom=items&limit=10';
          const transactions = element.data!._links['fx:transactions'].href + transactionsZoom;
          expect(refs.transactions).to.have.attribute('first', transactions);

          const subscriptionsZoom = '&zoom=last_transaction,transaction_template:items&limit=10';
          const subscriptions = element.data!._links['fx:subscriptions'].href + subscriptionsZoom;
          expect(refs.subscriptions).to.have.attribute('first', subscriptions);

          {
            const showMethod = sinon.stub(refs.customerDialog, 'show');
            refs.edit.click();
            expect(showMethod).to.have.been.called;
            showMethod.restore();
          }

          {
            const showMethod = sinon.stub(refs.addressDialog, 'show');
            refs.addAddress.click();

            expect(refs.addressDialog).to.have.property('href', '');
            expect(showMethod).to.have.been.called;

            showMethod.resetHistory();
            await waitUntil(() => !!getRefs<Refs>(element).addressCards?.[0]);
            Object.assign(refs, getRefs<Refs>(element));
            refs.addressCards[0].dispatchEvent(new CustomEvent('click', { bubbles: true }));

            expect(refs.addressDialog).to.have.property('href', refs.addressCards[0].href);
            expect(showMethod).to.have.been.called;

            showMethod.restore();
          }

          {
            const showMethod = sinon.stub(refs.attributeDialog, 'show');
            refs.addAttribute.click();

            expect(refs.attributeDialog).to.have.property('href', '');
            expect(showMethod).to.have.been.called;

            showMethod.resetHistory();
            await waitUntil(() => !!getRefs<Refs>(element).attributeCards?.[0]);
            Object.assign(refs, getRefs<Refs>(element));
            refs.attributeCards[0].dispatchEvent(new CustomEvent('click', { bubbles: true }));

            expect(refs.attributeDialog).to.have.property('href', refs.attributeCards[0].href);
            expect(showMethod).to.have.been.called;

            showMethod.restore();
          }
        },

        template({ refs }) {
          expect(refs.edit).to.have.attribute('disabled');
          expect(refs.addAddress).to.have.attribute('disabled');
          expect(refs.addAttribute).to.have.attribute('disabled');

          expect(refs.topSpinner).to.have.attribute('state', 'empty');
        },
      },
    },
  });
});
