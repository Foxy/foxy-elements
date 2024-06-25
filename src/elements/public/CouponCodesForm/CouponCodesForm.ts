import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'coupon-codes-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for importing coupon codes (`fx:coupon_codes`).
 *
 * @slot coupon-codes:before - **new in v1.27.0**
 * @slot coupon-codes:after - **new in v1.27.0**
 *
 * @slot create:before - **new in v1.27.0**
 * @slot create:after - **new in v1.27.0**
 *
 * @element foxy-coupon-codes-form
 * @since 1.15.0
 */
export class CouponCodesForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [({ coupon_codes: v }) => (v && v.length > 0) || 'coupon-codes:v8n_required'];
  }

  templates: Templates = {};

  private readonly __couponCodesGetValue = () => {
    return this.form.coupon_codes?.map(value => ({ value })) ?? [];
  };

  private readonly __couponCodesSetValue = (newValue: Item[]) => {
    this.edit({
      coupon_codes: newValue
        .map(({ value }) => value.split(' ').map(v => v.trim()))
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i),
    });
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.href) alwaysMatch.push('coupon-codes');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['delete timestamps', super.hiddenSelector.toString()];
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-editable-list-control
        infer="coupon-codes"
        .getValue=${this.__couponCodesGetValue}
        .setValue=${this.__couponCodesSetValue}
      >
      </foxy-internal-editable-list-control>

      ${super.renderBody()}
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    const body = JSON.stringify(edits);
    const data = await this._fetch(this.parent, { body, method: 'POST' });
    this.status = { key: 'success' };
    return data;
  }
}
