import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';

export class TransactionsTable extends TranslatableMixin(Table, 'transactions-table')<Data> {
  static priceColumn: Column<Data> = {
    cell: ctx => ctx.html`
      <foxy-i18n
        data-testclass="i18n totals"
        class="text-m font-semibold font-tnum"
        lang=${ctx.lang}
        key="price"
        ns=${ctx.ns}
        .options=${{ amount: `${ctx.data.total_order} ${ctx.data.currency_code}` }}
      >
      </foxy-i18n>
    `,
  };

  static summaryColumn: Column<Data> = {
    cell: ctx => {
      const items = ctx.data._embedded?.['fx:items'];
      if (!items) return '';

      const options = {
        most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
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
    hideBelow: 'md',
    cell: ctx => {
      const colors = {
        completed: 'bg-success-10 text-success',
        declined: 'bg-error-10 text-error',
        rejected: 'bg-error-10 text-error',
      };

      const status = ctx.data.status || 'completed';
      const defaultColor = 'bg-contrast-5 text-contrast';
      const color = status in colors ? colors[status as keyof typeof colors] : defaultColor;

      return ctx.html`
        <foxy-i18n
          data-testclass="i18n statuses"
          class="px-s py-xs text-m font-medium rounded ${color}"
          lang=${ctx.lang}
          key=${`transaction_${status}`}
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `;
    },
  };

  static idColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => {
      return ctx.html`
        <span class="text-m text-secondary font-tnum" data-testclass="ids">
          <span class="text-tertiary">ID</span> ${ctx.data.id}
        </span>
      `;
    },
  };

  static dateColumn: Column<Data> = {
    hideBelow: 'md' as const,
    cell: ctx => {
      return ctx.html`
        <foxy-i18n
          data-testclass="i18n dates"
          class="text-m text-secondary font-tnum"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
          .options=${{ value: ctx.data.transaction_date }}
        >
        </foxy-i18n>
      `;
    },
  };

  static receiptColumn: Column<Data> = {
    cell: ctx => {
      return ctx.html`
        <a
          data-testclass="links"
          target="_blank"
          class="text-m font-semibold text-primary rounded hover-underline focus-outline-none focus-shadow-outline"
          href=${ctx.data._links['fx:receipt'].href}
        >
          <foxy-i18n
            data-testclass="i18n"
            ns=${ctx.ns}
            lang=${ctx.lang}
            key="receipt"
          >
          </foxy-i18n>
          <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
        </a>
      `;
    },
  };

  columns = [
    TransactionsTable.priceColumn,
    TransactionsTable.summaryColumn,
    TransactionsTable.statusColumn,
    TransactionsTable.idColumn,
    TransactionsTable.dateColumn,
    TransactionsTable.receiptColumn,
  ];

  private static __ns = 'transactions-table';
}
