import type { Data } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'generate-codes-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for generating codes for coupons or gift cards (`fx:generate_codes`).
 *
 * @element foxy-generate-codes-form
 * @since 1.15.0
 */
export class GenerateCodesForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ prefix: p = '', length: l = 6 }) =>
        (l - p.length > 0 && l <= 50 && !p?.includes(' ')) || 'error:invalid_form',
    ];
  }

  private readonly __exampleGetValue = () => {
    const templates = [
      '1V3BJ3USJKSS1BYANMNBT7AJ06R6QQ8RB0VPPL03ATQVY186X2',
      'P4YNSW7NSSAY43PL4H7BKHDUVNAE9UR13FC0XAAJHDLZWW8AJC',
      '7DGT4Q91FV4KK095WLX1ML1HFNU6ZCGVBVPMGR7D3P52A9UFTB',
    ];

    const prefix = this.form.prefix ?? '';
    const length = (this.form.length ?? 6) - prefix.length;
    if (length > 0) return templates.map(t => `${prefix}${t.slice(0, length)}`).join('\n');
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = ['example', super.readonlySelector.toString()];
    if (this.href) alwaysMatch.push('length number-of-codes current-balance prefix');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    alwaysMatch.unshift('delete timestamps');
    if (this.href) alwaysMatch.push('example');
    if (this.errors.includes('error:invalid_form')) alwaysMatch.push('example');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-text-control infer="prefix"></foxy-internal-text-control>

      <div class="grid grid-cols-2 gap-m">
        <foxy-internal-integer-control infer="length" min="1"></foxy-internal-integer-control>
        <foxy-internal-integer-control infer="number-of-codes" min="1">
        </foxy-internal-integer-control>
      </div>

      <foxy-internal-number-control infer="current-balance" min="0"></foxy-internal-number-control>
      <foxy-internal-source-control infer="example" .getValue=${this.__exampleGetValue}>
      </foxy-internal-source-control>

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
