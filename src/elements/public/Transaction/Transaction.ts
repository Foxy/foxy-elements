import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from './types';
import type { Rels } from '@foxy.io/sdk/backend';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
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
      localeCodes: { attribute: 'locale-codes' },
    };
  }

  /** URL of the `fx:hosted_payment_gateways` property helper resource. */
  hostedPaymentGatewaysHelper: string | null = null;

  /** URL of the `fx:payment_gateways` property helper resource. */
  paymentGatewaysHelper: string | null = null;

  /** Link to the `fx:locale_codes` property helper for currency formatting. */
  localeCodes: string | null = null;

  getSubscriptionPageHref: ((href: string) => string) | null = null;

  getCustomerPageHref: ((href: string) => string) | null = null;

  private readonly __webhooksBulkActions = [
    {
      name: 'refeed',
      onClick: async (selection: Resource<Rels.Webhook>[]) => {
        if (!this.data) return;

        const url = this.data._links['fx:send_webhooks'].href;
        const api = new Transaction.API(this);
        const response = await api.fetch(url, {
          method: 'POST',
          body: JSON.stringify({
            refeed_hooks: selection.map(hook => getResourceId(hook._links['self'].href)),
            event: 'refeed',
          }),
        });

        selection.forEach(hook => {
          Transaction.Rumour('').share({
            related: [
              ...selection.map(hook => hook._links['fx:logs'].href),
              ...selection.map(hook => hook._links['fx:statuses'].href),
            ],
            source: hook._links.self.href,
            data: hook,
          });
        });

        if (!response.ok) throw new Error(await response.text());
      },
    },
  ];

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [
      'billing-addresses',
      'datafeed:data-is-fed',
      'webhooks:dialog:url',
      super.readonlySelector,
    ];

    const isEditable = Boolean(this.data?._links['fx:void'] ?? this.data?._links['fx:refund']);
    if (!isEditable) alwaysMatch.push('items', 'attributes', 'custom-fields');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [
      'billing-addresses:dialog:delete',
      'billing-addresses:dialog:timestamps',
      'webhooks:dialog:header:copy-json',
      'webhooks:dialog:header:copy-id',
      'webhooks:dialog:timestamps',
      'webhooks:dialog:name',
      'webhooks:dialog:query',
      'webhooks:dialog:encryption-key',
      'webhooks:dialog:delete',
      super.readonlySelector,
    ];

    const type = this.data?.type;

    if (!this.data?._links['fx:subscription']) alwaysMatch.unshift('subscription');
    if (type === 'subscription_modification') alwaysMatch.unshift('actions');

    if (type === 'updateinfo') {
      alwaysMatch.unshift('not=customer,subscription,payments,custom-fields,attributes');
    }

    if (type === 'subscription_cancellation') {
      alwaysMatch.unshift('not=customer,subscription,custom-fields,attributes');
    }

    if (!this.__storeLoader?.data?.use_webhook) alwaysMatch.unshift('datafeed');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    const source = this.data?.source;
    const type = this.data?.type;

    let context = '';

    if (type === 'updateinfo') {
      if (!source || source?.startsWith('cit_')) {
        context = 'customer_changed_payment_method';
      } else if (source === 'mit_uoe') {
        context = 'admin_changed_payment_method_with_uoe';
      } else if (source === 'mit_api') {
        context = 'integration_changed_payment_method';
      } else {
        context = 'admin_changed_payment_method';
      }
    } else if (type === 'subscription_modification') {
      if (!source || source?.startsWith('cit_')) {
        context = 'customer_changed_subscription';
      } else if (source === 'mit_uoe') {
        context = 'admin_changed_subscription_with_uoe';
      } else if (source === 'mit_api') {
        context = 'integration_changed_subscription';
      } else {
        context = 'admin_changed_subscription';
      }
    } else if (type === 'subscription_renewal') {
      if (source === 'mit_recurring') {
        context = 'subscription_renewal_attempt';
      } else if (source === 'mit_recurring_reattempt_automated') {
        context = 'subscription_renewal_automated_reattempt';
      } else if (source === 'mit_recurring_reattempt_manual') {
        context = 'subscription_renewal_manual_reattempt';
      }
    } else if (type === 'subscription_cancellation') {
      if (source === 'cit_recurring_cancellation') {
        context = 'customer_canceled_subscription';
      } else if (source === 'mit_recurring_cancellation') {
        context = 'admin_canceled_subscription';
      }
    } else {
      if (this.data?._links['fx:subscription']) {
        if (source?.startsWith('cit_')) {
          context = 'customer_subscribed';
        } else if (source === 'mit_uoe') {
          context = 'admin_subscribed_with_uoe';
        } else if (source === 'mit_api') {
          context = 'integration_subscribed';
        }
      } else {
        if (source?.startsWith('cit_')) {
          context = 'customer_placed_order';
        } else if (source === 'mit_uoe') {
          context = 'admin_placed_order_with_uoe';
        } else if (source === 'mit_api') {
          context = 'integration_placed_order';
        }
      }
    }

    return {
      transaction_date: this.data?.transaction_date,
      ip_country: this.data?.ip_country,
      context,
    };
  }

  get headerSubtitleBadges(): { key: string }[] {
    const badges = super.headerSubtitleBadges;
    if (this.data?.is_test) badges.push({ key: 'test' });
    if (this.data?.hide_transaction) badges.push({ key: 'archived' });
    return badges;
  }

  get headerCopyIdValue(): string {
    return this.data?.display_id?.toString() ?? '';
  }

  renderHeaderActions(): TemplateResult {
    return html`
      <foxy-internal-transaction-actions-control infer="actions">
      </foxy-internal-transaction-actions-control>
    `;
  }

  renderBody(): TemplateResult {
    let shipmentsLink: string | undefined = undefined;
    let webhooksLink: string | undefined = undefined;
    let itemsLink: string | undefined = undefined;

    const alertStatuses = ['problem', 'pending_fraud_review', 'rejected', 'declined'];
    const hidden = this.hiddenSelector;

    if (this.data) {
      try {
        const shipmentsUrl = new URL(this.data._links['fx:shipments'].href);
        const webhooksUrl = new URL(this.__storeLoader?.data?._links['fx:webhooks'].href ?? '');
        const itemsUrl = new URL(this.data._links['fx:items'].href);

        shipmentsUrl.searchParams.set('zoom', 'items:item_category');
        webhooksUrl.searchParams.set('event_resource', 'transaction');
        itemsUrl.searchParams.set('zoom', 'item_options');

        shipmentsLink = shipmentsUrl.toString();
        webhooksLink = webhooksUrl.toString();
        itemsLink = itemsUrl.toString();
      } catch {
        //
      }
    }

    return html`
      ${this.renderHeader()}
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
          wide
          .related=${[this.href]}
          .itemProps=${{ 'locale-codes': this.localeCodes }}
          .formProps=${{
            'item-categories': this.__storeLoader?.data?._links['fx:item_categories'].href,
            'locale-codes': this.localeCodes,
            'store': this.data?._links['fx:store'].href,
          }}
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

      <foxy-internal-async-list-control
        infer="shipments"
        first=${ifDefined(shipmentsLink)}
        item="foxy-shipment-card"
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        infer="webhooks"
        first=${ifDefined(webhooksLink)}
        item="foxy-webhook-card"
        form="foxy-webhook-form"
        hide-create-button
        hide-delete-button
        alert
        .bulkActions=${this.__webhooksBulkActions}
        .itemProps=${{ 'resource-uri': this.href }}
        .formProps=${{ 'resource-uri': this.href }}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-summary-control infer="datafeed">
        <foxy-internal-switch-control infer="data-is-fed"></foxy-internal-switch-control>
        <foxy-internal-post-action-control
          infer="process-webhook"
          theme="tertiary-inline"
          href=${ifDefined(this.data?._links['fx:process_webhook']?.href)}
          @success=${() => this.refresh()}
        >
        </foxy-internal-post-action-control>
      </foxy-internal-summary-control>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id="storeLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>('#storeLoader');
  }
}
