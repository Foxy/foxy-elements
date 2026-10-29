import './index';

import { Data } from './types';
import { SubscriptionsTable } from './SubscriptionsTable';
import { expect, fixture, html } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';
import { parseFrequency } from '../../../utils/parse-frequency';
import { getSubscriptionStatus } from '../../../utils/get-subscription-status';
import { getTestData } from '../../../testgen/getTestData';

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
              count_minus_one: items.length - 1,
              first_item: items[0],
              count: items.length,
            };

            expect(summaryRef).to.have.deep.property('options', options);
            expect(summaryRef).to.have.attribute('key', 'transaction_summary');
          }

          {
            expect(statusRef).to.have.deep.property('options', subscription);
            expect(statusRef).to.have.attribute(
              'key',
              `status_${getSubscriptionStatus(subscription)}`
            );
          }
        });
      },
    },
  });

  describe('current user scope', () => {
    const create = async () => {
      const element = new SubscriptionsTable();
      element.data = await getTestData<any>(
        './hapi/subscriptions?customer_id=0&zoom=transaction_template:items'
      );
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

    it('is read-only with subscriptions_read customers_read', async () => {
      const element = await create();
      element.currentUserScope = 'subscriptions_read customers_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;
      expect(element.hiddenSelector.matches('delete', true)).to.be.true;

      element.currentUserScope = 'subscriptions_write';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
    });

    it('renders rows without the cart when it is not zoomed', async () => {
      const data = await getTestData<any>('./hapi/subscriptions?customer_id=0');
      data._embedded['fx:subscriptions'].forEach((sub: any) => delete sub._embedded);
      const element = await fixture<SubscriptionsTable>(
        html`<foxy-subscriptions-table .data=${data}></foxy-subscriptions-table>`
      );

      await element.updateComplete;
      expect(element.renderRoot.querySelectorAll('[data-testclass~="links"]')).to.have.length(
        data._embedded['fx:subscriptions'].length
      );
    });
  });
});
