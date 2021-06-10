import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { CSSResult, CSSResultArray, css, html } from 'lit-element';
import * as icons from '../UserForm/icons';
import { Themeable } from '../../../mixins/themeable';

export class UsersTable extends Table<Data> {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        div[data-icon] svg {
          width: 18px;
          height: 18px;
        }
      `,
    ];
  }

  static nameColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="name" class="text-s text-secondary font-tnum"
        >${ctx.data.first_name} ${ctx.data.last_name}</span
      >
    `,
  };

  static emailColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="email" class="text-s text-secondary font-tnum">${ctx.data.email}</span>
    `,
  };

  static rolesColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="roles" class="flex">
        ${UsersTable.__roles.map(
          r => html`
            <div data-icon class="${ctx.data[r[0]] ? '' : 'text-disabled'} mx-xs">
              ${icons[r[1]]}
            </div>
          `
        )}
      </span>
    `,
  };

  static lastUpdatedColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="lastUpdated" class="text-s text-secondary font-tnum">
        <foxy-i18n key="date" options='{"value": "${ctx.data.date_modified}"}'></foxy-i18n>
        <foxy-i18n key="time" options='{"value": "${ctx.data.date_modified}"}'></foxy-i18n>
      </span>
    `,
  };

  static actionsColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="actions" class="text-s text-secondary font-tnum">delete</span>
    `,
  };

  private static get __roles() {
    return [
      ['is_merchant', 'merchant'],
      ['is_programmer', 'backend'],
      ['is_front_end', 'frontend'],
      ['is_designer', 'designer'],
    ];
  }

  columns = [
    UsersTable.nameColumn,
    UsersTable.emailColumn,
    UsersTable.rolesColumn,
    UsersTable.lastUpdatedColumn,
    UsersTable.actionsColumn,
  ];

  private static __ns = 'users-table';
}
