import type { Data, TransactionPageHrefGetter } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'coupon-code-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing coupon codes (`fx:coupon_code`).
 *
 * @element foxy-coupon-code-form
 * @since 1.15.0
 */
export class CouponCodeForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getTransactionPageHref: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => !v || v.length <= 50 || 'code:v8n_too_long',
      ({ code: v }) => !v?.includes(' ') || 'code:v8n_has_spaces',
    ];
  }

  getTransactionPageHref: TransactionPageHrefGetter | null = null;

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch: string[] = [super.hiddenSelector.toString()];
    if (!this.href) alwaysMatch.unshift('transactions');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    let transactions: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:coupon_code_transactions'].href ?? '');
      url.searchParams.set('zoom', 'items');
      transactions = url.toString();
    } catch {
      transactions = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-text-control infer="code"></foxy-internal-text-control>
      <foxy-internal-async-list-control
        first=${ifDefined(transactions)}
        infer="transactions"
        limit="5"
        item="foxy-transaction-card"
        .getPageHref=${this.getTransactionPageHref}
        hide-delete-button
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}
    `;
  }
}
