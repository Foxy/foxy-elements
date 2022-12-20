import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { PaymentsApiPaymentPresetForm } from '../PaymentsApiPaymentPresetForm/PaymentsApiPaymentPresetForm';
import type { TemplateConfigForm } from '../TemplateConfigForm/TemplateConfigForm';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, css } from 'lit-element';

const NS = 'template-set-form';
const Base = TranslatableMixin(InternalForm, NS);

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

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        vaadin-button::part(label) {
          flex: 1;
          padding: 0;
        }

        .grid-cols-16rem {
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        }
      `,
    ];
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

  paymentMethodSets: string | null = null;

  languageStrings: string | null = 'https://demo.api/hapi/property_helpers/10';

  localeCodes: string | null = null;

  languages: string | null = null;

  get hiddenSelector(): BooleanSelector {
    const alwaysHidden = [
      'cart-template-uri:not=content',
      'cart-include-template-uri:not=content',
      'email-template-uri:not=content,template-language',
      'checkout-template-uri:not=content',
      'receipt-template-uri:not=content',
      'config:payment-method-set-uri:delete',
      'config:payment-method-set-uri:create',
      'config:payment-method-set-uri:timestamps',
      'config:payment-method-set-uri:description',
      'config:template-dialog:description',
      'config:template-dialog:delete',
    ];

    if (this.data?.code === 'DEFAULT') alwaysHidden.push('delete');

    return new BooleanSelector(`${alwaysHidden.join(' ')} ${super.hiddenSelector.toString()}`);
  }

  get readonlySelector(): BooleanSelector {
    const alwaysReadonly: string[] = [];
    if (this.data?.code === 'DEFAULT') alwaysReadonly.push('code', 'description');
    return new BooleanSelector(`${alwaysReadonly.join(' ')} ${super.readonlySelector.toString()}`);
  }

  get templateConfigForm(): TemplateConfigForm | null {
    return this.renderRoot.querySelector('foxy-template-config-form');
  }

  get paymentsApiPaymentPresetForm(): PaymentsApiPaymentPresetForm | null {
    return this.renderRoot.querySelector('foxy-payments-api-payment-preset-form');
  }

  renderBody(): TemplateResult {
    type LocaleCodesLoader = NucleonElement<Resource<Rels.LocaleCodes>>;
    type LanguagesLoader = NucleonElement<Resource<Rels.Languages>>;
    type PMSetLoader = NucleonElement<Resource<Rels.PaymentMethodSet>>;

    const localeCodesLoader = this.renderRoot.querySelector<LocaleCodesLoader>('#localeCodes');
    const localeCodes = localeCodesLoader?.data;
    const localeCodeEntries = Object.entries(localeCodes?.values ?? {});
    const localeCodeOptions = localeCodeEntries.map(([value, label]) => ({ value, label }));

    const languagesLoader = this.renderRoot.querySelector<LanguagesLoader>('#languages');
    const languages = languagesLoader?.data;
    const languageEntries = Object.entries(languages?.values ?? {});
    const languageOptions = languageEntries.map(([value, label]) => ({ value, label }));

    const paymentMethodSetLoader = this.renderRoot.querySelector<PMSetLoader>('#paymentMethodSet');
    const paymentMethodSet = paymentMethodSetLoader?.data;

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.languages ?? undefined)}
        id="languages"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.localeCodes ?? undefined)}
        id="localeCodes"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.payment_method_set_uri)}
        id="paymentMethodSet"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div class="grid grid-cols-16rem gap-m">
        <foxy-internal-text-control infer="description"></foxy-internal-text-control>
        <foxy-internal-text-control infer="code"></foxy-internal-text-control>

        <foxy-internal-select-control infer="language" .options=${languageOptions}>
        </foxy-internal-select-control>

        <foxy-internal-select-control infer="locale-code" .options=${localeCodeOptions}>
        </foxy-internal-select-control>
      </div>

      <foxy-internal-async-combo-box-control
        item-label-path="description"
        item-id-path="_links.self.href"
        infer="payment-method-set-uri"
        first=${this.paymentMethodSets}
        .selectedItem=${paymentMethodSet}
      >
      </foxy-internal-async-combo-box-control>

      ${this.data && this.languageStrings && !this.hiddenSelector.matches('i18n-editor', true)
        ? html`
            ${this.renderTemplateOrSlot('i18n-editor:before')}

            <foxy-i18n-editor
              language-overrides=${this.data._links['fx:language_overrides'].href}
              selected-language=${this.form.language}
              infer="i18n-editor"
              href=${this.languageStrings}
            >
            </foxy-i18n-editor>

            ${this.renderTemplateOrSlot('i18n-editor:after')}
          `
        : ''}

      <!-- -->

      ${super.renderBody()}
    `;
  }
}
