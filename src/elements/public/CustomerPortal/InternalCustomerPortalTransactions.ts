import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Graph } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InferrableMixin } from '../../../mixins/inferrable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';

const NS = 'customer-portal';
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(InferrableMixin(LitElement), NS)));

export class InternalCustomerPortalTransactions extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customer: { attribute: false },
      columns: { attribute: false },
      group: { type: String },
    };
  }

  customer: Resource<Graph> | null = null;

  columns: TransactionsTable['columns'] = [];

  group = '';

  private readonly __renderHeader = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('header:before')}

        <foxy-i18n
          class="text-l font-medium"
          lang=${this.lang}
          key="transaction_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  };

  private readonly __renderList = () => {
    let first = '';

    if (this.customer) {
      const firstURL = new URL(this.customer._links['fx:transactions'].href);
      firstURL.searchParams.set('zoom', 'items');
      first = firstURL.toString();
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('list:before')}

        <foxy-collection-pages
          spinner="foxy-spinner"
          group=${this.group}
          first=${first}
          class="block divide-y divide-contrast-10 px-m border border-contrast-10 rounded-t-l rounded-b-l"
          page="foxy-transactions-table"
          lang=${this.lang}
          ns=${this.ns}
          manual
          .templates=${this.getNestedTemplates('table')}
          .props=${{ '.columns': this.columns }}
        >
        </foxy-collection-pages>

        ${this.renderTemplateOrSlot('list:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    return html`
      <div class="space-y-s" data-testid="transactions">
        ${this.hiddenSelector.matches('header') ? '' : this.__renderHeader()}
        ${this.hiddenSelector.matches('list') ? '' : this.__renderList()}
      </div>
    `;
  }
}
