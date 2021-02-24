import './index';

import { Data } from './types';
import { FormDialogElement } from '../FormDialog';
import { SubscriptionsTableElement } from './SubscriptionsTableElement';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { parseDuration } from '../../../utils/parse-duration';
import sinon from 'sinon';

type Refs = {
  subscriptionDialog: FormDialogElement;
  editButtons: HTMLButtonElement[];
  frequencies: HTMLSpanElement[];
  summaries: HTMLSpanElement[];
  statuses: HTMLSpanElement[];
  wrapper: HTMLDivElement;
  i18n: HTMLElement[];
};

const url =
  'https://demo.foxycart.com/s/admin/stores/0/subscriptions?customer_id=0&zoom=last_transaction,transaction_template:items';

describe('SubscriptionsTable', () => {
  generateTests<Data, SubscriptionsTableElement, Refs>({
    parent: url,
    href: url,
    tag: 'foxy-subscriptions-table',
    isEmptyValid: true,
    maxTestsPerState: 5,
    assertions: {
      busy({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'true');
        expect(refs.subscriptionDialog).to.have.attribute('parent', element.href);

        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      fail({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.subscriptionDialog).to.have.attribute('parent', element.href);

        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));
      },

      idle({ refs, element }) {
        expect(refs.wrapper).to.have.attribute('aria-busy', 'false');
        expect(refs.subscriptionDialog).to.have.attribute('parent', element.href);

        refs.i18n?.forEach(ref => expect(ref).to.have.attribute('lang', element.lang));

        element.data?._embedded['fx:subscriptions'].forEach((subscription, index) => {
          const editButtonRef = refs.editButtons[index];
          const frequencyRef = refs.frequencies[index];
          const summaryRef = refs.summaries[index];
          const statusRef = refs.statuses[index];

          {
            const transaction = subscription._embedded['fx:last_transaction'];
            const amount = `${transaction.total_order} ${transaction.currency_code}`;
            const opts = { ...parseDuration(subscription.frequency), amount };
            const key = `sub_pricing${subscription.frequency === '.5m' ? '_0_5m' : ''}`;

            expect(frequencyRef).to.have.deep.property('opts', opts);
            expect(frequencyRef).to.have.attribute('key', key);
          }

          {
            const items = subscription._embedded['fx:transaction_template']._embedded['fx:items'];
            const opts = {
              most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
              count: items.length,
            };

            expect(summaryRef).to.have.deep.property('opts', opts);
            expect(summaryRef).to.have.attribute('key', 'summary');
          }

          {
            let date: string;
            let key: string;

            if (subscription.first_failed_transaction_date) {
              date = subscription.first_failed_transaction_date;
              key = 'status_failed';
            } else if (subscription.end_date) {
              const dateAsObject = new Date(subscription.end_date);
              const hasEnded = dateAsObject.getTime() > Date.now();
              key = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
              date = subscription.end_date;
            } else {
              date = subscription.next_transaction_date;
              key = 'status_active';
            }

            expect(statusRef).to.have.deep.property('opts', { date });
            expect(statusRef).to.have.attribute('key', key);
          }

          {
            const showMethod = sinon.stub(refs.subscriptionDialog, 'show');
            editButtonRef.click();

            expect(showMethod).to.have.been.called;
            expect(refs.subscriptionDialog).to.have.property('href', subscription._links.self.href);

            showMethod.restore();
            refs.subscriptionDialog.href = '';
          }
        });
      },
    },
  });
});
