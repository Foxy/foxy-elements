import type { AvailablePaymentMethods, PaymentPreset } from '../PaymentsApi/api/types';
import type { Block, Data } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';

import has from 'lodash-es/has';
import get from 'lodash-es/get';
import set from 'lodash-es/set';

type PaymentMethod = {
  helper: AvailablePaymentMethods['values'][string];
  type: string;
};

const NS = 'payments-api-payment-method-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for the `fx:payment_method` resource of Payments API.
 *
 * _Payments API is a client-side virtual API layer built on top of hAPI
 * in an attempt to streamline access to stores' payment method settings
 * that is currently a bit quirky due to the legacy functionality. To use
 * this element with hAPI, wrap it into a foxy-payments-api node._
 *
 * @element foxy-payments-api-payment-method-form
 * @since 1.21.0
 */
export class PaymentsApiPaymentMethodForm extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 44 44'%3E%3Cpath fill='%23fff' d='m29.3 14 14-14H32.1l-14 14h11.2Zm2.7 9.9 12-12V.7L30.62 14.1A2 2 0 0 1 32 16v7.9ZM13.31 44h11.18L44 24.5V13.3l-12 12V28a2 2 0 0 1-2 2h-2.69l-14 14Zm-1.41 0H.7l14-14h11.2l-14 14Zm14 0h11.2l6.9-6.9V25.9L25.9 44Zm12.6 0H44v-5.5L38.5 44Z'/%3E%3Cpath fill='%23fff' d='M30 28H14v-6h16v6Zm0-10v-2H14v2h16ZM0 43.3l13.4-13.4A2 2 0 0 1 12 28v-7.9L0 32.12V43.3Z'/%3E%3Cpath fill='%23fff' d='M16.7 14H14c-1.11 0-1.99.89-1.99 2v2.7L0 30.7V19.52L19.52 0H30.7l-14 14Zm1.4-14H6.92L0 6.92V18.1L18.1 0ZM5.5 0H0v5.5L5.5 0Z'/%3E%3C/svg%3E";
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      paymentPreset: { attribute: 'payment-preset' },
      getImageSrc: { attribute: false },
      store: {},
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ description: v }) => !v || v.length <= 100 || 'description:v8n_too_long',
      ({ type: v }) => !!v || 'type:v8n_required',

      form => {
        const blocks = form.helper?.additional_fields?.blocks ?? [];
        let additionalFields: Record<string, unknown>;

        try {
          additionalFields = JSON.parse(form.additional_fields ?? '{}');
        } catch {
          additionalFields = {};
        }

        for (const block of blocks) {
          for (const field of block.fields) {
            if ('optional' in (field as Record<string, unknown>)) {
              if (!(field as Record<string, unknown>).optional) {
                if (!has(additionalFields, field.id)) {
                  if (field.type !== 'checkbox') {
                    return 'additional-fields:v8n_invalid';
                  }
                }
              }
            }
          }
        }

        return true;
      },
    ];
  }

  /** URL of the linked `fx:payment_preset` resource from the virtual Payments API. */
  paymentPreset: string | null = null;

  /** A function that returns a URL of a payment method icon based on the given type. */
  getImageSrc: ((type: string) => string) | null = null;

  /** URL of the linked `fx:store` resource. */
  store: string | null = null;

  private readonly __availablePaymentMethodsLoaderId = 'availablePaymentMethodsLoader';

  private readonly __paymentPresetLoaderId = 'paymentPresetLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __threeDSecureResponseGetValue = () => {
    return this.form.config_3d_secure?.endsWith('require_valid_response');
  };

  private readonly __threeDSecureResponseSetValue = (newValue: boolean) => {
    const postfix = newValue ? '_require_valid_response' : '';
    const config = this.form.config_3d_secure;
    const type = config?.startsWith('all_cards') ? 'all_cards' : 'maestro_only';

    this.edit({ config_3d_secure: `${type}${postfix}` as Data['config_3d_secure'] });
  };

  private readonly __threeDSecureToggleGetValue = () => {
    const config = this.form.config_3d_secure;

    if (config?.startsWith('all_cards')) return 'all_cards';
    if (config?.startsWith('maestro_only')) return 'maestro_only';

    return 'off';
  };

  private readonly __threeDSecureToggleSetValue = (
    newValue: 'off' | 'all_cards' | 'maestro_only'
  ) => {
    let newFormValue = '';

    if (newValue === 'all_cards' || newValue === 'maestro_only') {
      if (this.form.config_3d_secure?.endsWith('require_valid_response')) {
        newFormValue = `${newValue}_require_valid_response`;
      } else {
        newFormValue = newValue;
      }
    }

    this.edit({ config_3d_secure: newFormValue as Data['config_3d_secure'] });
  };

  private readonly __threeDSecureToggleOptions = [
    { value: 'off', label: 'option_off' },
    { value: 'all_cards', label: 'option_all_cards' },
    { value: 'maestro_only', label: 'option_maestro_only' },
  ];

  private readonly __cardVerificationOptions = [
    { label: 'option_disabled', value: 'disabled' },
    { label: 'option_enabled_automatically', value: 'enabled_automatically' },
    { label: 'option_enabled_override', value: 'enabled_override' },
  ];

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`header:copy-json ${super.hiddenSelector}`.trimEnd());
  }

  renderHeader(...params: Parameters<InternalForm<Data>['renderHeader']>): TemplateResult {
    return html`
      <div>
        ${super.renderHeader(...params)}
        ${this.data?.type || !this.form.type
          ? html``
          : html`
              <vaadin-button
                data-testid="select-another-button"
                theme="tertiary-inline"
                @click=${() => this.undo()}
              >
                <foxy-i18n infer="" key="select_another_button_label"></foxy-i18n>
              </vaadin-button>
            `}
      </div>
    `;
  }

  get headerTitleOptions(): Record<string, unknown> {
    return {
      context: this.form.type ? 'selected' : 'new',
      name: this.form.helper?.name,
    };
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    if (this.href) {
      const vId = getResourceId(this.href) as string;
      const id = this.headerCopyIdValue;
      if (vId.startsWith('R')) return { context: 'regular', id };
      return { context: 'hosted', id };
    }

    return {};
  }

  get headerCopyIdValue(): string | number {
    if (this.href) {
      const id = getResourceId(this.href) as string;
      return id.startsWith('R') ? id.slice(1) : id.slice(1).split('C')[0];
    } else {
      return '';
    }
  }

  renderBody(): TemplateResult {
    const paymentPreset = this.__paymentPresetLoader?.data;

    const loaders = html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(paymentPreset?._links['fx:available_payment_methods'].href)}
        id=${this.__availablePaymentMethodsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.store)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.paymentPreset)}
        id=${this.__paymentPresetLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;

    return html`${this.renderHeader()}${this.form.type
      ? this.__renderPaymentMethodConfig()
      : this.__renderPaymentMethodSelector()}${loaders}`;
  }

  private get __groupedAvailablePaymentMethods() {
    return Object.entries(this.__availablePaymentMethods ?? {})
      .sort((a, b) => a[0].localeCompare(b[0], 'en'))
      .reduce((groups, [type, helper]) => {
        if (helper.is_deprecated) return groups;

        const firstChar = type.charAt(0).toUpperCase();
        const isSpecialCharacter = !/\w/.test(firstChar);
        const name = isSpecialCharacter ? '#' : firstChar;
        const group = groups.find(group => group.name === name);

        if (group) {
          group.items.push({ type, helper });
        } else {
          groups.push({ name, items: [{ type, helper }] });
        }

        return groups;
      }, [] as { name: string; items: PaymentMethod[] }[]);
  }

  private get __availablePaymentMethodsLoader() {
    type Loader = NucleonElement<AvailablePaymentMethods>;
    return this.renderRoot.querySelector<Loader>(`#${this.__availablePaymentMethodsLoaderId}`);
  }

  private get __availablePaymentMethods() {
    return this.__availablePaymentMethodsLoader?.data?.values;
  }

  private get __paymentPresetLoader() {
    type Loader = NucleonElement<PaymentPreset>;
    return this.renderRoot.querySelector<Loader>(`#${this.__paymentPresetLoaderId}`);
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }

  private get __liveBlocks() {
    return this.form.helper?.additional_fields?.blocks.filter(block => block.is_live) ?? [];
  }

  private get __testBlocks() {
    return this.form.helper?.additional_fields?.blocks.filter(block => !block.is_live) ?? [];
  }

  private __renderPaymentMethodSelector() {
    const loader = this.__availablePaymentMethodsLoader;

    if (!loader?.data) {
      return html`
        <foxy-spinner infer="list-spinner" state=${loader?.in('fail') ? 'error' : 'busy'}>
        </foxy-spinner>
      `;
    }

    return html`
      <div>
        <section data-testid="select-method-list" class="-mt-m">
          ${this.__groupedAvailablePaymentMethods.map(({ name, items }) => {
            return html`
              <p class="font-medium text-tertiary py-m">${name}</p>
              <ul class="grid grid-cols-2 gap-m">
                ${items.map(item => html`<li>${this.__renderPaymentMethodButton(item)}</li>`)}
              </ul>
            `;
          })}
        </section>
      </div>
    `;
  }

  private __renderPaymentMethodConfig() {
    const oauthGateways = [
      'stripe_connect',
      'square_up',
      'quickbook_payments',
      'amazon_mws',
      'paypal_platform',
    ];

    if (this.form.type && oauthGateways.includes(this.form.type)) {
      return html`
        <div
          class="flex items-start rounded border border-primary"
          style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px); padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-primary" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
          <p>
            <foxy-i18n infer="" key="no_oauth_support_message"></foxy-i18n>
            <br />
            <a
              target="_blank"
              class="mt-xs inline-block rounded font-medium text-primary transition-colors cursor-pointer hover-opacity-80 focus-outline-none focus-ring-2 focus-ring-primary-50"
              href="https://admin.foxycart.com"
            >
              admin.foxycart.com
            </a>
          </p>
        </div>
      `;
    }

    return html`
      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>

        ${this.form.helper?.supports_auth_only
          ? html`
              <foxy-internal-switch-control infer="use-auth-only" helper-text-as-tooltip>
              </foxy-internal-switch-control>
            `
          : ''}
        ${this.form.helper?.supports_3d_secure
          ? html`
              <foxy-internal-select-control
                layout="summary-item"
                infer="three-d-secure-toggle"
                .getValue=${this.__threeDSecureToggleGetValue}
                .setValue=${this.__threeDSecureToggleSetValue}
                .options=${this.__threeDSecureToggleOptions}
              >
              </foxy-internal-select-control>

              ${this.form.config_3d_secure
                ? html`
                    <foxy-internal-switch-control
                      layout="summary-item"
                      infer="three-d-secure-response"
                      .getValue=${this.__threeDSecureResponseGetValue}
                      .setValue=${this.__threeDSecureResponseSetValue}
                    >
                    </foxy-internal-switch-control>
                  `
                : ''}
            `
          : ''}
        ${
          // @ts-expect-error SDK typings are incomplete
          this.form.helper?.supports_card_verification
            ? html`
                <foxy-internal-select-control
                  layout="summary-item"
                  infer="card-verification"
                  .options=${this.__cardVerificationOptions}
                >
                </foxy-internal-select-control>
              `
            : ''
        }
      </foxy-internal-summary-control>

      ${
        // @ts-expect-error SDK typings are incomplete
        this.form.helper?.supports_card_verification &&
        // @ts-expect-error SDK typings are incomplete
        this.form.card_verification?.startsWith('enabled_')
          ? html`
              <foxy-internal-summary-control
                layout="details"
                infer="card-verification-config-verification-amounts"
              >
                ${['visa', 'mastercard', 'american-express', 'discover', 'default'].map(type => {
                  return html`
                    <foxy-internal-number-control
                      json-template=${ifDefined(
                        // @ts-expect-error SDK typings are incomplete
                        this.form.helper?.card_verification_config
                      )}
                      json-path="verification_amounts.${type.replace(/-/g, '_')}"
                      property="card_verification_config"
                      layout="summary-item"
                      suffix="¤"
                      infer="card-verification-config-verification-amounts-${type}"
                      step="0.01"
                      min="0"
                    >
                    </foxy-internal-number-control>
                  `;
                })}
              </foxy-internal-summary-control>
            `
          : ''
      }
      ${['live', 'test'].map((type, index) => {
        const prefix = index === 0 ? '' : `${type}-`;
        const blocks = index === 0 ? this.__liveBlocks : this.__testBlocks;
        const scope = `${type}-group`;

        if (type === 'live' && !this.__storeLoader?.data) return html``;
        if (type === 'live' && !this.__storeLoader?.data?.is_active) {
          return html`
            <foxy-internal-summary-control infer="${type}-group">
              <div
                class="flex items-start"
                style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
              >
                ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-primary" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
                <p><foxy-i18n infer="" key="inactive_message"></foxy-i18n></p>
              </div>
            </foxy-internal-summary-control>
          `;
        }

        const showInactiveSetText =
          this.__storeLoader?.data?.is_active === true &&
          ((type === 'test' && this.__paymentPresetLoader?.data?.is_live === true) ||
            (type === 'live' && this.__paymentPresetLoader?.data?.is_live === false));

        return html`
          <foxy-internal-summary-control
            helper-text=${ifDefined(
              showInactiveSetText ? this.t(`${scope}.helper_text_inactive`) : void 0
            )}
            layout="details"
            label=${ifDefined(showInactiveSetText ? this.t(`${scope}.label_inactive`) : void 0)}
            infer=${scope}
            ?open=${!showInactiveSetText}
          >
            ${this.form.helper?.id_description
              ? html`
                  <foxy-internal-text-control
                    placeholder=${this.t('default_additional_field_placeholder')}
                    helper-text=""
                    layout="summary-item"
                    label=${this.form.helper.id_description}
                    infer="${prefix}account-id"
                  >
                  </foxy-internal-text-control>
                `
              : ''}
            ${this.form.helper?.third_party_key_description
              ? html`
                  <foxy-internal-password-control
                    placeholder=${this.t('default_additional_field_placeholder')}
                    helper-text=""
                    layout="summary-item"
                    label=${this.form.helper.third_party_key_description}
                    infer="${prefix}third-party-key"
                  >
                  </foxy-internal-password-control>
                `
              : ''}
            ${this.form.helper?.key_description
              ? html`
                  <foxy-internal-password-control
                    placeholder=${this.t('default_additional_field_placeholder')}
                    layout="summary-item"
                    helper-text=""
                    label=${this.form.helper.key_description}
                    infer="${prefix}account-key"
                  >
                  </foxy-internal-password-control>
                `
              : ''}
            ${blocks.map(block => this.__renderBlock(block))}
          </foxy-internal-summary-control>
        `;
      })}
      ${super.renderBody()}
    `;
  }

  private __renderPaymentMethodButton({ type, helper }: PaymentMethod) {
    const defaultSrc = PaymentsApiPaymentMethodForm.defaultImageSrc;
    const src = this.getImageSrc?.(type) ?? defaultSrc;
    const onError = (evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc);

    return html`
      <button
        class=${classMap({
          'relative w-full block text-left p-s rounded bg-contrast-5 overflow-hidden': true,
          'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
          'transition-colors hover-bg-contrast-10': !helper.conflict,
          'cursor-default': !!helper.conflict,
        })}
        ?disabled=${!!helper.conflict}
        title=${helper.conflict ? this.t('conflict_message', helper.conflict) : ''}
        @click=${() => this.edit({ type, helper })}
      >
        <img
          class="absolute top-0 left-0 w-1-2 h-full object-cover bg-center filter saturate-200 blur-3xl"
          style="transform: translate3d(0, 0, 0)"
          src=${src}
          alt=""
          ?hidden=${!!helper.conflict}
          @error=${onError}
        />

        <figure class="relative flex flex-col gap-m">
          <img
            class=${classMap({
              'h-m w-m object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs': true,
              'filter grayscale': !!helper.conflict,
            })}
            src=${src}
            alt=""
            @error=${onError}
          />

          <figcaption
            class=${classMap({
              'min-w-0 flex-1 truncate leading-s': true,
              'text-disabled': !!helper.conflict,
            })}
          >
            <div class="font-medium">${helper.name}&ZeroWidthSpace;</div>
            <div class="text-xs ${helper.conflict ? '' : 'text-secondary'}">${type}</div>
          </figcaption>
        </figure>
      </button>
    `;
  }

  private __renderBlock(block: Block) {
    return html`${block.fields.map(field => {
      if (field.type === 'hidden') return;
      const scope = ['additional-fields', field.id].join('-').replace(/_/g, '-');

      const getValue = () => {
        try {
          const config = JSON.parse(this.form.additional_fields ?? '{}');
          return get(config, field.id) ?? config.default_value;
        } catch {
          return field.default_value;
        }
      };

      const setValue = (newValue: unknown) => {
        let config: Record<string, unknown> = {};

        try {
          config = JSON.parse(this.form.additional_fields ?? '');
        } catch {
          // ignore
        }

        this.edit({ additional_fields: JSON.stringify(set(config, field.id, newValue)) });
      };

      type Option = { name: string; value: string };
      const options = (field as { options?: Option[] }).options;

      return html`
        ${field.type === 'checkbox'
          ? html`
              <foxy-internal-switch-control
                helper-text=${field.description ?? ''}
                label=${field.name}
                infer=${scope}
                helper-text-as-tooltip
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-switch-control>
            `
          : field.type === 'select'
          ? html`
              <foxy-internal-select-control
                placeholder=${this.t('default_additional_field_select_placeholder')}
                helper-text=${field.description ?? ''}
                layout="summary-item"
                label=${field.name}
                infer=${scope}
                .options=${options!.map(({ name, value }) => ({ label: name, value }))}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-select-control>
            `
          : html`
              <foxy-internal-text-control
                helper-text=${field.description ?? ''}
                placeholder=${field.default_value || this.t('default_additional_field_placeholder')}
                layout="summary-item"
                label=${field.name}
                infer=${scope}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-text-control>
            `}
      `;
    })}`;
  }
}
