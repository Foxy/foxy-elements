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

const url = 'https://demo.api/hapi/subscriptions?customer_id=0&zoom=transaction_template:items';

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
            const cart = subscription._embedded['fx:transaction_template'];
            const amount = `${cart.total_order} ${cart.currency_code}`;
            const options = { ...parseFrequency(subscription.frequency), amount };
            const key = `price_${subscription.frequency === '.5m' ? 'twice_a_month' : 'recurring'}`;

            expect(frequencyRef).to.have.deep.property('options', options);
            expect(frequencyRef).to.have.attribute('key', key);
          }

          {
            const items = subscription._embedded['fx:transaction_template']._embedded['fx:items'];
            const options = {
              most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
              count_minus_one: items.length - 1,
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
              date = subscription.end_date;
              const hasEnded = new Date(subscription.end_date).getTime() > Date.now();
              key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
            } else if (!subscription.is_active) {
              date = '';
              key = 'subscription_inactive';
            } else if (new Date(subscription.start_date) > new Date()) {
              date = subscription.start_date;
              key = 'subscription_will_be_active';
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
