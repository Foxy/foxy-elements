import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table';
import { html } from 'lit-html';

export class CustomersTable extends Table<Data> {
  static nameColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="names">${ctx.data.first_name} ${ctx.data.last_name}</span>
    `,
  };

  static idColumn: Column<Data> = {
    cell: ctx => html`
      <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
      <span data-testclass="ids" class="text-s text-secondary font-tnum">${ctx.data.id}</span>
    `,
    hideBelow: 'md',
  };

  static dateColumn: Column<Data> = {
    cell: ctx => html`
      <span class="text-s text-secondary font-tnum">
        <foxy-i18n
          data-testclass="i18n"
          lang=${ctx.lang}
          key="date_created"
          ns=${CustomersTable.__ns}
        >
        </foxy-i18n>

        <foxy-i18n
          data-testclass="dates i18n"
          lang=${ctx.lang}
          key="date"
          ns=${CustomersTable.__ns}
          .options=${{ value: ctx.data.date_created }}
        >
        </foxy-i18n>
      </span>
    `,
    hideBelow: 'md',
  };

  static emailColumn: Column<Data> = {
    cell: ctx =>
      html`<span data-testclass="emails" class="text-s text-secondary">${ctx.data.email}</span>`,
  };

  columns = [
    CustomersTable.nameColumn,
    CustomersTable.idColumn,
    CustomersTable.dateColumn,
    CustomersTable.emailColumn,
  ];

  private static __ns = 'customers-table';
}
