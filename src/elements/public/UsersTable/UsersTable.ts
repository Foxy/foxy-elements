import { TemplateResult, html } from 'lit-element';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Column } from '../Table/types';
import { Data } from './types';
import { FormDialog } from '../FormDialog/FormDialog';
import { Table } from '../Table/Table';
import { roles } from '../UserForm/roles';

export class UsersTable extends Table<Data> {
  static nameColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="name" class="text-s font-medium">
        ${ctx.data.first_name} ${ctx.data.last_name}
      </span>
    `,
  };

  static emailColumn: Column<Data> = {
    hideBelow: 'md',
    cell: ctx => html`
      <span data-testclass="email" class="text-s text-secondary">${ctx.data.email}</span>
    `,
    hideBelow: 'md'
  };

  static rolesColumn: Column<Data> = {
    cell: ctx => {
      const props = [
        'is_merchant',
        'is_programmer',
        'is_front_end_developer',
        'is_designer',
      ] as const;

      return html`
        <div data-testclass="roles" class="flex space-x-s">
          ${props.map(
            property => html`
              <div
                class=${ctx.data[property] ? '' : 'text-disabled'}
                style="width: 1rem; height: 1rem;"
              >
                ${roles.find(role => role.property === property)!.icon}
              </div>
            `
          )}
        </div>
      `;
    },
  };

  static lastUpdatedColumn: Column<Data> = {
    hideBelow: 'lg',
    cell: ctx => html`
      <span data-testclass="lastUpdated" class="text-s text-secondary font-tnum">
        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.date_modified })}
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
        >
        </foxy-i18n>

        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.date_modified })}
          lang=${ctx.lang}
          key="time"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      </span>
    `,
    hideBelow: 'lg'
  };

  static actionsColumn: Column<Data> = {
    cell: ctx => html`
      <vaadin-button
        data-testclass="actions"
        theme="tertiary small"
        @click=${(evt: CustomEvent) => {
          const button = evt.target as ButtonElement;
          const root = button.getRootNode() as ShadowRoot;
          const form = root.querySelector('#form') as FormDialog;

          form.href = ctx.data._links.self.href;
          form.show(button);
        }}
      >
        <foxy-i18n lang=${ctx.lang} key="update" ns=${ctx.ns}></foxy-i18n>
      </vaadin-button>
    `,
  };

  columns = [
    UsersTable.nameColumn,
    UsersTable.emailColumn,
    UsersTable.rolesColumn,
    UsersTable.lastUpdatedColumn,
    UsersTable.actionsColumn,
  ];

  render(): TemplateResult {
    return html`
      <foxy-form-dialog
        parent=${this.href}
        form="foxy-user-form"
        lang=${this.lang}
        ns=${this.ns}
        id="form"
      >
      </foxy-form-dialog>

      ${super.render()}
    `;
  }
}
