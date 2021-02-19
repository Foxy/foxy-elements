import './index';

import { expect, oneEvent } from '@open-wc/testing';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialogElement } from '../../private/ConfirmDialog';
import { Data } from './types';
import { DialogElement } from '../../private/Dialog';
import { PaymentMethodCardElement } from './PaymentMethodCardElement';
import { SpinnerElement } from '../Spinner/SpinnerElement';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  confirm: ConfirmDialogElement;
  wrapper: HTMLDivElement;
  spinner: SpinnerElement;
  delete: ButtonElement;
  expiry: HTMLDivElement;
  number: HTMLDivElement;
};

describe('PaymentMethodCard', () => {
  generateTests<Data, PaymentMethodCardElement, Refs>({
    parent: 'https://demo.foxycart.com/s/admin/customers/0/default_payment_method',
    href: 'https://demo.foxycart.com/s/admin/customers/0/default_payment_method',
    isEmptyValid: true,
    maxTestsPerState: 4,
    tag: 'foxy-payment-method-card',

    actions: {
      async delete({ refs, element }) {
        refs.delete.click();
        await element.updateComplete;
        await oneEvent(refs.confirm, 'show');
        refs.confirm.dispatchEvent(new DialogElement.SubmitEvent());
      },
    },

    assertions: {
      busy({ refs }) {
        expect(refs.spinner).to.be.visible;
        expect(refs.spinner).to.have.property('state', 'busy');
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.number, 'number must not be rendered').to.be.undefined;
        expect(refs.expiry, 'expiry must not be rendered').to.be.undefined;
        expect(refs.delete, 'delete button must not be rendered').to.be.undefined;
      },

      fail({ refs }) {
        expect(refs.spinner).to.be.visible;
        expect(refs.spinner).to.have.property('state', 'error');
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.number, 'number must not be rendered').to.be.undefined;
        expect(refs.expiry, 'expiry must not be rendered').to.be.undefined;
        expect(refs.delete, 'delete button must not be rendered').to.be.undefined;
      },

      idle: {
        template({ refs }) {
          expect(refs.spinner).to.be.visible;
          expect(refs.spinner).to.have.property('state', 'empty');
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.number, 'number must not be rendered').to.be.undefined;
          expect(refs.expiry, 'expiry must not be rendered').to.be.undefined;
          expect(refs.delete, 'delete button must not be rendered').to.be.undefined;
        },

        snapshot({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          expect(refs.delete, 'delete button must not be rendered').to.be.visible;

          if (element.data!.save_cc) {
            const number = element.data!.cc_number_masked;
            const expiry = `${element.data!.cc_exp_month} / ${element.data!.cc_exp_year}`;
            const last4Digits = number.substring(number.length - 4);

            expect(refs.spinner).to.be.undefined;
            expect(refs.number).to.contain.text(last4Digits);
            expect(refs.expiry).to.contain.text(expiry);
          } else {
            expect(refs.spinner).to.be.visible;
            expect(refs.spinner).to.have.property('state', 'empty');
            expect(refs.number, 'number must not be rendered').to.be.undefined;
            expect(refs.expiry, 'expiry must not be rendered').to.be.undefined;
          }
        },
      },
    },
  });
});
