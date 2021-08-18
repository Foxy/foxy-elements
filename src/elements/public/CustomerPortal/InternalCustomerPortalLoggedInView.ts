import { ConfigurableMixin, Renderer } from '../../../mixins/configurable';
import { TemplateResult, html } from 'lit-html';

import { API } from '../NucleonElement/API';
import { Customer } from '../Customer/Customer';
import { Templates as CustomerTemplates } from '../Customer/types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/customer';
import { Resource } from '@foxy.io/sdk/core';
import { Templates } from './types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement)));
type Data = Resource<Rels.CustomerPortalSettings>;

export class InternalCustomerPortalLoggedInView extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      customer: { type: String },
      loggingOutState: { attribute: false },
      loggingOutStateResetTimeout: { attribute: false },
    };
  }

  templates: Templates = {};

  customer = '';

  loggingOutState: 'idle' | 'busy' | 'fail' = 'idle';

  loggingOutStateResetTimeout: NodeJS.Timeout | null = null;

  private readonly __renderHeaderActionsSignOut = () => {
    const scope = 'customer:header:actions:sign-out';
    const state = this.loggingOutState;
    const isCustomerLoaded = !!this.__customerElement?.in({ idle: 'snapshot' });
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

    return html`
      <div style="display: flex; margin-left: var(--lumo-space-m)">
        ${this.renderTemplateOrSlot(`${scope}:before`)}

        <vaadin-button
          data-testid="sign-out"
          aria-label=${this.t('sign_out').toString()}
          style="padding: var(--lumo-space-xs); margin: 0; border-radius: 100%; display: flex"
          theme="icon"
          ?disabled=${this.disabledSelector.matches(scope) || !isCustomerLoaded || state !== 'idle'}
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
                  ns="${this.ns} ${customElements.get('foxy-customer')?.defaultNS ?? ''}"
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
      >
      </foxy-internal-customer-portal-transactions>

      ${this.renderTemplateOrSlot(`${scope}:after`)}
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector.zoom('customer');
    const extendedhiddencontrolsArray = [
      hiddenSelector.toString(),
      'header:actions:edit:form:delete',
      'attributes',
      'transactions',
      'subscriptions',
      'addresses:actions:create',
      'payment-methods:list:card',
    ];

    const templates: CustomerTemplates = this.getNestedTemplates('customer');
    const originalHeaderActionsAfterTemplate = templates['header:actions:after'];
    const originalTimestampsAfterTemplate = templates['header:actions:edit:form:timestamps:after'];
    const originalDefaultTemplate = templates['default'];

    templates['header:actions:after'] = (html, host) => {
      const isSignOutHidden = host.hiddenSelector.matches('header:actions:sign-out', true);
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

    templates['header:actions:edit:form:timestamps:after'] = (html, host) => {
      const scope = 'change-password';

      return html`
        ${originalTimestampsAfterTemplate?.(html, host)}
        ${host.hiddenSelector.matches(scope, true)
          ? ''
          : html`
              ${host.renderTemplateOrSlot(`${scope}:before`)}

              <foxy-internal-customer-portal-change-password
                customer=${host.href}
                session="foxy://customer-api/session"
                style="margin-top: var(--lumo-space-l)"
                email=${host.data?.email ?? ''}
                lang=${host.lang}
                ns=${host.ns}
                ?disabled=${host.in('busy') || host.disabledSelector.matches(scope, true)}
              >
              </foxy-internal-customer-portal-change-password>

              ${host.renderTemplateOrSlot(`${scope}:after`)}
            `}
      `;
    };

    return html`
      <foxy-customer
        readonlycontrols=${this.readonlySelector.zoom('customer').toString()}
        disabledcontrols=${this.disabledSelector.zoom('customer').toString()}
        hiddencontrols=${extendedhiddencontrolsArray.join(' ').trim()}
        data-testid="customer"
        group=${this.group}
        href=${this.customer}
        lang=${this.lang}
        ns="${this.ns} ${customElements.get('foxy-customer')?.defaultNS ?? ''}"
        id="customer"
        .templates=${templates}
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
