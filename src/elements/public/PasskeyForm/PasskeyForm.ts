import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-element';

const NS = 'passkey-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for viewing and deleting passkeys (`fx:passkey`).
 *
 * @element foxy-passkey-form
 * @since 1.24.0
 */
export class PasskeyForm extends Base<Data> {
  get readonlySelector(): BooleanSelector {
    return new BooleanSelector(
      `credential-id last-login-date last-login-ua ${super.readonlySelector.toString()}`
    );
  }

  renderBody(): TemplateResult {
    if (!this.data) {
      return html`
        <div class="p-xl flex items-center justify-center">
          <foxy-spinner infer="spinner" state="empty" layout="vertical"></foxy-spinner>
        </div>
      `;
    }

    return html`
      ${this.renderHeader()}
      <foxy-internal-text-control infer="credential-id"></foxy-internal-text-control>
      <foxy-internal-text-area-control infer="last-login-ua"></foxy-internal-text-area-control>
      ${super.renderBody()}
    `;
  }
}
