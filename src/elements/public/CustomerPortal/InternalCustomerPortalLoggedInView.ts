import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import type { Renderer } from '../../../mixins/configurable';
import type { Customer } from '../Customer/Customer';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';
import { API } from '../NucleonElement/API';

const Base = TranslatableMixin(InternalForm);
type Data = Resource<Rels.CustomerPortalSettings>;

export class InternalCustomerPortalLoggedInView extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customer: { type: String },
      embedUrl: { attribute: 'embed-url' },
      loggingOutState: { attribute: false },
      transactionsTableColumns: { attribute: false },
      loggingOutStateResetTimeout: { attribute: false },
    };
  }

  customer = '';

  embedUrl: string | null = null;

  loggingOutState: 'idle' | 'busy' | 'fail' = 'idle';

  transactionsTableColumns: TransactionsTable['columns'] = [];

  loggingOutStateResetTimeout: NodeJS.Timeout | null = null;

  private readonly __renderHeaderActionsSignOut = () => {
    const scope = 'customer:header:actions:sign-out';
    const state = this.loggingOutState;

    const isDisabled =
      this.disabledSelector.matches(scope) ||
      !this.__customerElement?.in({ idle: 'snapshot' }) ||
      state !== 'idle';

    const handleClick = async () => {
      try {
        this.loggingOutState = 'busy';
        await new API(this).fetch('foxy://customer-api/session', { method: 'DELETE' });
        this.loggingOutState = 'idle';
      } catch {
        this.loggingOutState = 'fail';
        this.loggingOutStateResetTimeout = setTimeout(() => {
          this.loggingOutState = 'idle';
          this.loggingOutStateResetTimeout = null;
        }, 1000);
      }
    };

    const style = {
      'border-radius': '100%',
      'padding': 'var(--lumo-space-xs)',
      'display': 'flex',
      'margin': '0',
      'cursor': isDisabled ? 'default' : 'pointer',
    };

    return html`
      <div style="display: flex; margin-left: var(--lumo-space-m)">
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-button
          data-testid="sign-out"
          aria-label=${this.t('sign_out').toString()}
          style=${Object.entries(style).reduce((p, [k, v]) => `${p}${k}:${v};`, '')}
          theme="icon"
          ?disabled=${isDisabled}
          @click=${handleClick}
        >
          ${state === 'idle'
            ? html`<iron-icon icon="icons:exit-to-app"></iron-icon>`
            : html`
                <foxy-spinner
                  layout="no-label"
                  state=${state === 'fail' ? 'error' : 'busy'}
                  style="margin: auto"
                  lang=${this.lang}
                  ns=${[
                    this.ns,
                    customElements.get('foxy-customer')?.defaultNS ?? '',
                    customElements.get('foxy-spinner')?.defaultNS ?? '',
                  ].join(' ')}
                >
                </foxy-spinner>
              `}
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${scope}:after`)}
      </div>
    `;
  };

  private readonly __renderSubscriptions: Renderer<Customer> = (html, host) => {
    const scope = 'customer:subscriptions';

    return html`
      ${this.renderTemplateOrSlot(`${scope}:before`)}

      <foxy-internal-customer-portal-subscriptions
        readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
        disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(scope).toString()}
        group=${host.group}
        lang=${host.lang}
        ns=${host.ns}
        .templates=${this.getNestedTemplates(scope)}
        .settings=${this.data}
        .customer=${host.data}
      >
      </foxy-internal-customer-portal-subscriptions>

      ${this.renderTemplateOrSlot(`${scope}:after`)}
    `;
  };

  private readonly __renderTransactions: Renderer<Customer> = (html, host) => {
    const scope = 'customer:transactions';

    return html`
      ${this.renderTemplateOrSlot(`${scope}:before`)}

      <foxy-internal-customer-portal-transactions
        readonlycontrols=${this.readonlySelector.zoom(scope).toString()}
        disabledcontrols=${this.disabledSelector.zoom(scope).toString()}
        hiddencontrols=${this.hiddenSelector.zoom(scope).toString()}
        group=${host.group}
        lang=${host.lang}
        ns=${host.ns}
        .templates=${this.getNestedTemplates(scope)}
        .customer=${host.data}
        .columns=${this.transactionsTableColumns}
      >
      </foxy-internal-customer-portal-transactions>

      ${this.renderTemplateOrSlot(`${scope}:after`)}
    `;
  };

  renderBody(): TemplateResult {
    const hiddenSelector = this.hiddenSelector.zoom('customer');
    const customerHiddenControls = new BooleanSelector(
      [
        'attributes',
        'transactions',
        'subscriptions',
        'addresses:actions:create',
        'addresses:list:form:ignore-address-restrictions',
        'payment-methods:list:card:actions:update:form:template-set',
        'header:actions:edit:form:is-anonymous',
        'header:actions:edit:form:forgot-password',
        'header:actions:edit:form:create',
        'header:actions:edit:form:delete',
        hiddenSelector.toString(),
      ].join(' ')
    ).toString();

    const templates = this.getNestedTemplates('customer');
    const originalHeaderActionsAfterTemplate = templates['header:actions:after'];
    const originalDefaultTemplate = templates['default'];

    templates['header:actions:after'] = (html, host) => {
      const isSignOutHidden = hiddenSelector.matches('header:actions:sign-out', true);
      return html`
        <div style="display:flex">
          ${isSignOutHidden ? '' : this.__renderHeaderActionsSignOut()}
          ${originalHeaderActionsAfterTemplate?.(html, host)}
        </div>
      `;
    };

    templates['default'] = (html, host) => {
      const renderSubscriptions = this.__renderSubscriptions;
      const renderTransactions = this.__renderTransactions;

      return html`
        <style>
          .space-y-m > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(var(--lumo-space-m, 1rem) * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(var(--lumo-space-m, 1rem) * var(--tw-space-y-reverse));
          }
        </style>

        ${hiddenSelector.matches('default', true) ? '' : originalDefaultTemplate?.(html, host)}

        <div class="space-y-m">
          ${hiddenSelector.matches('subscriptions', true) ? '' : renderSubscriptions(html, host)}
          ${hiddenSelector.matches('transactions', true) ? '' : renderTransactions(html, host)}
        </div>
      `;
    };

    return html`
      <foxy-customer
        readonlycontrols=${this.readonlySelector.zoom('customer').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer').toString()}
        hiddencontrols=${customerHiddenControls}
        data-testid="customer"
        embed-url=${ifDefined(this.embedUrl ?? void 0)}
        group=${this.group}
        href=${this.customer}
        lang=${this.lang}
        ns="${this.ns} ${customElements.get('foxy-customer')?.defaultNS ?? ''}"
        id="customer"
        .templates=${templates}
        .settings=${this.data}
        @update=${() => this.requestUpdate()}
      >
      </foxy-customer>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.loggingOutStateResetTimeout) clearTimeout(this.loggingOutStateResetTimeout);
  }

  private get __customerElement() {
    return this.renderRoot.querySelector<Customer>('#customer');
  }
}
