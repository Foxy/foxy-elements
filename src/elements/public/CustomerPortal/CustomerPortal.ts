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
      embedUrl: { attribute: 'embed-url' },
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

  /**
   * URL of the Payment Card Embed for updating payment method.
   * When set, the payment method will be editable. Otherwise, the customers
   * will only be able to view and delete it.
   *
   * ```html
   * <foxy-customer-portal
   *  embed-url="https://embed.foxy.io/v1.html?template_set_id=123"
   *  base="https://demo.foxycart.com/s/customer/"
   * >
   * </foxy-customer-portal>
   * ```
   */
  embedUrl: string | null = null;

  /** Rumour group. Elements in different groups will not share updates. Empty by default. */
  group = '';

  render(): TemplateResult {
    let settingsHref: URL | undefined;

    try {
      settingsHref = new URL('./customer_portal_settings', this.base);
    } catch {
      settingsHref = undefined;
    }

    return this.api.storage.getItem(API.SESSION)
      ? html`
          <foxy-internal-customer-portal-logged-in-view
            embed-url=${ifDefined(this.embedUrl ?? void 0)}
            customer=${this.base}
            class="h-full"
            infer=""
            href=${ifDefined(settingsHref?.toString())}
            .transactionsTableColumns=${this.transactionsTableColumns}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `
      : html`
          <foxy-internal-customer-portal-logged-out-view
            class="h-full"
            infer=""
            href=${ifDefined(settingsHref?.toString())}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `;
  }
}
