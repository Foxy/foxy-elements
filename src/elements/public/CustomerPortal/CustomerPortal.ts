import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '@foxy.io/sdk/customer';
import { CustomerApi } from '../CustomerApi/CustomerApi';
import { ThemeableMixin } from '../../../mixins/themeable';

export class CustomerPortal extends ThemeableMixin(CustomerApi) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      group: { type: String },
      lang: { type: String },
    };
  }

  /** Rumour group. Elements in different groups will not share updates. Empty by default. */
  group = '';

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang = '';

  render(): TemplateResult {
    return this.api.storage.getItem(API.SESSION)
      ? html`
          <foxy-internal-customer-portal-logged-in-view
            disabledcontrols=${this.readonlySelector.toString()}
            readonlycontrols=${this.readonlySelector.toString()}
            hiddencontrols=${this.hiddenSelector.toString()}
            customer=${this.base}
            group=${this.group}
            lang=${this.lang}
            href=${new URL('./customer_portal_settings', this.base).toString()}
            .templates=${this.templates}
          >
          </foxy-internal-customer-portal-logged-in-view>
        `
      : html`
          <foxy-internal-customer-portal-logged-out-view
            disabledcontrols=${this.readonlySelector.toString()}
            readonlycontrols=${this.readonlySelector.toString()}
            hiddencontrols=${this.hiddenSelector.toString()}
            group=${this.group}
            lang=${this.lang}
            .templates=${this.templates}
          >
          </foxy-internal-customer-portal-logged-out-view>
        `;
  }
}
