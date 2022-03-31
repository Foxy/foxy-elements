import { Data, Templates, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/index';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';

const NS = 'custom-field-form';
const Base = TranslatableMixin(
  ConfigurableMixin(ThemeableMixin(ScopedElementsMixin(NucleonElement))),
  NS
);

/**
 * Form element for creating or editing custom fields.
 *
 * @slot name:before
 * @slot name:after
 * @slot value:before
 * @slot value:after
 * @slot visibility:before
 * @slot visibility:after
 * @slot timestamps:before
 * @slot timestamps:after
 * @slot create:before
 * @slot create:after
 * @slot delete:before
 * @slot delete:after
 *
 * @element foxy-custom-field-form
 * @since 1.11.0
 */
export class CustomFieldForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
      'x-property-table': PropertyTable,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ value }) => (value && value.length > 0) || 'value_required',
      ({ value }) => (value && value.length <= 1000) || 'value_too_long',
      ({ name }) => (name && name.length > 0) || 'name_required',
      ({ name }) => (name && name.length <= 500) || 'name_too_long',
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

  private readonly __maybeRenderTextField = ({ field }: TextFieldParams) => {
    const bsid = field.replace(/_/, '-');
    if (this.hiddenSelector.matches(bsid)) return '';

    return html`
      <div>
        ${this.renderTemplateOrSlot(`${bsid}:before`)}

        <vaadin-text-field
          class="w-full"
          label=${this.t(field).toString()}
          value=${ifDefined(this.form?.[field]?.toString())}
          error-message=${this.__getErrorMessage(field)}
          data-testid=${field}
          .checkValidity=${this.__getValidator(field)}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches(bsid)}
          ?readonly=${this.readonlySelector.matches(bsid)}
          @input=${this.__bindField(field)}
          @keydown=${this.__handleKeyDown}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot(`${bsid}:after`)}
      </div>
    `;
  };

  private readonly __renderVisibility = () => {
    const { disabledSelector, form, lang, ns } = this;
    const isDisabled = !this.in('idle') || disabledSelector.matches('visibility', true);

    return html`
      <div data-testid="visibility">
        ${this.renderTemplateOrSlot('visibility:before')}

        <vaadin-checkbox
          ?disabled=${isDisabled}
          ?checked=${!form.is_hidden}
          @change=${(evt: CustomEvent) => {
            const checkbox = evt.currentTarget as CheckboxElement;
            this.edit({ is_hidden: !checkbox.checked });
          }}
        >
          <foxy-i18n lang=${lang} key="show_on_receipt" ns=${ns}></foxy-i18n>
        </vaadin-checkbox>

        ${this.renderTemplateOrSlot('visibility:after')}
      </div>
    `;
  };

  private readonly __renderTimestamps = () => {
    const items = (['date_modified', 'date_created'] as const).map(field => ({
      name: this.t(field),
      value: this.data?.[field]
        ? this.t('date', { value: new Date(this.data[field] as string) })
        : '',
    }));

    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}
        <x-property-table .items=${items} data-testid="timestamps"></x-property-table>
        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  };

  private readonly __renderDelete = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('delete:before')}

        <vaadin-button
          class="w-full"
          data-testid="delete"
          theme="error primary"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('delete', true)}
          @click=${this.__handleDeleteClick}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="delete"></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('delete:after')}
      </div>
    `;
  };

  private readonly __renderCreate = () => {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="success primary"
          ?disabled=${!this.in('idle') || !isValid || this.disabledSelector.matches('create', true)}
          @click=${() => this.submit()}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="create"></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const { hiddenSelector, data, lang, ns } = this;
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <foxy-internal-confirm-dialog
        data-testid="confirm"
        message="delete_prompt"
        confirm="delete"
        cancel="cancel"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        @hide=${this.__handleConfirmHide}
      >
      </foxy-internal-confirm-dialog>

      <div class="relative" aria-busy=${this.in('busy')} aria-live="polite">
        <div class="grid grid-cols-1 gap-l">
          ${this.__maybeRenderTextField({ field: 'name' })}
          ${this.__maybeRenderTextField({ field: 'value' })}
          ${hiddenSelector.matches('visibility', true) ? '' : this.__renderVisibility()}
          ${hiddenSelector.matches('timestamps', true) || !data ? '' : this.__renderTimestamps()}
          ${hiddenSelector.matches('delete', true) || !data ? '' : this.__renderDelete()}
          ${hiddenSelector.matches('create', true) || data ? '' : this.__renderCreate()}
        </div>

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
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__bindField.cache.clear?.();
    this.__getValidator.cache.clear?.();
  }

  private get __confirmDialog(): InternalConfirmDialog {
    return this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }

  private __handleDeleteClick(evt: Event) {
    this.__confirmDialog.show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
