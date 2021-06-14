import { ComboBoxParams, Data, Templates, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { I18n } from '../I18n/I18n';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/PropertyTable/PropertyTable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { countries } from '../../../utils/countries';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';
import { regions } from '../../../utils/regions';

const NS = 'address-form';
const Base = ScopedElementsMixin(
  ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Basic form displaying customer address.
 *
 * @slot address-name:before - **new in v1.4.0**
 * @slot address-name:after - **new in v1.4.0**
 *
 * @slot first-name:before - **new in v1.4.0**
 * @slot first-name:after - **new in v1.4.0**
 *
 * @slot last-name:before - **new in v1.4.0**
 * @slot last-name:after - **new in v1.4.0**
 *
 * @slot region:before - **new in v1.4.0**
 * @slot region:after - **new in v1.4.0**
 *
 * @slot city:before - **new in v1.4.0**
 * @slot city:after - **new in v1.4.0**
 *
 * @slot phone:before - **new in v1.4.0**
 * @slot phone:after - **new in v1.4.0**
 *
 * @slot company:before - **new in v1.4.0**
 * @slot company:after - **new in v1.4.0**
 *
 * @slot address-line-one:before - **new in v1.4.0**
 * @slot address-line-one:after - **new in v1.4.0**
 *
 * @slot address-line-two:before - **new in v1.4.0**
 * @slot address-line-two:after - **new in v1.4.0**
 *
 * @slot country:before - **new in v1.4.0**
 * @slot country:after - **new in v1.4.0**
 *
 * @slot postal-code:before - **new in v1.4.0**
 * @slot postal-code:after - **new in v1.4.0**
 *
 * @slot timestamps:before - **new in v1.4.0**
 * @slot timestamps:after - **new in v1.4.0**
 *
 * @slot create:before - **new in v1.4.0**
 * @slot create:after - **new in v1.4.0**
 *
 * @slot delete:before - **new in v1.4.0**
 * @slot delete:after - **new in v1.4.0**
 *
 * @element foxy-address-form
 * @since 1.2.0
 */
export class AddressForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'x-property-table': PropertyTable,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
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

  templates: Templates = {};

  private readonly __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  private readonly __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  private readonly __maybeRenderComboBox = (params: ComboBoxParams) => {
    const { source, field, custom = false } = params;
    const bsid = field.replace(/_/, '-');
    if (this.hiddenSelector.matches(bsid)) return '';

    const I18nElement = customElements.get('foxy-i18n') as typeof I18n;
    const t = I18nElement.i18next.getFixedT(this.lang, field);

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${bsid}:before`)}

        <vaadin-combo-box
          class="w-full"
          label=${this.t(field).toString()}
          value=${ifDefined(this.form?.[field]?.toString())}
          error-message=${this.__getErrorMessage(field)}
          data-testid=${bsid}
          item-value-path="code"
          item-label-path="text"
          .checkValidity=${this.__getValidator(field)}
          .items=${source.map(code => ({ text: t(code).toString(), code }))}
          ?allow-custom-value=${custom}
          ?readonly=${this.readonlySelector.matches(bsid, true)}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(bsid, true)}
          @change=${this.__bindField(field)}
        >
        </vaadin-combo-box>

        ${this.renderTemplateOrSlot(`${bsid}:after`)}
      </div>
    `;
  };

  private readonly __maybeRenderTextField = (params: TextFieldParams) => {
    const { field, wide = false, readonly = false, required = false } = params;
    const bsid = field.replace(/_/, '-').replace('1', '-one').replace('2', '-two');
    if (this.hiddenSelector.matches(bsid)) return '';

    return html`
      <div class=${classMap({ 'col-span-2': wide })}>
        ${this.renderTemplateOrSlot(`${bsid}:before`)}

        <vaadin-text-field
          class="w-full"
          label=${this.t(field).toString()}
          value=${ifDefined(this.form?.[field]?.toString())}
          error-message=${this.__getErrorMessage(field)}
          data-testid=${bsid}
          .checkValidity=${this.__getValidator(field)}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(bsid)}
          ?required=${required}
          ?readonly=${readonly || this.readonlySelector.matches(bsid)}
          @input=${this.__bindField(field)}
          @keydown=${this.__handleKeyDown}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${bsid}:after`)}
      </div>
    `;
  };

  private readonly __renderTimestamps = () => {
    const items = (['date_modified', 'date_created'] as const).map(field => ({
      name: this.t(field),
      value: this.data ? this.t('date', { value: new Date(this.data[field]) }) : '',
    }));

    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}
        <x-property-table .items=${items} data-testid="timestamps"></x-property-table>
        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  };

  private readonly __renderAction = (action: string) => {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(action, true);
    const isDefaultShipping = !!this.form?.is_default_shipping;
    const isDefaultBilling = !!this.form?.is_default_billing;
    const isDefault = isDefaultShipping || isDefaultBilling;
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${action}:before`)}

        <vaadin-button
          class="w-full"
          theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
          data-testid=${action}
          ?disabled=${(this.in({ idle: 'template' }) && !isValid) || isDisabled || isDefault}
          @click=${this.__handleActionClick}
        >
          <foxy-i18n ns=${this.ns} key=${action} lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot(`${action}:after`)}
      </div>
    `;
  };

  connectedCallback(): void {
    super.connectedCallback();
    customElements.get('foxy-i18n').i18next.loadNamespaces(['country', 'region']);
  }

  render(): TemplateResult {
    const { hiddenSelector, lang, ns } = this;
    const action = this.href ? 'delete' : 'create';

    const isDefaultShipping = !!this.form?.is_default_shipping;
    const isDefaultBilling = !!this.form?.is_default_billing;
    const isDefault = isDefaultShipping || isDefaultBilling;
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <foxy-internal-confirm-dialog
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        data-testid="confirm"
        @hide=${this.__handleConfirmHide}
      >
      </foxy-internal-confirm-dialog>

      <div
        class="space-y-l font-lumo text-m leading-m text-body relative"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        data-testid="wrapper"
      >
        <div class="grid grid-cols-2 gap-m">
          ${this.__maybeRenderTextField({
            field: 'address_name',
            wide: true,
            readonly: isDefault,
            required: true,
          })}
          ${this.__maybeRenderTextField({ field: 'first_name' })}
          ${this.__maybeRenderTextField({ field: 'last_name' })}
          ${this.__maybeRenderTextField({ field: 'company' })}
          ${this.__maybeRenderTextField({ field: 'phone' })}
          ${this.__maybeRenderTextField({ field: 'address1', wide: true, required: true })}
          ${this.__maybeRenderTextField({ field: 'address2', wide: true })}
          ${this.__maybeRenderComboBox({ field: 'country', source: countries })}
          ${this.__maybeRenderComboBox({ field: 'region', source: regions, custom: true })}
          ${this.__maybeRenderTextField({ field: 'city' })}
          ${this.__maybeRenderTextField({ field: 'postal_code' })}
        </div>

        ${!this.data || hiddenSelector.matches('timestamps', true) ? '' : this.__renderTimestamps()}
        ${hiddenSelector.matches(action, true) ? '' : this.__renderAction(action)}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__getValidator.cache.clear?.();
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __handleActionClick(evt: Event) {
    if (this.in({ idle: 'snapshot' })) {
      const confirm = this.renderRoot.querySelector('#confirm');
      (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
    } else {
      this.submit();
    }
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
