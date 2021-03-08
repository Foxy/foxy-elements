import './index';

import { Data } from './types';
import { SubscriptionsTable } from './SubscriptionsTable';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { parseFrequency } from '../../../utils/parse-frequency';

type Refs = {
  frequencies: HTMLSpanElement[];
  summaries: HTMLSpanElement[];
  statuses: HTMLSpanElement[];
  wrapper: HTMLDivElement;
  links: HTMLAnchorElement[];
  i18n: HTMLElement[];
};

const url =
  'https://demo.foxycart.com/s/admin/stores/0/subscriptions?customer_id=0&zoom=last_transaction,transaction_template:items';

describe('SubscriptionsTable', () => {
  generateTests<Data, SubscriptionsTable, Refs>({
    parent: url,
    href: url,
    tag: 'foxy-subscriptions-table',
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

        element.data?._embedded['fx:subscriptions'].forEach((subscription, index) => {
          const frequencyRef = refs.frequencies[index];
          const summaryRef = refs.summaries[index];
          const statusRef = refs.statuses[index];
          const linkRef = refs.links[index];

          expect(linkRef).to.have.attribute('href', subscription._links['fx:sub_token_url'].href);

          {
            const transaction = subscription._embedded['fx:last_transaction'];
            const amount = `${transaction.total_order} ${transaction.currency_code}`;
            const options = { ...parseFrequency(subscription.frequency), amount };
            const key = `price_${subscription.frequency === '.5m' ? 'twice_a_month' : 'recurring'}`;

            expect(frequencyRef).to.have.deep.property('options', options);
            expect(frequencyRef).to.have.attribute('key', key);
          }

          {
            const items = subscription._embedded['fx:transaction_template']._embedded['fx:items'];
            const options = {
              most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
              count: items.length,
            };

            expect(summaryRef).to.have.deep.property('options', options);
            expect(summaryRef).to.have.attribute('key', 'transaction_summary');
          }

          {
            let date: string;
            let key: string;

            if (subscription.first_failed_transaction_date) {
              date = subscription.first_failed_transaction_date;
              key = 'subscription_failed';
            } else if (subscription.end_date) {
              const dateAsObject = new Date(subscription.end_date);
              const hasEnded = dateAsObject.getTime() > Date.now();
              key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
              date = subscription.end_date;
            } else {
              date = subscription.next_transaction_date;
              key = 'subscription_active';
            }

            expect(statusRef).to.have.deep.property('options', { date });
            expect(statusRef).to.have.attribute('key', key);
          }
        });
      },
    },
  });
});
