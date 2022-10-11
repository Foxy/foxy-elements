import type { ComputedElementProperties, NucleonV8N } from '../NucleonElement/types';
import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { PaymentsApiPaymentPresetForm } from '../PaymentsApiPaymentPresetForm/PaymentsApiPaymentPresetForm';
import type { TemplateConfigForm } from '../TemplateConfigForm/TemplateConfigForm';
import type { Nucleon, Resource } from '@foxy.io/sdk/core';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../FormDialog/FormDialog';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { getDefaultJSON } from '../TemplateConfigForm/defaults';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, css } from 'lit-element';
import { classMap } from '../../../utils/class-map';
import { spread } from '@open-wc/lit-helpers';

import get from 'lodash-es/get';

const NS = 'template-set-form';
const Base = TranslatableMixin(InternalForm, NS);

export class TemplateSetForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getFraudProtectionImageSrc: { attribute: false },
      getPaymentMethodImageSrc: { attribute: false },
      cartIncludeTemplates: { attribute: 'cart-include-templates' },
      paymentMethodSets: { attribute: 'payment-method-sets' },
      checkoutTemplates: { attribute: 'checkout-templates' },
      receiptTemplates: { attribute: 'receipt-templates' },
      templateConfigs: { attribute: 'template-configs' },
      emailTemplates: { attribute: 'email-templates' },
      cartTemplates: { attribute: 'cart-templates' },
      localeCodes: { attribute: 'locale-codes' },
      languages: {},
      countries: {},
      regions: {},
      __selectedTab: { attribute: false },
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

  getFraudProtectionImageSrc: ((type: string) => string) | null = null;

  getPaymentMethodImageSrc: ((type: string) => string) | null = null;

  cartIncludeTemplates: string | null = null;

  paymentMethodSets: string | null = null;

  checkoutTemplates: string | null = null;

  receiptTemplates: string | null = null;

  templateConfigs: string | null = null;

  emailTemplates: string | null = null;

  cartTemplates: string | null = null;

  localeCodes: string | null = null;

  languages: string | null = null;

  /** URI of the `fx:countries` hAPI resource. */
  countries: string | null = null;

  /** URI of the `fx:regions` hAPI resource. */
  regions: string | null = null;

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

    const localeCodesLoader = this.renderRoot.querySelector<LocaleCodesLoader>('#localeCodes');
    const localeCodes = localeCodesLoader?.data;
    const localeCodeEntries = Object.entries(localeCodes?.values ?? {});
    const localeCodeOptions = localeCodeEntries.map(([value, label]) => ({ value, label }));

    const languagesLoader = this.renderRoot.querySelector<LanguagesLoader>('#languages');
    const languages = languagesLoader?.data;
    const languageEntries = Object.entries(languages?.values ?? {});
    const languageOptions = languageEntries.map(([value, label]) => ({ value, label }));

    const constructor = this.constructor as typeof TemplateSetForm;

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

      <div class="grid grid-cols-1 gap-l">
        <div class="grid grid-cols-16rem gap-m">
          <foxy-internal-text-control infer="description"></foxy-internal-text-control>
          <foxy-internal-text-control infer="code"></foxy-internal-text-control>

          <foxy-internal-select-control infer="language" .options=${languageOptions}>
          </foxy-internal-select-control>

          <foxy-internal-select-control infer="locale-code" .options=${localeCodeOptions}>
          </foxy-internal-select-control>
        </div>

        ${this.data
          ? html`
              <foxy-template-config-form
                countries=${ifDefined(this.countries ?? void 0)}
                regions=${ifDefined(this.regions ?? void 0)}
                infer="config"
                href=${
                  // @ts-expect-error SDK types are incomplete
                  this.data._links['fx:template_config'].href
                }
                id="config"
                @update=${() => this.dispatchEvent(new constructor.UpdateEvent())}
              >
                ${this.__renderPaymentMethods()} ${this.__renderTemplates()}
              </foxy-template-config-form>
            `
          : ''}
      </div>

      ${super.renderBody()}
    `;
  }

  in<TStateValue extends Nucleon.State<Data, string>['value']>(
    stateValue: TStateValue
  ): this is this & ComputedElementProperties<Data, TStateValue> {
    const { paymentsApiPaymentPresetForm, templateConfigForm } = this;
    return (
      super.in(stateValue) ||
      !!paymentsApiPaymentPresetForm?.in(stateValue) ||
      !!templateConfigForm?.in(stateValue)
    );
  }

  submit(): void {
    this.paymentsApiPaymentPresetForm?.submit();
    this.templateConfigForm?.submit();
    super.submit();
  }

  undo(): void {
    this.paymentsApiPaymentPresetForm?.undo();
    this.templateConfigForm?.undo();
    super.undo();
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;
    const method = typeof args[0] === 'string' ? args[1]?.method : args[0].method;
    const fetch = super._fetch.bind(this);

    if (url === this.href && method === 'DELETE') {
      const data = await fetch(this.href);

      const sources = [
        data._links['fx:cart_include_template'].href,
        data._links['fx:cart_template'].href,
        data._links['fx:receipt_template'].href,
        data._links['fx:checkout_template'].href,
        data._links['fx:email_template'].href,

        // TODO remove the directive below once SDK is updated
        // @ts-expect-error SDK types are incomplete
        data._links['fx:payment_method_set'].href,

        // TODO remove the directive below once SDK is updated
        // @ts-expect-error SDK types are incomplete
        data._links['fx:template_config'].href,
      ];

      const originalResult = await fetch<TResult>(...args);
      const deletionResults = await Promise.allSettled(
        sources.map(source => fetch(source, { method: 'DELETE' }))
      );

      const rumour = (this.constructor as typeof TemplateSetForm).Rumour(this.group);

      queueMicrotask(() =>
        sources.forEach((source, index) => {
          const deletionResult = deletionResults[index];
          if (deletionResult.status === 'fulfilled') rumour.share({ data: null, source });
        })
      );

      return originalResult;
    }

    if (url === this.parent && method === 'POST') {
      const code = this.form.code;

      type Params = {
        collectionUrl: string;
        formEntry: string | undefined;
        body: Record<string, unknown>;
      };

      const createIfUndefined = async ({ formEntry, collectionUrl, body }: Params) => {
        if (typeof formEntry === 'string') return formEntry;

        const data = await fetch(collectionUrl, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const source = data._links.self.href;
        const rumour = (this.constructor as typeof TemplateSetForm).Rumour(this.group);

        rumour.share({ data, source, related: [collectionUrl] });
        return source;
      };

      const uris = await Promise.all([
        createIfUndefined({
          collectionUrl: this.cartIncludeTemplates ?? '',
          formEntry: this.form.cart_include_template_uri,
          body: { description: `Cart include template for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.cartTemplates ?? '',
          formEntry: this.form.cart_template_uri,
          body: { description: `Cart template for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.receiptTemplates ?? '',
          formEntry: this.form.receipt_template_uri,
          body: { description: `Web receipt template for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.checkoutTemplates ?? '',
          formEntry: this.form.checkout_template_uri,
          body: { description: `Checkout template for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.emailTemplates ?? '',
          formEntry: this.form.email_template_uri,
          body: { description: `Email receipt template for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.paymentMethodSets ?? '',
          formEntry: this.form.payment_method_set_uri,
          body: { description: `Payment method set for template set ${code}` },
        }),

        createIfUndefined({
          collectionUrl: this.templateConfigs ?? '',

          // TODO remove the directive below once SDK is updated
          // @ts-expect-error SDK types are incomplete
          formEntry: this.form.template_config_uri,

          body: {
            description: `Template config for template set ${code}`,
            json: JSON.stringify(getDefaultJSON()),
          },
        }),
      ]);

      const newBody = JSON.stringify({
        ...this.form,

        cart_include_template_uri: uris[0],
        cart_template_uri: uris[1],
        receipt_template_uri: uris[2],
        checkout_template_uri: uris[3],
        email_template_uri: uris[4],
        payment_method_set_uri: uris[5],
        template_config_uri: uris[6],
      });

      return fetch<TResult>(this.parent, { method: 'POST', body: newBody });
    }

    return fetch<TResult>(...args);
  }

  private __renderPaymentMethods() {
    const constructor = this.constructor as typeof TemplateSetForm;
    let paymentPresetUrl: string | undefined;

    try {
      const id = new URL(this.form.payment_method_set_uri ?? '').pathname.split('/').pop();
      paymentPresetUrl = `https://foxy-payments-api.element/payment_presets/${id}`;
    } catch {
      paymentPresetUrl = undefined;
    }

    return html`
      <foxy-payments-api-payment-preset-form
        infer="payment-method-set-uri"
        class="mt-l"
        href=${ifDefined(paymentPresetUrl)}
        slot="cards:after"
        .getFraudProtectionImageSrc=${this.getFraudProtectionImageSrc}
        .getPaymentMethodImageSrc=${this.getPaymentMethodImageSrc}
        @update=${() => this.dispatchEvent(new constructor.UpdateEvent())}
      >
      </foxy-payments-api-payment-preset-form>
    `;
  }

  private __renderTemplates() {
    return html`
      <div class="grid grid-cols-1 gap-s mt-l" slot="troubleshooting:after">
        <foxy-i18n class="text-s font-medium text-secondary" infer="" key="templates_title">
        </foxy-i18n>

        <div class="grid grid-cols-1 divide-y divide-contrast-5">
          ${['cart', 'cart_include', 'checkout', 'receipt', 'email'].map((type, index, array) => {
            const form = `foxy${type === 'email' ? '-email' : ''}-template-form`;
            const formKey = `${type}_template_uri`;
            const templateHref = get(this.form, formKey);

            const cardProps = spread({
              infer: formKey.replace(/_/g, '-'),
              href: templateHref,
            });

            return html`
              <vaadin-button
                theme="contrast"
                class=${classMap({
                  'rounded-none': true,
                  'rounded-t-l': index === 0,
                  'rounded-b-l': index === array.length - 1,
                })}
                @click=${(evt: CustomEvent) => {
                  const button = evt.currentTarget as HTMLElement;
                  const dialog = button.querySelector<FormDialog>('foxy-form-dialog');
                  dialog?.show(button);
                }}
              >
                <foxy-form-dialog
                  header="${formKey}_header"
                  infer="template-dialog"
                  form=${form}
                  href=${ifDefined(templateHref)}
                >
                </foxy-form-dialog>
                ${type === 'email'
                  ? html`<foxy-email-template-card ...=${cardProps}></foxy-email-template-card>`
                  : html`<foxy-template-card ...=${cardProps}></foxy-template-card>`}
              </vaadin-button>
            `;
          })}
        </div>

        <foxy-i18n class="text-xs text-secondary" infer="" key="templates_helper_text"> </foxy-i18n>
      </div>
    `;
  }
}
