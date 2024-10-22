import type { TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'template-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing templates (`fx:cart_include_template`, `fx:checkout_template`, `fx:cart_template`).
 *
 * @element foxy-template-form
 * @since 1.14.0
 */
export class TemplateForm extends Base<Data> {
  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.form.content_url) alwaysMatch.unshift('content');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get disabledSelector(): BooleanSelector {
    const alwaysMatch = [super.disabledSelector.toString()];

    if (!this.in({ idle: { snapshot: 'clean' } }) || !this.data.content_url) {
      alwaysMatch.unshift('source:cache');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    if (!this.data?.content_url) alwaysMatch.unshift('source:cache');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      ${this.renderTemplateOrSlot()}

      <foxy-internal-source-control infer="content"></foxy-internal-source-control>

      <foxy-internal-summary-control infer="source">
        <foxy-internal-text-control layout="summary-item" infer="content-url">
        </foxy-internal-text-control>

        <foxy-internal-template-form-async-action
          theme="tertiary-inline"
          infer="cache"
          href=${ifDefined(this.data?._links['fx:cache'].href)}
        >
        </foxy-internal-template-form-async-action>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPost(edits);

    if (edits.content_url) {
      const url = data._links['fx:cache'].href;
      const response = await new TemplateForm.API(this).fetch(url, { method: 'POST' });
      if (!response.ok) throw ['error:failed_to_cache'];
    }

    return await this._fetch(data._links.self.href);
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    const data = await super._sendPatch(edits);
    if (!edits.content_url) return data;

    const url = data._links['fx:cache'].href;
    const response = await new TemplateForm.API(this).fetch(url, { method: 'POST' });
    if (!response.ok) throw ['error:failed_to_cache'];

    return await this._fetch(data._links.self.href);
  }
}
