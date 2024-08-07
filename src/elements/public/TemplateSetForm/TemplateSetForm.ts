import type { PropertyDeclarations } from 'lit-element';
import type { Data } from './types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

const NS = 'template-set-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating and editing template sets (`fx:template_set`).
 *
 * @element foxy-template-set-form
 * @since 1.21.0
 */
export class TemplateSetForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      paymentMethodSets: { attribute: 'payment-method-sets' },
      languageStrings: { attribute: 'language-strings' },
      localeCodes: { attribute: 'locale-codes' },
      languages: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ description: v }) => !!v || 'description:v8n_required',
      ({ description: v }) => (!!v && v.length <= 100) || 'description:v8n_too_long',
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => (!!v && v.length <= 50) || 'code:v8n_too_long',
      ({ language: v }) => !!v || 'language:v8n_required',
      ({ locale_code: v }) => !!v || 'locale_code:v8n_required',
    ];
  }

  /** URL of the store's `fx:payment_method_sets` collection (used to fill the relevant dropdown with options). */
  paymentMethodSets: string | null = null;

  /** URL of the `fx:language_strings` property helper (passed through to foxy-i18n-editor). */
  languageStrings: string | null = null;

  /** URL of the `fx:locale_codes` property helper (used to fill the relevant dropdown with options). */
  localeCodes: string | null = null;

  /** URL of the `fx:languages` property helper (used to fill the relevant dropdown with options). */
  languages: string | null = null;

  private readonly __localeCodesLoaderId = 'localeCodesLoader';

  private readonly __languagesLoaderId = 'languagesLoader';

  get headerSubtitleOptions(): Record<string, unknown> {
    return {
      ...super.headerSubtitleOptions,
      context: this.data?.code === 'DEFAULT' ? 'default' : '',
    };
  }

  get disabledSelector(): BooleanSelector {
    const alwaysDisabled: string[] = [];
    if (!this.__languagesLoader?.data) alwaysDisabled.push('language');
    if (!this.__localeCodesLoader?.data) alwaysDisabled.push('locale-code');
    return new BooleanSelector(`${alwaysDisabled.join(' ')} ${super.disabledSelector}`);
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysHidden: string[] = [];
    if (this.data?.code === 'DEFAULT') alwaysHidden.push('delete', 'code', 'description');
    return new BooleanSelector(`${alwaysHidden.join(' ')} ${super.hiddenSelector}`);
  }

  renderBody(): TemplateResult {
    const localeCodeEntries = Object.entries(this.__localeCodesLoader?.data?.values ?? {});
    const localeCodes = localeCodeEntries.map(([value, rawLabel]) => ({ value, rawLabel }));

    const languageEntries = Object.entries(this.__languagesLoader?.data?.values ?? {});
    const languages = languageEntries.map(([value, label]) => ({ value, label }));

    return html`
      ${this.renderHeader()}

      <div class="grid grid-cols-1 gap-m sm-grid-cols-2">
        <foxy-internal-text-control infer="description"></foxy-internal-text-control>

        <foxy-internal-text-control infer="code"></foxy-internal-text-control>

        <foxy-internal-select-control infer="language" .options=${languages}>
        </foxy-internal-select-control>

        <foxy-internal-select-control infer="locale-code" .options=${localeCodes}>
        </foxy-internal-select-control>
      </div>

      <foxy-internal-resource-picker-control
        infer="payment-method-set-uri"
        first=${this.paymentMethodSets}
        item="foxy-payments-api-payment-preset-card"
      >
      </foxy-internal-resource-picker-control>

      ${this.data &&
      this.languageStrings &&
      !this.hiddenSelector.matches('language-overrides', true)
        ? html`
            <div>
              ${this.renderTemplateOrSlot('language-overrides:before')}

              <foxy-i18n-editor
                language-overrides=${this.data._links['fx:language_overrides'].href}
                selected-language=${this.form.language}
                infer="language-overrides"
                href=${this.languageStrings}
              >
              </foxy-i18n-editor>

              ${this.renderTemplateOrSlot('language-overrides:after')}
            </div>
          `
        : ''}

      <!-- -->

      ${super.renderBody()}

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.languages ?? undefined)}
        id=${this.__languagesLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.localeCodes ?? undefined)}
        id=${this.__localeCodesLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __localeCodesLoader() {
    type Loader = NucleonElement<Resource<Rels.LocaleCodes>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__localeCodesLoaderId}`);
  }

  private get __languagesLoader() {
    type Loader = NucleonElement<Resource<Rels.Languages>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__languagesLoaderId}`);
  }
}
