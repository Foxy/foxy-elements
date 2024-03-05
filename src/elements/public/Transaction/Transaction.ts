import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'transaction';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Transaction summary page (`fx:transaction`).
 *
 * @element foxy-transaction
 * @since 1.17.0
 */
export class Transaction extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      hostedPaymentGatewaysHelper: { attribute: 'hosted-payment-gateways-helper' },
      paymentGatewaysHelper: { attribute: 'payment-gateways-helper' },
      getSubscriptionPageHref: { attribute: false },
      getCustomerPageHref: { attribute: false },
    };
  }

  /** URL of the `fx:hosted_payment_gateways` property helper resource. */
  hostedPaymentGatewaysHelper: string | null = null;

  /** URL of the `fx:payment_gateways` property helper resource. */
  paymentGatewaysHelper: string | null = null;

  getSubscriptionPageHref: ((href: string) => string) | null = null;

  getCustomerPageHref: ((href: string) => string) | null = null;

  get readonlySelector(): BooleanSelector {
    const isEditable = Boolean(this.data?._links['fx:void'] ?? this.data?._links['fx:refund']);
    return isEditable
      ? new BooleanSelector(`${super.readonlySelector} billing-addresses`)
      : new BooleanSelector(
          `${super.readonlySelector} billing-addresses items attributes custom-fields`
        );
  }

  get hiddenSelector(): BooleanSelector {
    const hidden = ['billing-addresses:dialog:delete billing-addresses:dialog:timestamps'];
    const type = this.data?.type;

    if (!this.data?._links['fx:subscription']) hidden.push('subscription');
    if (type === 'subscription_modification') hidden.push('actions');

    if (type === 'updateinfo') {
      hidden.push('not=customer,subscription,payments,custom-fields,attributes');
    }

    if (type === 'subscription_cancellation') {
      hidden.push('not=customer,subscription,custom-fields,attributes');
    }

    return new BooleanSelector(`${super.hiddenSelector} ${hidden.join(' ')}`.trim());
  }

  renderBody(): TemplateResult {
    let shipmentsLink: string | undefined = undefined;
    let subtitleKey = 'subtitle';
    let itemsLink: string | undefined = undefined;

    const alertStatuses = ['problem', 'pending_fraud_review', 'rejected', 'declined'];
    const hidden = this.hiddenSelector;
    const source = this.data?.source;
    const type = this.data?.type;

    if (type === 'updateinfo') {
      if (source === '' || source?.startsWith('cit_')) {
        subtitleKey = 'subtitle_customer_changed_payment_method';
      } else if (source === 'mit_uoe') {
        subtitleKey = 'subtitle_admin_changed_payment_method_with_uoe';
      } else if (source === 'mit_api') {
        subtitleKey = 'subtitle_integration_changed_payment_method';
      } else {
        subtitleKey = 'subtitle_admin_changed_payment_method';
      }
    } else if (type === 'subscription_modification') {
      if (source === '' || source?.startsWith('cit_')) {
        subtitleKey = 'subtitle_customer_changed_subscription';
      } else if (source === 'mit_uoe') {
        subtitleKey = 'subtitle_admin_changed_subscription_with_uoe';
      } else if (source === 'mit_api') {
        subtitleKey = 'subtitle_integration_changed_subscription';
      } else {
        subtitleKey = 'subtitle_admin_changed_subscription';
      }
    } else if (type === 'subscription_renewal') {
      if (source === 'mit_recurring') {
        subtitleKey = 'subtitle_subscription_renewal_attempt';
      } else if (source === 'mit_recurring_reattempt_automated') {
        subtitleKey = 'subtitle_subscription_renewal_automated_reattempt';
      } else if (source === 'mit_recurring_reattempt_manual') {
        subtitleKey = 'subtitle_subscription_renewal_manual_reattempt';
      }
    } else if (type === 'subscription_cancellation') {
      if (source === 'cit_recurring_cancellation') {
        subtitleKey = 'subtitle_customer_canceled_subscription';
      } else if (source === 'mit_recurring_cancellation') {
        subtitleKey = 'subtitle_admin_canceled_subscription';
      }
    } else {
      if (this.data?._links['fx:subscription']) {
        if (source?.startsWith('cit_')) {
          subtitleKey = 'subtitle_customer_subscribed';
        } else if (source === 'mit_uoe') {
          subtitleKey = 'subtitle_admin_subscribed_with_uoe';
        } else if (source === 'mit_api') {
          subtitleKey = 'subtitle_integration_subscribed';
        }
      } else {
        if (source?.startsWith('cit_')) {
          subtitleKey = 'subtitle_customer_placed_order';
        } else if (source === 'mit_uoe') {
          subtitleKey = 'subtitle_admin_placed_order_with_uoe';
        } else if (source === 'mit_api') {
          subtitleKey = 'subtitle_integration_placed_order';
        }
      }
    }

    if (this.data) {
      try {
        const shipmentsUrl = new URL(this.data._links['fx:shipments'].href);
        const itemsUrl = new URL(this.data._links['fx:items'].href);
        shipmentsUrl.searchParams.set('zoom', 'items:item_category');
        itemsUrl.searchParams.set('zoom', 'item_options');
        shipmentsLink = shipmentsUrl.toString();
        itemsLink = itemsUrl.toString();
      } catch {
        //
      }
    }

    return html`
      <h2>
        <div class="flex items-center gap-s leading-xs text-xxl font-medium break-all">
          <foxy-i18n infer="header" key="title" .options=${this.data}></foxy-i18n>
          <foxy-copy-to-clipboard
            infer="header"
            class="inline-block text-m"
            text=${this.data?.display_id}
          >
          </foxy-copy-to-clipboard>
        </div>

        <foxy-i18n
          class="block leading-xs text-l text-secondary"
          infer="header"
          key=${subtitleKey}
          .options=${{
            transaction_date: this.data?.transaction_date,
            ip_country: this.data?.ip_country,
          }}
        >
        </foxy-i18n>

        <foxy-internal-transaction-actions-control class="mt-xs" infer="actions">
        </foxy-internal-transaction-actions-control>
      </h2>

      ${alertStatuses.includes(this.data?.status ?? '')
        ? html`
            <p
              class="leading-xs text-body rounded bg-error-10 block"
              style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
            >
              <foxy-i18n infer="header" key="alert_status_${this.data?.status}"></foxy-i18n>
            </p>
          `
        : ''}

      <foxy-internal-transaction-customer-control infer="customer">
      </foxy-internal-transaction-customer-control>

      <div
        class="grid gap-s"
        ?hidden=${hidden.matches('items', true) && hidden.matches('summary', true)}
      >
        <foxy-internal-async-list-control
          infer="items"
          class="min-w-0"
          first=${ifDefined(itemsLink)}
          limit="10"
          item="foxy-item-card"
          form="foxy-item-form"
          alert
          .related=${[this.href]}
        >
        </foxy-internal-async-list-control>

        <foxy-internal-transaction-summary-control infer="summary" class="min-w-0">
        </foxy-internal-transaction-summary-control>
      </div>

      <foxy-internal-async-list-control
        infer="billing-addresses"
        first=${ifDefined(this.data?._links['fx:billing_addresses'].href)}
        item="foxy-billing-address-card"
        form="foxy-address-form"
        hide-create-button
        hide-delete-button
        alert
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="payments"
        first=${ifDefined(this.data?._links['fx:payments'].href)}
        item="foxy-payment-card"
        .itemProps=${{
          'hosted-payment-gateways-helper': this.hostedPaymentGatewaysHelper,
          'payment-gateways-helper': this.paymentGatewaysHelper,
        }}
      >
      </foxy-internal-async-list-control>

      <div
        class="grid gap-m sm-grid-cols-2"
        ?hidden=${hidden.matches('custom-fields', true) && hidden.matches('attributes', true)}
      >
        <foxy-internal-async-list-control
          infer="custom-fields"
          class="min-w-0"
          first=${ifDefined(this.data?._links['fx:custom_fields'].href)}
          limit="5"
          form="foxy-custom-field-form"
          item="foxy-custom-field-card"
          alert
        >
        </foxy-internal-async-list-control>

        <foxy-internal-async-list-control
          infer="attributes"
          class="min-w-0"
          first=${ifDefined(this.data?._links['fx:attributes'].href)}
          limit="5"
          form="foxy-attribute-form"
          item="foxy-attribute-card"
          alert
        >
        </foxy-internal-async-list-control>
      </div>

      <foxy-internal-async-list-control
        infer="shipments"
        first=${ifDefined(shipmentsLink)}
        item="foxy-shipment-card"
      >
      </foxy-internal-async-list-control>
    `;
  }
}
