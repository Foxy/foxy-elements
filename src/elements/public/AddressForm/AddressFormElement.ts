import { CSSResult, CSSResultArray } from 'lit-element';
import { ComboBoxParams, Data, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfirmDialogElement } from '../../private/ConfirmDialog/ConfirmDialogElement';
import { I18nElement } from '../I18n/index';
import { NucleonElement } from '../NucleonElement/index';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTableElement } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { countries } from './countries';
import { ifDefined } from 'lit-html/directives/if-defined';
import { memoize } from 'lodash-es';
import { regions } from './regions';

export class AddressFormElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'x-property-table': PropertyTableElement,
      'x-confirm-dialog': ConfirmDialogElement,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ address_name: v }) => (v && v.length > 0) || 'address_name_required',
      ({ address_name: v }) => !v || v.length <= 100 || 'address_name_too_long',
      ({ first_name: v }) => !v || v.length <= 50 || 'first_name_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last_name_too_long',
      ({ region: v }) => !v || v.length <= 50 || 'region_too_long',
      ({ city: v }) => !v || v.length <= 50 || 'city_too_long',
      ({ phone: v }) => !v || v.length <= 50 || 'phone_too_long',
      ({ company: v }) => !v || v.length <= 50 || 'company_too_long',
      ({ address2: v }) => !v || v.length <= 100 || 'address2_too_long',
      ({ address1: v }) => (v && v.length > 0) || 'address1_required',
      ({ address1: v }) => (v && v.length <= 100) || 'address1_too_long',
      ({ postal_code: v }) => !v || v.length <= 50 || 'postal_code_too_long',
    ];
  }

  private static __ns = 'address-form';

  private __untrackTranslations?: () => void;

  private __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = AddressFormElement.__ns;

    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isDisabled = !this.in('idle');
    const isDefaultShipping = !!this.form?.is_default_shipping;
    const isDefaultBilling = !!this.form?.is_default_billing;
    const isDefault = isDefaultShipping || isDefaultBilling;
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${ns}
        id="confirm"
        data-testid="confirm"
        @submit=${this.delete}
      >
      </x-confirm-dialog>

      <div
        class="space-y-l font-lumo text-m leading-m text-body relative"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        data-testid="wrapper"
      >
        <div class="grid grid-cols-2 gap-m">
          ${this.__renderTextField({
            field: 'address_name',
            wide: true,
            readonly: isDefault,
            required: true,
          })}
          ${this.__renderTextField({ field: 'first_name' })}
          ${this.__renderTextField({ field: 'last_name' })}
          ${this.__renderTextField({ field: 'company' })}
          ${this.__renderTextField({ field: 'phone' })}
          ${this.__renderTextField({ field: 'address1', wide: true, required: true })}
          ${this.__renderTextField({ field: 'address2', wide: true })}
          ${this.__renderComboBox({ field: 'country', source: countries })}
          ${this.__renderComboBox({ field: 'region', source: regions, custom: true })}
          ${this.__renderTextField({ field: 'city' })}
          ${this.__renderTextField({ field: 'postal_code' })}
        </div>

        ${this.href ? this.__renderPropertyTable() : undefined}

        <vaadin-button
          class="w-full"
          theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
          data-testid="action"
          ?disabled=${(this.in({ idle: 'template' }) && !isValid) || isDisabled || isDefault}
          @click=${this.__handleActionClick}
        >
          <foxy-i18n ns=${ns} key=${this.href ? 'delete' : 'create'} lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${!this.in('idle')
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('busy') ? 'busy' : 'error'}
                  layout="vertical"
                  data-testid="spinner"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
    this.__getValidator.cache.clear?.();
  }

  private get __t() {
    return I18nElement.i18next.getFixedT(this.lang, AddressFormElement.__ns);
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }

  private __renderPropertyTable() {
    return html`
      <x-property-table
        .items=${(['date_modified', 'date_created'] as const).map(field => {
          const name = this.__t(field);
          const data = this.data;
          return { name, value: data ? this.__formatDate(new Date(data[field])) : '' };
        })}
      >
      </x-property-table>
    `;
  }

  private __formatDate(date: Date, lang = this.lang): string {
    try {
      return date.toLocaleDateString(lang, {
        month: 'long',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        day: 'numeric',
      });
    } catch {
      return this.__formatDate(date, I18nElement.fallbackLng);
    }
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.__t(error).toString() : '';
  }

  private __renderComboBox({ source, field, custom = false }: ComboBoxParams) {
    return html`
      <vaadin-combo-box
        label=${this.__t(field).toString()}
        value=${ifDefined(this.form?.[field]?.toString())}
        error-message=${this.__getErrorMessage(field)}
        data-testid=${field}
        item-value-path="code"
        item-label-path="text"
        .checkValidity=${this.__getValidator(field)}
        .items=${source.map(code => ({ text: this.__t(`${field}_map.${code}`), code }))}
        ?allow-custom-value=${custom}
        ?disabled=${!this.in('idle')}
        @change=${this.__bindField(field)}
      >
      </vaadin-combo-box>
    `;
  }

  private __renderTextField({
    field,
    wide = false,
    readonly = false,
    required = false,
  }: TextFieldParams) {
    return html`
      <vaadin-text-field
        class=${classMap({ 'col-span-2': wide })}
        label=${this.__t(field).toString()}
        value=${ifDefined(this.form?.[field]?.toString())}
        error-message=${this.__getErrorMessage(field)}
        data-testid=${field}
        .checkValidity=${this.__getValidator(field)}
        ?disabled=${!this.in('idle')}
        ?required=${required}
        ?readonly=${readonly}
        @input=${this.__bindField(field)}
        @keydown=${this.__handleKeyDown}
      >
      </vaadin-text-field>
    `;
  }

  private __handleActionClick(evt: Event) {
    if (this.in({ idle: 'snapshot' })) {
      const confirm = this.renderRoot.querySelector('#confirm');
      (confirm as ConfirmDialogElement).show(evt.currentTarget as HTMLElement);
    } else {
      this.submit();
    }
  }
}
