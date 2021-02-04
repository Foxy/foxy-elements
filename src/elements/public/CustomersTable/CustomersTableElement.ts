import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';

import type * as FoxySDK from '@foxy.io/sdk';

import { I18N, LoadingScreen, Page } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Customers = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customers, undefined>;

export class CustomersTableElement extends NucleonTableElement<Customers> {
  public static readonly defaultNodeName = 'foxy-customers-table';

  public static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'x-loading-screen': LoadingScreen,
      'x-page': Page,
      'x-i18n': I18N,
    };
  }

  public readonly rel = 'customers';

  public constructor() {
    super('customers');
  }

  public render(): TemplateResult {
    return html`
      <x-customer-dialog
        .href=${this.href}
        .ns=${this.ns}
        .lang=${this.lang}
        id="customer-dialog"
        header="edit"
      >
      </x-customer-dialog>

      ${super.render([
        {
          header: () => this._t('name').toString(),
          cell: customer => `${customer.first_name} ${customer.last_name}`,
        },
        {
          mdAndUp: true,
          header: () => this._t('id').toString(),
          cell: customer => html`
            <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
            <span class="text-s text-secondary font-tnum">${customer.id}</span>
          `,
        },
        {
          header: () => this._t('email').toString(),
          cell: customer => html`<span class="text-s text-secondary">${customer.email}</span>`,
        },
        {
          mdAndUp: true,
          header: () => this._t('actions').toString(),
          cell: customer =>
            html`
              <button
                class="rounded text-s font-medium tracking-wide text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                @click=${() => {
                  this.__customerDialog.href = customer._links.self.href;
                  this.__customerDialog.show();
                }}
              >
                <x-i18n ns=${this.ns} lang=${this.lang} key="preview"></x-i18n>
              </button>
            `,
        },
      ])}
    `;
  }

  private get __customerDialog(): any {
    return this.renderRoot.querySelector('#customer-dialog') as any;
  }
}
