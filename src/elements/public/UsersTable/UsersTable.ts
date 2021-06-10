import { Column } from '../Table/types';
import { Data } from './types';
import { Table } from '../Table/Table';
import { CSSResult, CSSResultArray, css, html } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
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
        <div data-icon class="${ctx.data.is_merchant ? '' : 'text-disabled'} mx-xs">
          ${icons.merchant}
        </div>
        <div data-icon class="${ctx.data.is_programmer ? '' : 'text-disabled'} mx-xs">
          ${icons.backend}
        </div>
        <div data-icon class="${ctx.data.is_front_end_developer ? '' : 'text-disabled'} mx-xs">
          ${icons.frontend}
        </div>
        <div data-icon class="${ctx.data.is_designer ? '' : 'text-disabled'} mx-xs">
          ${icons.designer}
        </div>
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

  columns = [
    UsersTable.nameColumn,
    UsersTable.emailColumn,
    UsersTable.rolesColumn,
    UsersTable.lastUpdatedColumn,
    UsersTable.actionsColumn,
  ];

  private static __ns = 'users-table';
}
