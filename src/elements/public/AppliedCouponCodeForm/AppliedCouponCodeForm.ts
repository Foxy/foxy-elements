import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { ScopeCollection } from '../../../utils/user-scope';

import { getItemScopeCollection } from '../../../utils/item-scope-collection';
import { parseUserScope } from '../../../utils/user-scope';
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

  get scopeCollection(): ScopeCollection | null {
    return getItemScopeCollection(this.data);
  }

  get readonlySelector(): BooleanSelector {
    // Keep the whole form read-only when the scope can't write the code's collection.
    const scope = parseUserScope(this.currentUserScope);
    const collection = this.scopeCollection;
    const isScopeReadonly =
      !!collection && !!scope?.canRead(collection) && !scope.canWrite(collection);
    if (isScopeReadonly) return super.readonlySelector;
    return this.data ? new BooleanSelector('not=delete') : super.readonlySelector;
  }

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`timestamps ${super.hiddenSelector}`);
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="" label="" helper-text="">
        <foxy-internal-text-control
          helper-text=${this.t(this.data ? 'code.helper_text_existing' : 'code.helper_text_new')}
          layout="summary-item"
          infer="code"
        >
        </foxy-internal-text-control>

        ${this.data
          ? ''
          : html`
              <foxy-internal-switch-control infer="ignore-usage-limits">
              </foxy-internal-switch-control>
            `}
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
