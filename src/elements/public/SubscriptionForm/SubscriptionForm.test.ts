import './index';

import { Choice } from '../../private/Choice/Choice';
import { ChoiceChangeEvent } from '../../private/events';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { I18n } from '../I18n';
import { Spinner } from '../Spinner/Spinner';
import { SubscriptionForm } from './SubscriptionForm';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { parseFrequency } from '../../../utils/parse-frequency';

type Refs = {
  nextPaymentDate: DatePickerElement;
  spinnerWrapper: HTMLDivElement;
  frequency: Choice;
  endDate: DatePickerElement;
  spinner: Spinner;
  wrapper: HTMLDivElement;
  header: I18n;
  status: I18n;
  i18n: HTMLElement[];
};

describe('SubscriptionForm', () => {
  generateTests<Data, SubscriptionForm, Refs>({
    tag: 'foxy-subscription-form',
    href: 'https://demo.foxycart.com/s/admin/subscriptions/0?zoom=last_transaction',
    parent: 'https://demo.foxycart.com/s/admin/subscriptions',
    isEmptyValid: true,
    maxTestsPerState: 5,

    actions: {
      async edit({ refs, form }) {
        refs.frequency.value = form.frequency;
        refs.frequency.dispatchEvent(new ChoiceChangeEvent(form.frequency));

        refs.nextPaymentDate.value = form.next_transaction_date;
        refs.nextPaymentDate.dispatchEvent(new CustomEvent('change'));

        refs.endDate.value = form.end_date ?? '';
        refs.endDate.dispatchEvent(new CustomEvent('change'));
      },
    },

    assertions: {
      fail({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');

        expect(refs.spinnerWrapper).to.have.class('opacity-100');
        expect(refs.spinner).to.have.property('state', 'error');
        expect(refs.spinner).to.have.property('localName', 'foxy-spinner');

        expect(refs.endDate).to.have.attribute('disabled');
        expect(refs.frequency).to.have.attribute('disabled');
        expect(refs.nextPaymentDate).to.have.attribute('disabled');

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');

        expect(refs.spinnerWrapper).to.have.class('opacity-100');
        expect(refs.spinner).to.have.property('state', 'busy');
        expect(refs.spinner).to.have.property('localName', 'foxy-spinner');

        expect(refs.endDate).to.have.attribute('disabled');
        expect(refs.frequency).to.have.attribute('disabled');
        expect(refs.nextPaymentDate).to.have.attribute('disabled');

        refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      idle: {
        test({ refs, element }) {
          expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
          refs.i18n.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
        },

        template({ refs }) {
          expect(refs.spinnerWrapper).to.have.class('opacity-100');
          expect(refs.spinner).to.have.property('state', 'empty');
          expect(refs.spinner).to.have.property('localName', 'foxy-spinner');

          expect(refs.endDate).to.have.attribute('disabled');
          expect(refs.frequency).to.have.attribute('disabled');
          expect(refs.nextPaymentDate).to.have.attribute('disabled');
        },

        snapshot({ refs, element }) {
          const frequency = element.data!.frequency;
          const currency = element.data!._embedded['fx:last_transaction'].currency_code;
          const total = element.data!._embedded['fx:last_transaction'].total_order;

          expect(refs.spinnerWrapper).to.have.class('opacity-0');

          const frequencyValue = element.form.frequency ?? null;
          expect(refs.frequency).to.have.property('value', frequencyValue);
          expect(refs.frequency).to.have.property('disabled', !element.form.is_active);

          const nextPaymentDateValue = element.form.next_transaction_date?.substr(0, 10) ?? '';
          expect(refs.nextPaymentDate).to.have.property('value', nextPaymentDateValue);
          expect(refs.nextPaymentDate).not.to.have.attribute('disabled');

          const endDateValue = element.form.end_date?.substr(0, 10) ?? '';
          expect(refs.endDate).to.have.property('value', endDateValue);
          expect(refs.endDate).not.to.have.attribute('disabled');

          const headerKey = `price_${frequency === '.5m' ? 'twice_a_month' : 'recurring'}`;
          const headerOpts = { ...parseFrequency(frequency), amount: `${total} ${currency}` };

          expect(refs.header).to.have.attribute('key', headerKey);
          expect(refs.header).to.have.deep.property('opts', headerOpts);
          expect(refs.header).to.have.property('localName', 'foxy-i18n');

          let statusDate: string;
          let statusKey: string;

          if (element.data?.first_failed_transaction_date) {
            statusDate = element.data.first_failed_transaction_date;
            statusKey = 'subscription_failed';
          } else if (element.data?.end_date) {
            statusDate = element.data.end_date;
            const hasEnded = new Date(statusDate).getTime() > Date.now();
            statusKey = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
          } else {
            statusDate = element.data?.next_transaction_date ?? new Date().toISOString();
            statusKey = 'subscription_active';
          }

          expect(refs.status).to.have.attribute('key', statusKey);
          expect(refs.status).to.have.deep.property('opts', { date: statusDate });
          expect(refs.status).to.have.property('localName', 'foxy-i18n');
        },
      },
    },
  });
});
