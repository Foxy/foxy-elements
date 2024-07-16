import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'gift-card-codes-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for importing gift card codes (`fx:gift_card_codes`).
 *
 * @element foxy-gift-card-codes-form
 * @since 1.15.0
 */
export class GiftCardCodesForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [({ gift_card_codes: v }) => (v && v.length > 0) || 'gift-card-codes:v8n_required'];
  }

  private readonly __giftCardCodesGetValue = () => {
    return this.form.gift_card_codes?.map(value => ({ value })) ?? [];
  };

  private readonly __giftCardCodesSetValue = (newValue: Item[]) => {
    this.edit({
      gift_card_codes: newValue
        .map(({ value }) => value.split(' ').map(v => v.trim()))
        .flat()
        .filter((v, i, a) => a.indexOf(v) === i),
    });
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.href) alwaysMatch.push('gift-card-codes');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['delete timestamps', super.hiddenSelector.toString()];
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-editable-list-control
        infer="gift-card-codes"
        .getValue=${this.__giftCardCodesGetValue}
        .setValue=${this.__giftCardCodesSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-number-control infer="current-balance" min="0"></foxy-internal-number-control>

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
