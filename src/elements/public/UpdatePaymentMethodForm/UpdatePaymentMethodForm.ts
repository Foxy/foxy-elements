import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Data } from './types';
import type { Rels } from '@foxy.io/sdk/backend';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'update-payment-method-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for updating customer's default payment method (`fx:default_payment_method`)
 * using the Payment Card Embed. Works only with existing payment methods.
 *
 * @slot template-set:before
 * @slot template-set:after
 *
 * @slot cc-token:before
 * @slot cc-token:after
 *
 * @element foxy-update-payment-method-form
 * @since 1.27.0
 */
export class UpdatePaymentMethodForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __templateSetOverride: { attribute: false },
      embedUrl: { attribute: 'embed-url' },
    };
  }

  /** Configuration URL for the Payment Card Embed. Required for the form to work. */
  embedUrl: string | null = null;

  private readonly __templateSetGetValue = () => this.__templateSetOverride;

  private readonly __templateSetSetValue = (value: string) => (this.__templateSetOverride = value);

  private __templateSetOverride: string | null = null;

  get hiddenSelector(): BooleanSelector {
    const formEmbedUrlParams = this.__formEmbedUrl?.searchParams;
    const alwaysMatch = [super.hiddenSelector.toString()];
    const isDemo = formEmbedUrlParams?.has('demo');

    if (this.__isPreConfigured || isDemo) alwaysMatch.unshift('template-set');
    if (!formEmbedUrlParams?.has('template_set_id') && !isDemo) {
      alwaysMatch.unshift('cc-token');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    if (!this.href) {
      return html`
        <div class="flex items-center justify-center p-xl">
          <foxy-spinner layout="vertical" infer="spinner" state="empty"></foxy-spinner>
        </div>
      `;
    }

    type StoreLoader = NucleonElement<Resource<Rels.Store>>;
    const formEmbedUrl = this.__formEmbedUrl;
    const storeLoader = this.renderRoot.querySelector<StoreLoader>('#store-loader');

    return html`
      <foxy-internal-resource-picker-control
        first=${ifDefined(storeLoader?.data?._links['fx:template_sets'].href)}
        infer="template-set"
        item="foxy-template-set-card"
        .getValue=${this.__templateSetGetValue}
        .setValue=${this.__templateSetSetValue}
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-update-payment-method-form-cc-token-control
        embed-url=${ifDefined(formEmbedUrl?.toString())}
        infer="cc-token"
      >
      </foxy-internal-update-payment-method-form-cc-token-control>

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.__storeLoaderHref)}
        id="store-loader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  updated(changes: Map<keyof UpdatePaymentMethodForm, unknown>): void {
    super.updated(changes);
    if (changes.has('embedUrl') || changes.has('href')) this.__templateSetOverride = null;
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      const response = await super._fetch<TResult>(...args);
      this.status = { key: 'cc_token_success' };
      return response;
    } catch (err) {
      let message;

      try {
        message = (await (err as Response).json())._embedded['fx:errors'][0].message;
      } catch {
        throw err;
      }

      if (message.includes('cc_token you provided is invalid')) {
        throw ['error:cc_token_invalid'];
      } else {
        throw err;
      }
    }
  }

  private get __storeLoaderHref() {
    const data = this.data;
    return data && 'fx:store' in data._links ? data._links['fx:store'].href : void 0;
  }

  private get __isPreConfigured() {
    try {
      return new URL(this.embedUrl ?? '').searchParams.has('template_set_id');
    } catch {
      return false;
    }
  }

  private get __formEmbedUrl() {
    try {
      const url = new URL(this.embedUrl ?? '');

      if (this.__templateSetOverride) {
        const id = getResourceId(this.__templateSetOverride);
        if (id !== null) url.searchParams.set('template_set_id', String(id));
      }

      return url;
    } catch {
      //
    }
  }
}
