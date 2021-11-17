import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';
import { html } from 'lit-html';

export class CustomersTable extends TranslatableMixin(Table, 'customers-table')<Data> {
  static nameColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="names">${ctx.data.first_name} ${ctx.data.last_name}</span>
    `,
  };

  static idColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => html`
      <span role="presentation" class="text-m text-tertiary">ID&nbsp;</span>
      <span data-testclass="ids" class="text-m text-secondary font-tnum">${ctx.data.id}</span>
    `,
  };

  static dateColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => html`
      <span class="text-m text-secondary font-tnum">
        <foxy-i18n data-testclass="i18n" lang=${ctx.lang} key="date_created" ns=${ctx.ns}>
        </foxy-i18n>

        <foxy-i18n
          data-testclass="dates i18n"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
          .options=${{ value: ctx.data.date_created }}
        >
        </foxy-i18n>
      </span>
    `,
  };

  static emailColumn: Column<Data> = {
    cell: ctx =>
      html`<span data-testclass="emails" class="text-m text-secondary">${ctx.data.email}</span>`,
  };

  columns = [
    CustomersTable.nameColumn,
    CustomersTable.idColumn,
    CustomersTable.dateColumn,
    CustomersTable.emailColumn,
  ];

  private static __ns = 'customers-table';
}
