import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'applied-coupon-code-card';
const Base = ResponsiveMixin(TranslatableMixin(InternalCard, NS));

/**
 * Card element displaying an applied coupon code.
 *
 * @element foxy-applied-coupon-code-card
 * @since 1.21.0
 */
export class AppliedCouponCodeCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.data?._links['fx:coupon'].href)}
        id="couponLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="leading-s text-m font-lumo sm-flex sm-justify-between">
        <div class="font-semibold min-w-0 truncate">${this.data?.code}&ZeroWidthSpace;</div>
        <div class="text-tertiary min-w-0 truncate">
          ${this.__couponLoader?.data?.name}&ZeroWidthSpace;
        </div>
      </div>
    `;
  }

  private get __couponLoader() {
    type Loader = NucleonElement<Resource<Rels.Coupon>>;
    return this.renderRoot.querySelector<Loader>('#couponLoader');
  }
}
