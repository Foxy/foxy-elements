import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';
import { parseFrequency } from '../../../utils/parse-frequency';

export class SubscriptionsTable extends TranslatableMixin(Table, 'subscriptions-table')<Data> {
  static priceColumn: Column<Data> = {
    cell: ctx => {
      const cart = ctx.data._embedded['fx:transaction_template'];
      const amount = `${cart.total_order} ${cart.currency_code}`;

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n frequencies"
          class="font-medium text-m font-tnum"
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
        most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
        count_minus_one: items.length - 1,
        count: items.length,
      };

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n summaries"
          class="text-m"
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
    hideBelow: 'sm',
    cell: ({ ns, lang, data, html }) => {
      let color = 'bg-contrast-5 text-secondary';
      let date: string;
      let key: string;

      if (data.first_failed_transaction_date) {
        color = 'bg-error-10 text-error';
        date = data.first_failed_transaction_date;
        key = 'subscription_failed';
      } else if (data.end_date) {
        date = data.end_date;
        const hasEnded = new Date(data.end_date).getTime() > Date.now();
        key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
      } else if (!data.is_active) {
        date = '';
        key = 'subscription_inactive';
      } else if (new Date(data.start_date) > new Date()) {
        date = data.start_date;
        key = 'subscription_will_be_active';
      } else {
        color = 'bg-success-10 text-success';
        date = data.next_transaction_date;
        key = 'subscription_active';
      }

      return html`
        <foxy-i18n
          data-testclass="i18n statuses"
          class="px-s py-xs text-m font-medium block whitespace-normal rounded ${color}"
          lang=${lang}
          key=${key}
          ns=${ns}
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
          class="text-m font-medium text-primary rounded hover-underline focus-outline-none focus-shadow-outline"
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
