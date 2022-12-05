import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'applied-coupon-code-form';
const Base = TranslatableMixin(InternalForm, NS);

export class AppliedCouponCodeForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [({ code: v }) => !!v || 'code:v8n_required'];
  }

  private __ignoreUsageLimitsOptions = [{ value: 'checked', label: 'option_checked' }];

  private __getIgnoreUsageLimitsValue = () => {
    return this.form.ignore_usage_limits ? ['checked'] : [];
  };

  private __setIgnoreUsageLimitsValue = (newValue: string[]) => {
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
