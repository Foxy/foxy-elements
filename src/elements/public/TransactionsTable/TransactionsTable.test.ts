import './index';

import { Data } from './types';
import { I18n } from '../I18n';
import { TransactionsTable } from './TransactionsTable';
import { expect } from '@open-wc/testing';
import { generateTests } from '../NucleonElement/generateTests';

type Refs = {
  summaries: I18n[];
  statuses: I18n[];
  wrapper: HTMLDivElement;
  totals: I18n[];
  dates: I18n[];
  links: HTMLAnchorElement[];
  i18n: HTMLElement[];
  ids: HTMLSpanElement[];
};

describe('TransactionsTable', () => {
  generateTests<Data, TransactionsTable, Refs>({
    parent: 'https://demo.api/hapi/transactions?zoom=items',
    href: 'https://demo.api/hapi/transactions?zoom=items',
    tag: 'foxy-transactions-table',
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

        element.data?._embedded['fx:transactions'].forEach((transaction, index) => {
          const summaryRef = refs.summaries[index];
          const statusRef = refs.statuses[index];
          const totalRef = refs.totals[index];
          const dateRef = refs.dates[index];
          const linkRef = refs.links[index];
          const idRef = refs.ids[index];

          expect(statusRef).to.have.attribute('key', `transaction_${transaction.status}`);
          expect(dateRef).to.have.attribute('key', 'date');
          expect(dateRef).to.have.deep.property('options', { value: transaction.transaction_date });
          expect(linkRef).to.have.attribute('href', transaction._links['fx:receipt'].href);
          expect(idRef).to.contain.text(transaction.id.toString());

          {
            const items = transaction._embedded['fx:items'];
            const options = {
              count_minus_one: items.length - 1,
              first_item: items[0],
              count: items.length,
            };

            expect(summaryRef).to.have.attribute('key', 'transaction_summary');
            expect(summaryRef).to.have.deep.property('options', options);
          }

          {
            const amount = `${transaction.total_order} ${transaction.currency_code}`;

            expect(totalRef).to.have.attribute('key', 'price');
            expect(totalRef).to.have.deep.property('options', { amount });
          }
        });
      },
    },
  });
});
