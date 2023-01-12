import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'applied-coupon-code-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element displaying an applied coupon code.
 *
 * @element foxy-applied-coupon-code-card
 * @since 1.21.0
 */
export class AppliedCouponCodeCard extends Base<Data> {
  private __couponLoaderId = 'couponLoader';

  renderBody(): TemplateResult {
    return html`
      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.data?._links['fx:coupon'].href)}
        id=${this.__couponLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${super.renderBody({
        title: data => html`${data.code}`,
        subtitle: () => html`${this.__coupon?.name}`,
      })}
    `;
  }

  get isBodyReady(): boolean {
    return super.isBodyReady && !!this.__coupon;
  }

  private get __couponLoader() {
    type Loader = NucleonElement<Resource<Rels.Coupon>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__couponLoaderId}`);
  }

  private get __coupon() {
    return this.__couponLoader?.data;
  }
}
