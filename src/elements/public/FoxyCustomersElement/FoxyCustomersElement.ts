import '@polymer/iron-icon';
import '@polymer/iron-icons/iron-icons';

import type * as FoxySDK from '@foxy.io/sdk';

import { I18N, LoadingScreen, Page } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { CollectionTable } from '../../private/CollectionTable/CollectionTable';
import { CustomerDialog } from './private/CustomerDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';

type Customers = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customers, undefined>;

export class FoxyCustomersElement extends CollectionTable<Customers> {
  public static readonly defaultNodeName = 'foxy-customers';

  public static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'x-customer-dialog': CustomerDialog,
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
        ns=${this.ns}
        lang=${this.lang}
        header="customer"
        id="customer-dialog"
        closable
      >
      </x-customer-dialog>

      <x-page class="leading-m">
        <x-i18n slot="title" key="title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
        <x-i18n slot="subtitle" key="subtitle" .ns=${this.ns} .lang=${this.lang}></x-i18n>

        <div>
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
        </div>
      </x-page>
    `;
  }

  private get __customerDialog(): CustomerDialog {
    return this.renderRoot.querySelector('#customer-dialog') as CustomerDialog;
  }
}
