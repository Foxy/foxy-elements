import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi/CustomerApi';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { ifDefined } from 'lit-html/directives/if-defined';

export class CustomerPortal extends TranslatableMixin(
  ThemeableMixin(CustomerApi),
  'customer-portal'
) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      transactionsTableColumns: { attribute: false },
      group: { type: String },
    };
  }

  /** Same as `.columns` property on `foxy-transactions-table`. Sets columns of that table. */
  transactionsTableColumns: TransactionsTable['columns'] = [
    TransactionsTable.priceColumn,
    TransactionsTable.summaryColumn,
    TransactionsTable.statusColumn,
    TransactionsTable.idColumn,
    TransactionsTable.dateColumn,
    TransactionsTable.receiptColumn,
  ];

  /** Rumour group. Elements in different groups will not share updates. Empty by default. */
  group = '';

  render(): TemplateResult {
    let href: string | undefined;

    try {
      href = new URL('./customer_portal_settings', this.base).toString();
    } catch {
      href = undefined;
    }

    return this.api.storage.getItem(API.SESSION)
      ? html`
          <foxy-internal-customer-portal-logged-in-view
            customer=${this.base}
            class="h-full"
            infer=""
            href=${ifDefined(href)}
            .transactionsTableColumns=${this.transactionsTableColumns}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `
      : html`
          <foxy-internal-customer-portal-logged-out-view
            class="h-full"
            infer=""
            href=${ifDefined(href)}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `;
  }
}
