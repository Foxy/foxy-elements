import type { TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-element';

const NS = 'template-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing templates (`fx:cart_include_template`, `fx:checkout_template`, `fx:cart_template`).
 *
 * @element foxy-template-form
 * @since 1.14.0
 */
export class TemplateForm extends Base<Data> {
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
    if (!this.form.content_url || (this.data?.content ?? '') === this.form.content) {
      alwaysMatch.unshift('content-warning');
    }

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

      <foxy-internal-summary-control infer="content-warning" label="" helper-text="">
        <div class="flex gap-s bg-error-10 text-error leading-xs text-s">
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.25em; height: 1.25em; margin-top: 0.1em;" class="flex-shrink-0"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>`}
          <foxy-i18n infer="" key="text"></foxy-i18n>
        </div>
      </foxy-internal-summary-control>

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
