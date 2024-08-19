import type { AvailableFraudProtections, FraudProtection } from '../PaymentsApi/api/types';
import type { Block, Data } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

import get from 'lodash-es/get';
import set from 'lodash-es/set';
import has from 'lodash-es/has';

const NS = 'payments-api-fraud-protection-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for the `fx:fraud_protection` resource of Payments API.
 *
 * _Payments API is a client-side virtual API layer built on top of hAPI
 * in an attempt to streamline access to stores' payment method settings
 * that is currently a bit quirky due to the legacy functionality. To use
 * this element with hAPI, wrap it into a foxy-payments-api node._
 *
 * @element foxy-payments-api-fraud-protection-form
 * @since 1.21.0
 */
export class PaymentsApiFraudProtectionForm extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 44 44'%3E%3Cpath fill='%23fff' d='M0 20.73v-9.9L10.83 0h9.9L0 20.73ZM0 0h9.41L0 9.41V0Zm0 22.14L22.14 0h9.9l-9.43 9.44-.61-.27-10.5 4.66v7-.29L0 32.04v-9.9Zm11.54-.23L0 33.46v9.9l14.14-14.14a15 15 0 0 1-2.6-7.3Zm3.2 8.12L.77 44h9.9l9.7-9.7a13.75 13.75 0 0 1-5.63-4.27Zm6.67 4.64L12.08 44h9.9L44 21.98v-9.9L32.16 23.92C31.01 29.15 27.05 33.6 22 34.83l-.59-.16Zm11.02-12.43L44 10.67V.77L31.42 13.35l1.08.48v7a13 13 0 0 1-.07 1.4Zm-1.99-9.32L43.35 0h-9.9l-9.87 9.87 6.86 3.05ZM23.4 44 44 23.4v9.9L33.3 44h-9.9Zm11.31 0L44 34.71V44h-9.29Z'/%3E%3Cpath fill='%23fff' d='M30.17 21.99H22V11.72l-8.17 3.63V22H22v10.42c4.34-1.34 7.55-5.63 8.17-10.43Z'/%3E%3C/svg%3E";
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getImageSrc: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ description: v }) => !v || v.length <= 100 || 'description:v8n_too_long',

      ({ type: v }) => !!v || 'type:v8n_required',

      ({ score_threshold_reject: v }) => {
        if (typeof v !== 'number') return true;
        return (v <= 100 && v >= 0) || 'score-threshold-reject:v8n_out_of_range';
      },

      form => {
        const blocks = form.helper?.json?.blocks ?? [];
        let json: Record<string, unknown>;

        try {
          json = JSON.parse(form.json ?? '{}');
        } catch {
          json = {};
        }

        for (const block of blocks) {
          for (const field of block.fields) {
            if ('optional' in (field as Record<string, unknown>)) {
              if (!(field as Record<string, unknown>).optional) {
                const path = [block.parent_id, block.id, field.id].filter(v => !!v);
                if (!has(json, path) && field.type !== 'checkbox') return 'json:v8n_invalid';
              }
            }
          }
        }

        return true;
      },
    ];
  }

  /** A function that returns a URL of a fraud protection icon based on the given type. */
  getImageSrc: ((type: string) => string) | null = null;

  private readonly __availableFraudProtectionsLoaderId = 'availableFraudProtections';

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`header:copy-json ${super.hiddenSelector}`.trimEnd());
  }

  get headerTitleOptions(): Record<string, unknown> {
    return { ...this.data, context: this.form.type ?? 'new' };
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { id: this.headerCopyIdValue };
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

  renderBody(): TemplateResult {
    return this.form.type
      ? this.__renderFraudProtectionConfig()
      : this.__renderFraudProtectionSelector();
  }

  private get __availableFraudProtectionsLoader() {
    type Loader = NucleonElement<AvailableFraudProtections>;
    return this.renderRoot.querySelector<Loader>(`#${this.__availableFraudProtectionsLoaderId}`);
  }

  private get __availableFraudProtectionsHref() {
    try {
      const presetIdRegex = /\/payment_presets\/(?<presetId>.+)\//;
      const pathname = new URL(this.href || this.parent).pathname;
      const presetId = presetIdRegex.exec(pathname)!.groups!.presetId;
      const url = new URL(
        `/payment_presets/${presetId}/available_fraud_protections`,
        this.href || this.parent
      );

      return url.toString();
    } catch {
      // ignore
    }
  }

  private get __availableFraudProtections() {
    return this.__availableFraudProtectionsLoader?.data?.values;
  }

  private __renderFraudProtectionSelector() {
    return html`
      ${this.renderHeader()}

      <div class="grid grid-cols-2 gap-m" data-testid="select-protection-list">
        ${Object.entries(this.__availableFraudProtections ?? {}).map(([type, helper]) => {
          return this.__renderFraudProtectionButton({ type, helper } as FraudProtection);
        })}
      </div>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__availableFraudProtectionsHref)}
        id=${this.__availableFraudProtectionsLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private __renderFraudProtectionButton({ type, helper }: FraudProtection) {
    const defaultSrc = PaymentsApiFraudProtectionForm.defaultImageSrc;
    const src = this.getImageSrc?.(type) ?? defaultSrc;
    const onError = (evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc);

    return html`
      <button
        class="relative w-full block text-left p-s rounded bg-contrast-5 overflow-hidden transition-colors hover-bg-contrast-10 focus-outline-none focus-ring-2 focus-ring-primary-50"
        @click=${() => this.edit({ type, helper })}
      >
        <img
          class="absolute top-0 left-0 w-1-2 h-full object-cover bg-center filter saturate-200 blur-3xl"
          style="transform: translate3d(0, 0, 0)"
          src=${src}
          alt=""
          @error=${onError}
        />

        <figure class="relative flex flex-col gap-m">
          <img
            class="h-m w-m object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
            src=${src}
            alt=""
            @error=${onError}
          />

          <figcaption class="min-w-0 flex-1 truncate leading-s">
            <div class="font-medium">${helper.name}&ZeroWidthSpace;</div>
            <div class="text-xs text-secondary">${type}</div>
          </figcaption>
        </figure>
      </button>
    `;
  }

  private __renderFraudProtectionConfig() {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="description">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="setup">
        ${this.form.helper?.uses_rejection_threshold
          ? html`
              <foxy-internal-number-control layout="summary-item" infer="score-threshold-reject">
              </foxy-internal-number-control>
            `
          : ''}
        ${this.form.helper?.json?.blocks.map(block => this.__renderBlock(block))}
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  private __renderBlock(block: Block) {
    return html`${block.fields.map(field => {
      const getValue = () => {
        let config: any;

        try {
          config = JSON.parse(this.form.json ?? '');
        } catch {
          config = {};
        }

        const path = [block.parent_id, block.id, field.id].filter(v => !!v);
        return get(config, path) ?? config.default_value;
      };

      const setValue = (newValue: unknown) => {
        let config: any;

        try {
          config = JSON.parse(this.form.json ?? '');
        } catch {
          config = {};
        }

        const path = [block.parent_id, block.id, field.id].filter(v => !!v);
        this.edit({ json: JSON.stringify(set(config, path, newValue)) });
      };

      type Option = { name: string; value: string };
      const options = (field as { options?: Option[] }).options;
      const path = [block.parent_id, block.id, field.id].filter(v => !!v);
      const scope = ['json', ...path].join('-').replace(/_/g, '-');

      return html`
        ${field.type === 'checkbox'
          ? html`
              <foxy-internal-switch-control
                helper-text=${field.description ?? ''}
                label=${field.name}
                infer=${scope}
                .getValue=${getValue}
                .setValue=${setValue}
              >
              </foxy-internal-switch-control>
            `
          : field.type === 'select'
          ? html`
              <foxy-internal-select-control
                helper-text=${field.description ?? ''}
                placeholder=${this.t('default_additional_field_placeholder')}
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
