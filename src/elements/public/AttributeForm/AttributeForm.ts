import { Choice, Group, PropertyTable } from '../../private/index';
import { Data, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ChoiceChangeEvent } from '../../private/events';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';

const NS = 'attribute-form';
const Base = TranslatableMixin(
  ConfigurableMixin(ThemeableMixin(ScopedElementsMixin(NucleonElement))),
  NS
);

/**
 * Form element for creating or editing attributes.
 *
 * Configurable controls **(new in v1.4.0)**:
 *
 * - `name`
 * - `value`
 * - `visibility`
 * - `timestamps`
 * - `delete`
 * - `create`
 *
 * @slot name:before - **new in v1.4.0**
 * @slot name:after - **new in v1.4.0**
 * @slot value:before - **new in v1.4.0**
 * @slot value:after - **new in v1.4.0**
 * @slot visibility:before - **new in v1.4.0**
 * @slot visibility:after - **new in v1.4.0**
 * @slot timestamps:before - **new in v1.4.0**
 * @slot timestamps:after - **new in v1.4.0**
 * @slot create:before - **new in v1.4.0**
 * @slot create:after - **new in v1.4.0**
 * @slot delete:before - **new in v1.4.0**
 * @slot delete:after - **new in v1.4.0**
 *
 * @element foxy-attribute-form
 * @since 1.2.0
 */
export class AttributeForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-confirm-dialog': InternalConfirmDialog,
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'x-property-table': PropertyTable,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-choice': Choice,
      'x-group': Group,
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

  private static readonly __visibilityOptions = ['private', 'restricted', 'public'] as const;

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
        <slot name="${bsid}:before"></slot>

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

        <slot name="${bsid}:after"></slot>
      </div>
    `;
  };

  private readonly __renderVisibility = () => {
    const { disabledSelector, readonlySelector, form, lang, ns } = this;
    const isBusyOrFailed = !this.in('idle');
    const isDisabled = isBusyOrFailed || disabledSelector.matches('visibility', true);

    return html`
      <div>
        <slot name="visibility:before"></slot>

        <x-group frame>
          <foxy-i18n
            class=${classMap({ 'text-disabled': isDisabled })}
            lang=${lang}
            slot="header"
            key="visibility"
            ns=${ns}
          >
          </foxy-i18n>

          <x-choice
            data-testid="visibility"
            lang=${lang}
            ns=${ns}
            .items=${AttributeForm.__visibilityOptions}
            .value=${(form?.visibility ?? 'private') as any}
            ?disabled=${isBusyOrFailed || disabledSelector.matches('visibility', true)}
            ?readonly=${readonlySelector.matches('visibility', true)}
            @change=${this.__handleChoiceChange}
          >
            <foxy-i18n slot="private-label" lang=${lang} key="visibility_private" ns=${ns}>
            </foxy-i18n>

            <foxy-i18n slot="restricted-label" lang=${lang} key="visibility_restricted" ns=${ns}>
            </foxy-i18n>

            <foxy-i18n ns=${ns} lang=${lang} slot="public-label" key="visibility_public">
            </foxy-i18n>
          </x-choice>
        </x-group>

        <slot name="visibility:after"></slot>
      </div>
    `;
  };

  private readonly __renderTimestamps = () => {
    const items = (['date_modified', 'date_created'] as const).map(field => ({
      name: this.t(field),
      value: this.t('date', { value: new Date(this.data![field]) }),
    }));

    return html`
      <div>
        <slot name="timestamps:before"></slot>
        <x-property-table .items=${items}></x-property-table>
        <slot name="timestamps:after"></slot>
      </div>
    `;
  };

  private readonly __renderDelete = () => {
    return html`
      <div>
        <slot name="delete:before"></slot>

        <vaadin-button
          class="w-full"
          data-testid="delete"
          theme="error primary"
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('delete', true)}
          @click=${this.__handleDeleteClick}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="delete"></foxy-i18n>
        </vaadin-button>

        <slot name="delete:after"></slot>
      </div>
    `;
  };

  private readonly __renderCreate = () => {
    const isTemplateValid = this.in({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = this.in({ idle: { snapshot: { dirty: 'valid' } } });
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <div>
        <slot name="create:before"></slot>

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="success primary"
          ?disabled=${!this.in('idle') || !isValid || this.disabledSelector.matches('create', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="create"></foxy-i18n>
        </vaadin-button>

        <slot name="create:after"></slot>
      </div>
    `;
  };

  render(): TemplateResult {
    const { hiddenSelector, data, lang, ns } = this;
    const isBusy = this.in('busy');

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
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': !isBusy,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${lang}
            ns=${ns}
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

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.edit({ visibility: evt.detail as Data['visibility'] });
  }

  private __handleDeleteClick(evt: Event) {
    this.__confirmDialog.show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: DialogHideEvent) {
    if (!evt.detail.cancelled) this.delete();
  }
}
