import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';

export class TransactionsTable extends Table<Data> {
  static priceColumn: Column<Data> = {
    cell: ctx => ctx.html`
      <foxy-i18n
        data-testclass="i18n totals"
        class="font-medium tracking-wide font-tnum"
        lang=${ctx.lang}
        key="price"
        ns=${TransactionsTable.__ns}
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
          lang=${ctx.lang}
          key="transaction_summary"
          ns=${TransactionsTable.__ns}
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
          class="px-s py-xs text-s font-medium tracking-wide rounded ${color}"
          lang=${ctx.lang}
          key=${`transaction_${status}`}
          ns=${TransactionsTable.__ns}
        >
        </foxy-i18n>
      `;
    },
  };

  static idColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => {
      return ctx.html`
        <span class="text-s text-secondary font-tnum" data-testclass="ids">
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
          class="text-s text-secondary font-tnum"
          lang=${ctx.lang}
          key="date"
          ns=${TransactionsTable.__ns}
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
          class="text-s font-medium tracking-wide text-primary rounded hover-underline focus-outline-none focus-shadow-outline"
          href=${ctx.data._links['fx:receipt'].href}
        >
          <foxy-i18n
            data-testclass="i18n"
            ns=${TransactionsTable.__ns}
            lang=${ctx.lang}
            key="receipt"
          >
          </foxy-i18n>
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
