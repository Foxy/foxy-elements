import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'applied-coupon-code-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for managing applied coupon codes (`fx:applied_coupon_code`).
 *
 * @element foxy-applied-coupon-code-form
 * @since 1.21.0
 */
export class AppliedCouponCodeForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [({ code: v }) => !!v || 'code:v8n_required'];
  }

  private readonly __ignoreUsageLimitsOptions = [{ value: 'checked', label: 'option_checked' }];

  private readonly __getIgnoreUsageLimitsValue = () => {
    return this.form.ignore_usage_limits ? ['checked'] : [];
  };

  private readonly __setIgnoreUsageLimitsValue = (newValue: string[]) => {
    this.edit({ ignore_usage_limits: newValue.includes('checked') });
  };

  get readonlySelector(): BooleanSelector {
    return this.data ? new BooleanSelector('not=delete') : super.readonlySelector;
  }

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`timestamps ${super.hiddenSelector}`);
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-text-control
        helper-text=${this.t(this.data ? 'code.helper_text_existing' : 'code.helper_text_new')}
        infer="code"
      >
      </foxy-internal-text-control>

      ${this.data
        ? ''
        : html`
            <foxy-internal-checkbox-group-control
              infer="ignore-usage-limits"
              class="-my-xs"
              .getValue=${this.__getIgnoreUsageLimitsValue}
              .setValue=${this.__setIgnoreUsageLimitsValue}
              .options=${this.__ignoreUsageLimitsOptions}
            >
            </foxy-internal-checkbox-group-control>
          `}

      <!-- -->

      ${super.renderBody()}
    `;
  }
}
