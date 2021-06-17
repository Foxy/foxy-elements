import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';
import { parseFrequency } from '../../../utils/parse-frequency';

export class SubscriptionsTable extends TranslatableMixin(Table, 'subscriptions-table')<Data> {
  static priceColumn: Column<Data> = {
    cell: ctx => {
      const transaction = ctx.data._embedded['fx:last_transaction'];
      const amount = `${transaction.total_order} ${transaction.currency_code}`;

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n frequencies"
          class="font-semibold text-s font-tnum"
          lang=${ctx.lang}
          key="price_${ctx.data.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
          ns=${ctx.ns}
          .options=${{ ...parseFrequency(ctx.data.frequency), amount }}
        >
        </foxy-i18n>
      `;
    },
  };

  static summaryColumn: Column<Data> = {
    cell: ctx => {
      const items = ctx.data._embedded['fx:transaction_template']._embedded['fx:items'];
      const options = {
        count: items.length,
        most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
      };

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n summaries"
          class="text-s"
          lang=${ctx.lang}
          key="transaction_summary"
          ns=${ctx.ns}
          .options=${options}
        >
        </foxy-i18n>
      `;
    },
  };

  static statusColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => {
      let color: string;
      let date: string;
      let key: string;

      if (ctx.data.first_failed_transaction_date) {
        date = ctx.data.first_failed_transaction_date;
        key = 'subscription_failed';
        color = 'bg-error-10 text-error';
      } else if (ctx.data.end_date) {
        date = ctx.data.end_date;
        const dateAsObject = new Date(date);
        const hasEnded = dateAsObject.getTime() > Date.now();
        key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
        color = hasEnded ? 'bg-success-10 text-success' : 'bg-contrast-5 text-tertiary';
      } else {
        date = ctx.data.next_transaction_date;
        key = 'subscription_active';
        color = 'bg-success-10 text-success';
      }

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n statuses"
          class="px-s py-xs text-s font-semibold rounded ${color}"
          lang=${ctx.lang}
          key=${key}
          ns=${ctx.ns}
          .options=${{ date }}
        >
        </foxy-i18n>
      `;
    },
  };

  static subTokenURLColumn: Column<Data> = {
    cell: ctx => {
      return ctx.html`
        <a
          data-testclass="links"
          target="_blank"
          class="text-s font-semibold text-primary rounded hover-underline focus-outline-none focus-shadow-outline"
          href=${ctx.data._links['fx:sub_token_url'].href}
        >
          <foxy-i18n
            data-testclass="i18n"
            lang=${ctx.lang}
            key="update"
            ns=${ctx.ns}
          >
          </foxy-i18n>
        </a>
      `;
    },
  };

  columns = [
    SubscriptionsTable.priceColumn,
    SubscriptionsTable.summaryColumn,
    SubscriptionsTable.statusColumn,
    SubscriptionsTable.subTokenURLColumn,
  ];
}
