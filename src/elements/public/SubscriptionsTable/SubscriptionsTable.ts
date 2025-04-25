import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';
import { parseFrequency } from '../../../utils/parse-frequency';
import { getSubscriptionStatus } from '../../../utils/get-subscription-status';
import { classMap } from '../../../utils/class-map';

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
        count_minus_one: items.length - 1,
        first_item: items[0],
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
      const status = getSubscriptionStatus(data);
      const isRed = status === 'failed';
      const isGreen = status === 'next_payment' || !!status?.startsWith('will_end');
      const isNormal = !isGreen && !isRed;

      return html`
        <foxy-i18n
          data-testclass="i18n statuses"
          class=${classMap({
            'px-s py-xs text-m font-medium inline-block whitespace-normal rounded': true,
            'text-secondary bg-contrast-5': isNormal,
            'text-success bg-success-10': isGreen,
            'text-error bg-error-10': isRed,
          })}
          lang=${lang}
          key="status_${status}"
          ns=${ns}
          .options=${data}
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
