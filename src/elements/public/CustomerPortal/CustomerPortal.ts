import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi/CustomerApi';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';

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
    return this.api.storage.getItem(API.SESSION)
      ? html`
          <foxy-internal-customer-portal-logged-in-view
            disabledcontrols=${this.disabledSelector.toString()}
            readonlycontrols=${this.readonlySelector.toString()}
            hiddencontrols=${this.hiddenSelector.toString()}
            customer=${this.base}
            group=${this.group}
            class="h-full"
            lang=${this.lang}
            href=${new URL('./customer_portal_settings', this.base).toString()}
            ns=${this.ns}
            .transactionsTableColumns=${this.transactionsTableColumns}
            .templates=${this.templates}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `
      : html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols=${this.disabledSelector.toString()}
            readonlycontrols=${this.readonlySelector.toString()}
            hiddencontrols=${this.hiddenSelector.toString()}
            group=${this.group}
            class="h-full"
            lang=${this.lang}
            ns=${this.ns}
            .templates=${this.templates}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `;
  }
}
