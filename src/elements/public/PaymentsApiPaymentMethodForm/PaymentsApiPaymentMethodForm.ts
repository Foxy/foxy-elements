import type { AvailablePaymentMethods } from '../PaymentsApi/api/types';
import type { Templates, Block, Data } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { TabsElement } from '@vaadin/vaadin-tabs';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

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
 * @slot description:before
 * @slot description:after
 *
 * @slot account-id:before
 * @slot account-id:after
 *
 * @slot account-key:before
 * @slot account-key:after
 *
 * @slot third-party-key:before
 * @slot third-party-key:after
 *
 * @slot test-account-id:before
 * @slot test-account-id:after
 *
 * @slot test-account-key:before
 * @slot test-account-key:after
 *
 * @slot test-third-party-key:before
 * @slot test-third-party-key:after
 *
 * @slot additional-fields-[field-name-in-kebab-case]:before
 * @slot additional-fields-[field-name-in-kebab-case]:after
 *
 * @slot three-d-secure-toggle:before
 * @slot three-d-secure-toggle:after
 *
 * @slot three-d-secure-response:before
 * @slot three-d-secure-response:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
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
      __tab: { attribute: false },
      getImageSrc: { attribute: false },
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

  /** A function that returns a URL of a payment method icon based on the given type. */
  getImageSrc: ((type: string) => string) | null = null;

  /** Template render functions mapped to their name. */
  templates: Templates = {};

  private readonly __availablePaymentMethodsLoaderId = 'availablePaymentMethodsLoader';

  private readonly __threeDSecureResponseGetValue = () => {
    return this.form.config_3d_secure?.endsWith('require_valid_response') ? ['valid_only'] : [];
  };

  private readonly __threeDSecureResponseSetValue = (newValue: string[]) => {
    const postfix = newValue.includes('valid_only') ? '_require_valid_response' : '';

    const config = this.form.config_3d_secure;
    const type = config?.startsWith('all_cards') ? 'all_cards' : 'maestro_only';

    this.edit({
      config_3d_secure: `${type}${postfix}` as Data['config_3d_secure'],
    });
  };

  private readonly __threeDSecureResponseOptions = [
    { value: 'valid_only', label: 'option_valid_only' },
  ];

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

  private __tab = 0;

  renderBody(): TemplateResult {
    return this.form.type
      ? this.__renderPaymentMethodConfig(this.form.type)
      : this.__renderPaymentMethodSelector();
  }

  private get __groupedAvailablePaymentMethods() {
    return Object.entries(this.__availablePaymentMethods ?? {})
      .sort((a, b) => a[0].localeCompare(b[0], 'en'))
      .reduce((groups, [type, helper]) => {
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

  private get __availablePaymentMethodsHref() {
    try {
      const presetIdRegex = /\/payment_presets\/(?<presetId>.+)\//;
      const pathname = new URL(this.href || this.parent).pathname;
      const presetId = presetIdRegex.exec(pathname)!.groups!.presetId;
      const url = new URL(
        `/payment_presets/${presetId}/available_payment_methods`,
        this.href || this.parent
      );

      return url.toString();
    } catch {
      // ignore
    }
  }

  private get __availablePaymentMethods() {
    return this.__availablePaymentMethodsLoader?.data?.values;
  }

  private get __liveBlocks() {
    return this.form.helper?.additional_fields?.blocks.filter(block => block.is_live) ?? [];
  }

  private get __testBlocks() {
    return this.form.helper?.additional_fields?.blocks.filter(block => !block.is_live) ?? [];
  }

  private __renderPaymentMethodSelector() {
    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__availablePaymentMethodsHref)}
        id=${this.__availablePaymentMethodsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-i18n
        class="block text-xxl font-medium border-b border-contrast-10 pb-m"
        infer=""
        key="select_method_title"
      >
      </foxy-i18n>

      <section data-testid="select-method-list">
        <div class="-my-s">
          ${this.__groupedAvailablePaymentMethods.map(({ name, items }) => {
            return html`
              <p class="w-m text-center font-medium text-tertiary py-s">${name}</p>
              <ul class="grid grid-cols-1">
                ${items.map(item => html`<li>${this.__renderPaymentMethodButton(item)}</li>`)}
              </ul>
            `;
          })}
        </div>
      </section>
    `;
  }

  private __renderPaymentMethodConfig(type: string) {
    const defaultSrc = PaymentsApiPaymentMethodForm.defaultImageSrc;

    return html`
      <figure data-testid="logo" class="relative flex flex-col gap-m p-m items-center">
        <img
          class="relative h-xl w-xl object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${this.getImageSrc?.(type) ?? defaultSrc}
          alt=""
          @error=${(evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc)}
        />

        <figcaption class="relative min-w-0 font-medium text-xl text-center">
          ${this.form.helper?.name ?? this.form.type}&ZeroWidthSpace;
        </figcaption>
      </figure>

      <div class="rounded border border-contrast-10">
        <vaadin-tabs
          selected=${this.__tab}
          theme="centered"
          @selected-changed=${(evt: CustomEvent) => {
            const tabs = evt.currentTarget as TabsElement;
            this.__tab = tabs.selected ?? 0;
          }}
        >
          <vaadin-tab><foxy-i18n infer="" key="tab_live"></foxy-i18n></vaadin-tab>
          <vaadin-tab><foxy-i18n infer="" key="tab_test"></foxy-i18n></vaadin-tab>
        </vaadin-tabs>

        <div class="overflow-hidden" style="--lumo-border-radius: var(--lumo-border-radius-s)">
          <div
            data-testid="tab-content"
            class="grid grid-cols-2 gap-m transition-transform transform duration-300"
            style=${classMap({
              'width: calc(200% + var(--lumo-space-m));': true,
              '--tw-translate-x: 0;': this.__tab === 0,
              '--tw-translate-x: calc(-50% - (var(--lumo-space-m) / 2));': this.__tab !== 0,
            })}
          >
            ${['live', 'test'].map((type, index) => {
              const prefix = index === 0 ? '' : `${type}-`;
              const blocks = index === 0 ? this.__liveBlocks : this.__testBlocks;

              return html`
                <div
                  class=${classMap({
                    'grid grid-cols-1 gap-m p-m transition-opacity duration-300': true,
                    'opacity-100': this.__tab === index,
                    'opacity-0': this.__tab !== index,
                  })}
                >
                  ${this.form.helper?.id_description
                    ? html`
                        <foxy-internal-text-control
                          placeholder=${this.t('default_additional_field_placeholder')}
                          helper-text=""
                          label=${this.form.helper.id_description}
                          infer="${prefix}account-id"
                        >
                        </foxy-internal-text-control>
                      `
                    : ''}
                  ${this.form.helper?.third_party_key_description
                    ? html`
                        <foxy-internal-text-control
                          placeholder=${this.t('default_additional_field_placeholder')}
                          helper-text=""
                          label=${this.form.helper.third_party_key_description}
                          infer="${prefix}third-party-key"
                        >
                        </foxy-internal-text-control>
                      `
                    : ''}
                  ${this.form.helper?.key_description
                    ? html`
                        <foxy-internal-text-control
                          placeholder=${this.t('default_additional_field_placeholder')}
                          helper-text=""
                          label=${this.form.helper.key_description}
                          infer="${prefix}account-key"
                        >
                        </foxy-internal-text-control>
                      `
                    : ''}
                  ${blocks.map(block => this.__renderBlock(block))}
                </div>
              `;
            })}
          </div>
        </div>
      </div>

      <foxy-internal-text-control infer="description"></foxy-internal-text-control>

      ${this.form.helper?.supports_3d_secure
        ? html`
            <foxy-internal-radio-group-control
              infer="three-d-secure-toggle"
              class="-mb-s"
              .getValue=${this.__threeDSecureToggleGetValue}
              .setValue=${this.__threeDSecureToggleSetValue}
              .options=${this.__threeDSecureToggleOptions}
            >
            </foxy-internal-radio-group-control>

            ${this.form.config_3d_secure
              ? html`
                  <foxy-internal-checkbox-group-control
                    infer="three-d-secure-response"
                    class="-mb-s"
                    .getValue=${this.__threeDSecureResponseGetValue}
                    .setValue=${this.__threeDSecureResponseSetValue}
                    .options=${this.__threeDSecureResponseOptions}
                  >
                  </foxy-internal-checkbox-group-control>
                `
              : ''}
          `
        : ''}
      ${this.data?.type
        ? ''
        : html`
            <vaadin-button
              data-testid="select-another-button"
              theme="contrast"
              @click=${() => this.undo()}
            >
              <foxy-i18n infer="" key="select_another_button_label"></foxy-i18n>
            </vaadin-button>
          `}
      ${super.renderBody()}
    `;
  }

  private __renderPaymentMethodButton({ type, helper }: PaymentMethod) {
    const defaultSrc = PaymentsApiPaymentMethodForm.defaultImageSrc;

    return html`
      <button
        class=${classMap({
          'w-full block text-left p-s rounded -mx-s': true,
          'transition-colors hover-bg-contrast-5': !helper.conflict,
          'cursor-default': !!helper.conflict,
        })}
        ?disabled=${!!helper.conflict}
        @click=${() => this.edit({ type, helper })}
      >
        <figure class="flex items-center gap-m h-m">
          <img
            class="relative h-m w-m object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
            src=${this.getImageSrc?.(type) ?? defaultSrc}
            alt=""
            @error=${(evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc)}
          />

          <figcaption
            class=${classMap({
              'min-w-0 flex-1 truncate leading-s': true,
              'text-tertiary': !!helper.conflict,
            })}
          >
            <div class="font-medium">${helper.name}&ZeroWidthSpace;</div>
            ${helper.conflict
              ? html`
                  <foxy-i18n
                    class="block text-tertiary text-xs"
                    infer=""
                    key="conflict_message"
                    .options=${helper.conflict}
                  >
                  </foxy-i18n>
                `
              : ''}
          </figcaption>
        </figure>
      </button>
    `;
  }

  private __renderBlock(block: Block) {
    return html`${block.fields.map(field => {
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
        try {
          const config = JSON.parse(this.form.additional_fields ?? '{}');
          this.edit({ additional_fields: JSON.stringify(set(config, field.id, newValue)) });
        } catch {
          return '';
        }
      };

      type Option = { name: string; value: string };
      const options = (field as { options?: Option[] }).options;

      return html`
        ${field.type === 'checkbox'
          ? html`
              <foxy-internal-checkbox-group-control
                helper-text=${field.description ?? ''}
                label=""
                class="-mb-s"
                infer=${scope}
                .options=${[{ label: field.name, value: 'checked' }]}
                .getValue=${() => (getValue() ? ['checked'] : [])}
                .setValue=${(newValue: string[]) => {
                  setValue(newValue.includes('checked'));
                }}
              >
              </foxy-internal-checkbox-group-control>
            `
          : field.type === 'select'
          ? html`
              <foxy-internal-select-control
                helper-text=${field.description ?? ''}
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
