import { ConfigurableMixin, Renderer } from '../../../mixins/configurable';
import { Graph, Rels } from '@foxy.io/sdk/customer';
import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { FormDialog } from '../FormDialog/FormDialog';
import { FormRendererContext } from '../FormDialog/types';
import { ItemRenderer } from '../CollectionPage/types';
import { PageRenderer } from '../CollectionPages/types';
import { Resource } from '@foxy.io/sdk/core';
import { SubscriptionForm } from '../SubscriptionForm/SubscriptionForm';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(LitElement)));

export class InternalCustomerPortalSubscriptions extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      settings: { attribute: false },
      customer: { attribute: false },
      group: { type: String },
    };
  }

  settings: Resource<Rels.CustomerPortalSettings> | null = null;

  customer: Resource<Graph> | null = null;

  group = '';

  private readonly __renderFormHeaderActionsUpdate: Renderer<SubscriptionForm> = (html, host) => {
    let billingLink = '';

    if (host.in({ idle: 'snapshot' })) {
      const link = host.data._links['fx:sub_token_url'].href;
      const updateBillingURL = new URL(link);

      updateBillingURL.searchParams.set('cart', 'checkout');
      updateBillingURL.searchParams.set('sub_restart', 'auto');
      billingLink = updateBillingURL.toString();
    }

    return html`
      ${host.renderTemplateOrSlot('header:actions:update:before')}

      <foxy-internal-customer-portal-link
        data-testid="header:actions:update"
        href=${billingLink}
        icon="icons:credit-card"
      >
        <foxy-i18n lang=${host.lang} key="update_billing" ns=${host.ns}></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('header:actions:update:after')}
    `;
  };

  private readonly __renderFormHeaderActionsEnd: Renderer<SubscriptionForm> = (html, host) => {
    let cancelLink = '';

    if (host.in({ idle: 'snapshot' })) {
      const cancelURL = new URL(host.data._links['fx:sub_token_url'].href);

      cancelURL.searchParams.set('sub_cancel', 'true');
      cancelLink = cancelURL.toString();
    }

    return html`
      ${host.renderTemplateOrSlot('header:actions:end:before')}

      <foxy-internal-customer-portal-link
        data-testid="header:actions:end"
        href=${cancelLink}
        icon="icons:block"
      >
        <foxy-i18n lang=${host.lang} key="end_subscription" ns=${host.ns}></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('header:actions:end:after')}
    `;
  };

  private readonly __renderFormHeaderActions: Renderer<SubscriptionForm> = (html, host) => {
    const isUpdateActionHidden = host.hiddenSelector.matches('header:actions:update');
    const isEndActionHidden = host.hiddenSelector.matches('header:actions:end');

    return html`
      <style>
        main {
          display: flex;
          justify-content: space-between;
          padding-top: var(--lumo-space-xs);
          margin-top: var(--lumo-space-s);
          border-top: 1px solid var(--lumo-contrast-10pct);
          color: var(--lumo-secondary-color);
        }
      </style>

      ${host.renderTemplateOrSlot('header:actions:before')}

      <main data-testid="header:actions">
        ${isUpdateActionHidden ? '' : this.__renderFormHeaderActionsUpdate(html, host)}
        ${isEndActionHidden ? '' : this.__renderFormHeaderActionsEnd(html, host)}
      </main>

      ${host.renderTemplateOrSlot('header:actions:after')}
    `;
  };

  private readonly __renderFormItemsActionsUpdate: Renderer<SubscriptionForm> = (html, host) => {
    // @ts-expect-error missing typedef in SDK
    const itemsLink = host.data?._links['fx:sub_modification_url']?.href ?? '';

    return html`
      ${host.renderTemplateOrSlot('items:actions:update:before')}

      <foxy-internal-customer-portal-link
        data-testid="items:actions:update"
        class="text-primary"
        href=${itemsLink}
      >
        <foxy-i18n lang=${host.lang} key="update_items" ns=${host.ns}></foxy-i18n>
      </foxy-internal-customer-portal-link>

      ${host.renderTemplateOrSlot('items:actions:update:after')}
    `;
  };

  private readonly __renderForm = (ctx: FormRendererContext) => {
    const templates = { ...ctx.dialog.templates };
    const originalHeaderAfterRenderer = templates['header:after'];
    const originalItemsActionsAfterRenderer = templates['items:actions:after'];

    templates['header:after'] = (html, host) => {
      const actionsHidden = host.hiddenSelector.matches('header:actions', true);
      return html`
        ${actionsHidden ? '' : this.__renderFormHeaderActions(html, host)}
        ${originalHeaderAfterRenderer?.(html, host)}
      `;
    };

    templates['items:actions:after'] = (html, host) => {
      const hasUpdateLink = !!host.data?._links['fx:sub_modification_url'];
      const isUpdateHidden = host.hiddenSelector.matches('items:actions:update', true);
      const isUpdateRendered = hasUpdateLink && !isUpdateHidden;

      return html`
        ${isUpdateRendered ? this.__renderFormItemsActionsUpdate(html, host) : ''}
        ${originalItemsActionsAfterRenderer?.(html, host)}
      `;
    };

    return html`
      <foxy-subscription-form
        disabledcontrols=${ctx.dialog.disabledControls.toString()}
        readonlycontrols=${ctx.dialog.readonlyControls.toString()}
        hiddencontrols=${ctx.dialog.hiddenControls.toString()}
        settings=${JSON.stringify(this.settings)}
        parent=${ctx.dialog.parent}
        group=${ctx.dialog.group}
        lang=${ctx.dialog.lang}
        href=${ctx.dialog.href}
        ns=${ctx.dialog.ns}
        id="form"
        .templates=${templates}
        @update=${ctx.handleUpdate}
        @fetch=${ctx.handleFetch}
      >
      </foxy-subscription-form>
    `;
  };

  private readonly __renderPageItem: ItemRenderer = ({ html, ...ctx }) => {
    return html`
      <button
        class=${classMap({
          'block w-full border border-contrast-10 p-m rounded-t-l rounded-b-l': true,
          'focus-outline-none focus-border-primary': true,
          'hover-border-contrast-30': ctx.data !== null,
        })}
        ?disabled=${ctx.data === null}
        @click=${(evt: Event) => {
          const url = new URL(ctx.href);
          url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
          this.__subscriptionDialog.href = url.toString();
          this.__subscriptionDialog.show(evt.currentTarget as HTMLButtonElement);
        }}
      >
        <foxy-subscription-card
          parent=${ctx.parent}
          group=${ctx.group}
          lang=${ctx.lang}
          href=${ctx.href}
          ns="${ctx.ns} ${customElements.get('foxy-subscription-card')?.defaultNS ?? ''}"
          .templates=${ctx.templates}
        >
        </foxy-subscription-card>
      </button>
    `;
  };

  private readonly __renderPage: PageRenderer<any> = ({ html, ...ctx }) => {
    return html`
      <foxy-collection-page
        ns=${ctx.ns}
        href=${ctx.href}
        lang=${ctx.lang}
        group=${ctx.group}
        class="space-y-m"
        .item=${this.__renderPageItem}
        .templates=${ctx.templates}
      >
      </foxy-collection-page>
    `;
  };

  private readonly __renderHeader = () => {
    return html`
      ${this.renderTemplateOrSlot('header:before')}

      <foxy-i18n
        class="block text-m font-semibold"
        lang=${this.lang}
        key="subscription_plural"
        ns=${this.ns}
      >
      </foxy-i18n>

      ${this.renderTemplateOrSlot('header:after')}
    `;
  };

  private readonly __renderList = () => {
    const disabledSelector = this.disabledSelector.zoom('list');
    const readonlySelector = this.readonlySelector.zoom('list');
    const hiddenSelector = this.hiddenSelector.zoom('list');
    const extendedHiddenControlsArray = [hiddenSelector.zoom('form').toString(), 'end-date'];

    return html`
      ${this.renderTemplateOrSlot('list:before')}

      <foxy-form-dialog
        readonlycontrols=${readonlySelector.zoom('form').toString()}
        disabledcontrols=${disabledSelector.zoom('form').toString()}
        hiddencontrols=${extendedHiddenControlsArray.join(' ').trim()}
        header="update"
        parent=${ifDefined(this.customer?._links['fx:subscriptions'].href)}
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        id="subscription-dialog"
        .form=${this.__renderForm}
        .templates=${this.getNestedTemplates('list:form')}
      >
      </foxy-form-dialog>

      <foxy-collection-pages
        class="block space-y-m"
        first=${this.__activeSubscriptionsLink}
        group=${this.group}
        lang=${this.lang}
        ns=${this.ns}
        manual
        .page=${this.__renderPage}
        .templates=${this.getNestedTemplates('list:card')}
      >
      </foxy-collection-pages>

      ${this.renderTemplateOrSlot('list:after')}
    `;
  };

  render(): TemplateResult {
    return html`
      <div class="space-y-s" data-testid="subscriptions">
        ${this.hiddenSelector.matches('header', true) ? '' : this.__renderHeader()}
        ${this.hiddenSelector.matches('list', true) ? '' : this.__renderList()}
      </div>
    `;
  }

  private get __subscriptionDialog() {
    return this.renderRoot.querySelector('#subscription-dialog') as FormDialog;
  }

  private get __activeSubscriptionsLink() {
    try {
      const url = new URL(this.customer!._links['fx:subscriptions'].href);
      url.searchParams.set('zoom', 'last_transaction,transaction_template:items');
      return url.toString();
    } catch {
      return '';
    }
  }
}
