import { Address, ComboBoxParams, TextFieldParams } from './types';
import { Checkbox, HypermediaResource, I18N, PropertyTable } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CheckboxChangeEvent } from '../../private/events';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { ElementResourceV8N } from '../../private/HypermediaResource/types';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { SpinnerElement } from '../Spinner';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { classMap } from '../../../utils/class-map';
import { countries } from './countries';
import { memoize } from 'lodash-es';
import { regions } from './regions';

export class AddressFormElement extends HypermediaResource<Address> {
  static readonly defaultNodeName = 'foxy-address-form';

  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'vaadin-combo-box': ComboBoxElement,
      'x-property-table': PropertyTable,
      'x-confirm-dialog': ConfirmDialog,
      'vaadin-button': ButtonElement,
      'foxy-spinner': customElements.get(SpinnerElement.defaultNodeName),
      'x-checkbox': Checkbox,
      'x-i18n': I18N,
    };
  }

  static get resourceV8N(): ElementResourceV8N<Address> {
    return {
      first_name: [({ first_name: v }) => !v || v.length <= 50 || 'errors.too_long'],
      last_name: [({ last_name: v }) => !v || v.length <= 50 || 'errors.too_long'],
      country: [({ country: v }) => !v || countries.includes(v) || 'errors.unsupported'],
      region: [({ region: v }) => !v || v.length <= 50 || 'errors.too_long'],
      city: [({ city: v }) => !v || v.length <= 50 || 'errors.too_long'],
      phone: [({ phone: v }) => !v || v.length <= 50 || 'errors.too_long'],
      company: [({ company: v }) => !v || v.length <= 50 || 'errors.too_long'],
      address2: [({ address2: v }) => !v || v.length <= 100 || 'errors.too_long'],
      address1: [
        ({ address1: v }) => (v && v.length > 0) || 'errors.required',
        ({ address1: v }) => (v && v.length <= 100) || 'errors.too_long',
      ],
    };
  }

  readonly rel = 'customer_address';

  private __bindField = memoize((key: keyof Address) => {
    return (evt: CustomEvent) => {
      const target = evt.target as TextFieldElement;
      this._setProperty({ ...this.resource!, [key]: target.value });
    };
  });

  private __bindCheckbox = memoize((key: keyof Address) => {
    return (evt: CheckboxChangeEvent) => {
      const newValue = (evt.detail as unknown) as string; // TODO: fix once @foxy.io/sdk types are corrected
      this._setProperty({ ...this.resource!, [key]: newValue });
    };
  });

  constructor() {
    super('address-form');
  }

  submit(): void {
    this._submit();
  }

  render(): TemplateResult {
    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm"
        @submit=${this._delete}
      >
      </x-confirm-dialog>

      <div class="space-y-l font-lumo text-m leading-m text-body relative">
        <div class="grid grid-cols-2 gap-m">
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

        <div class="space-y-s">
          ${this.__renderCheckbox('is_default_billing')}
          ${this.__renderCheckbox('is_default_shipping')}
        </div>

        ${this.href ? this.__renderPropertyTable() : undefined}

        <vaadin-button
          class="w-full"
          theme=${this._is('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
          ?disabled=${!this._isI18nReady || !this._is('idle') || this._is('idle.template.invalid')}
          @click=${this.__handleActionClick}
        >
          <x-i18n ns=${this.ns} key=${this.href ? 'delete' : 'create'} lang=${this.lang}> </x-i18n>
        </vaadin-button>

        ${this._is('busy') || this._is('error')
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this._is('busy') ? 'busy' : 'error'}
                  layout="vertical"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private __submitOnEnter(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this._submit();
  }

  private __renderPropertyTable() {
    return html`
      <x-property-table
        ?disabled=${!this._isI18nReady || !this.resource}
        .items=${(['date_modified', 'date_created'] as const).map(field => {
          const name = this._t(field);
          if (!this.resource) return { name, value: '' };

          const date = new Date(this.resource[field]);
          const value = date.toLocaleDateString(this.lang, {
            day: 'numeric',
            month: 'long',
            year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
          });

          return { name, value };
        })}
      >
      </x-property-table>
    `;
  }

  private __renderComboBox({ source, field, custom = false }: ComboBoxParams) {
    return html`
      <vaadin-combo-box
        label=${this._isI18nReady ? this._t(field).toString() : '...'}
        value=${this.resource?.[field]?.toString() ?? ''}
        error-message=${this._getErrorMessages()[field] ?? '...'}
        item-value-path="code"
        item-label-path="text"
        ?invalid=${this.errors.some(err => err.target === field)}
        ?disabled=${!this._isI18nReady || !this._is('idle')}
        ?allow-custom-value=${custom}
        .items=${source.map(code => {
          const text = this._isI18nReady ? this._t(`${field}_map.${code}`) : code;
          return { text, code };
        })}
        @change=${this.__bindField(field)}
      >
      </vaadin-combo-box>
    `;
  }

  private __renderCheckbox(field: keyof Address) {
    return html`
      <x-checkbox
        ?checked=${!!this.resource?.[field]}
        ?disabled=${!this._isI18nReady || !this._is('idle')}
        @change=${this.__bindCheckbox(field)}
      >
        <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${field}></x-i18n>
      </x-checkbox>
    `;
  }

  private __renderTextField({ field, wide = false, required = false }: TextFieldParams) {
    return html`
      <vaadin-text-field
        class=${classMap({ 'col-span-2': wide })}
        label=${this._isI18nReady ? this._t(field).toString() : '...'}
        value=${this.resource?.[field]?.toString() ?? ''}
        error-message=${this._getErrorMessages()[field] ?? ''}
        ?invalid=${this.errors.some(err => err.target === field)}
        ?disabled=${!this._isI18nReady || !this._is('idle')}
        ?required=${required}
        @input=${this.__bindField(field)}
        @keydown=${this.__submitOnEnter}
      >
      </vaadin-text-field>
    `;
  }

  private __handleActionClick() {
    if (this._is('idle.snapshot')) {
      const confirm = this.renderRoot.querySelector('#confirm');
      (confirm as ConfirmDialog).show();
    } else {
      this._submit();
    }
  }
}
