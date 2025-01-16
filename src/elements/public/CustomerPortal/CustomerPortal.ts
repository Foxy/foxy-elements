import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi/CustomerApi';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';
import { ifDefined } from 'lit-html/directives/if-defined';

export class CustomerPortal extends TranslatableMixin(
  ThemeableMixin(CustomerApi),
  'customer-portal'
) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      transactionsTableColumns: { attribute: false },
      skipPasswordReset: { type: Boolean, attribute: 'skip-password-reset' },
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

  #temporaryPassword: string | null = null;

  /** When set to true, portal won't display Password Reset screen if customer logs in with a temporary password. */
  skipPasswordReset = false;

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
      ? !this.skipPasswordReset && this.api.usesTemporaryPassword
        ? html`
            <foxy-internal-customer-portal-password-reset-view
              password-old=${ifDefined(this.#temporaryPassword ?? void 0)}
              infer="password-reset"
              href=${this.base}
              @update=${(evt: UpdateEvent) => {
                if (evt.detail?.result === UpdateEvent.UpdateResult.ResourceUpdated) {
                  this.api.usesTemporaryPassword = false;
                  this.#temporaryPassword = null;
                  this.requestUpdate();
                }
              }}
            >
            </foxy-internal-customer-portal-password-reset-view>
          `
        : html`
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
            @password=${(evt: CustomEvent<string | null>) => {
              this.#temporaryPassword = evt.detail;
            }}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `;
  }

  updated(changedProperties: Map<keyof this, unknown>): void {
    super.updated(changedProperties);
    const isLoggedIn = this.api.storage.getItem(API.SESSION) !== null;
    if (isLoggedIn && (this.skipPasswordReset || !this.api.usesTemporaryPassword)) {
      this.#temporaryPassword = null;
    }
  }
}
