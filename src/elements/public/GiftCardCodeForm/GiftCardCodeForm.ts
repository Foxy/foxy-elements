import { Data, Templates } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/index';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'gift-card-code-form';
const Base = ConfigurableMixin(
  ThemeableMixin(ScopedElementsMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for creating or editing gift card codes (`fx:gift_card_code`).
 *
 * @slot code:before
 * @slot code:after
 *
 * @slot current-balance:before
 * @slot current-balance:after
 *
 * @slot end-date:before
 * @slot end-date:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-gift-card-code-form
 * @since 1.15.0
 */
export class GiftCardCodeForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-number-field': customElements.get('vaadin-number-field'),
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),

      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-property-table': PropertyTable,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ code: v }) => !!v || 'code_required',
      ({ code: v }) => !v || v.length <= 50 || 'code_too_long',
      ({ current_balance: v }) => !!v || 'current_balance_required',
      ({ current_balance: v }) => !v || !isNaN(v) || 'current_balance_required',
    ];
  }

  templates: Templates = {};

  render(): TemplateResult {
    return html`
      <div class="relative space-y-m">
        ${this.__isCodeHidden ? null : this.__renderCode()}
        ${this.__isCurrentBalanceHidden ? null : this.__renderCurrentBalance()}
        ${this.__isEndDateHidden ? null : this.__renderEndDate()}
        ${this.__isTimestampsHidden ? null : this.__renderTimestamps()}
        ${this.__isCreateHidden ? null : this.__renderCreate()}
        ${this.__isDeleteHidden ? null : this.__renderDelete()}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !this.in('busy') && !this.in('fail'),
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private get __isCodeHidden(): boolean {
    return this.hiddenSelector.matches('code', true);
  }

  private get __isCurrentBalanceHidden(): boolean {
    return this.hiddenSelector.matches('current-balance', true);
  }

  private get __isEndDateHidden(): boolean {
    return this.hiddenSelector.matches('end-date', true);
  }

  private get __isTimestampsHidden(): boolean {
    if (this.hiddenSelector.matches('timestamps', true)) return true;
    return !this.data;
  }

  private get __isCreateHidden(): boolean {
    if (this.hiddenSelector.matches('create', true)) return true;
    return !!this.data;
  }

  private get __isDeleteHidden(): boolean {
    if (this.hiddenSelector.matches('delete', true)) return true;
    return !this.data;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __getValidator(prefix: string) {
    return () => !this.errors.some(err => err.startsWith(prefix));
  }

  private __renderCode(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('code:before')}

        <vaadin-text-field
          data-testid="code"
          class="w-full"
          label=${this.t('code')}
          .checkValidity=${this.__getValidator('code')}
          .errorMessage=${this.__getErrorMessage('code')}
          .value=${this.form.code}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('code', true)}
          ?readonly=${this.readonlySelector.matches('code', true)}
          required
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: CustomEvent) => {
            const newCode = (evt.currentTarget as TextFieldElement).value;
            this.edit({ code: newCode });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot('code:after')}
      </div>
    `;
  }

  private __renderCurrentBalance(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('current-balance:before')}

        <vaadin-number-field
          data-testid="current-balance"
          class="w-full"
          label=${this.t('current_balance')}
          min="0"
          .checkValidity=${this.__getValidator('current_balance')}
          .errorMessage=${this.__getErrorMessage('current_balance')}
          .value=${this.form.current_balance}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('current-balance', true)}
          ?readonly=${this.readonlySelector.matches('current-balance', true)}
          prevent-invalid-input
          has-controls
          required
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @change=${(evt: CustomEvent) => {
            const newCurrentBalance = (evt.currentTarget as TextFieldElement).value;
            this.edit({ current_balance: parseFloat(newCurrentBalance) });
          }}
        >
        </vaadin-number-field>

        ${this.renderTemplateOrSlot('current-balance:after')}
      </div>
    `;
  }

  private __renderEndDate(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('end-date:before')}

        <vaadin-date-picker
          data-testid="end-date"
          class="w-full"
          label=${this.t('end_date')}
          min="0"
          .checkValidity=${this.__getValidator('end_date')}
          .errorMessage=${this.__getErrorMessage('end_date')}
          .value=${this.form.end_date}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('end-date', true)}
          ?readonly=${this.readonlySelector.matches('end-date', true)}
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @change=${(evt: CustomEvent) => {
            const newEndDate = (evt.currentTarget as TextFieldElement).value;
            this.edit({ end_date: newEndDate });
          }}
        >
        </vaadin-date-picker>

        ${this.renderTemplateOrSlot('end-date:after')}
      </div>
    `;
  }

  private __renderTimestamps(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-property-table
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-property-table>

        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  }

  private __renderCreate(): TemplateResult {
    const isCleanTemplateInvalid = this.in({ idle: { template: { clean: 'invalid' } } });
    const isDirtyTemplateInvalid = this.in({ idle: { template: { dirty: 'invalid' } } });
    const isCleanSnapshotInvalid = this.in({ idle: { snapshot: { clean: 'invalid' } } });
    const isDirtySnapshotInvalid = this.in({ idle: { snapshot: { dirty: 'invalid' } } });
    const isTemplateInvalid = isCleanTemplateInvalid || isDirtyTemplateInvalid;
    const isSnaphotInvalid = isCleanSnapshotInvalid || isDirtySnapshotInvalid;
    const isInvalid = isTemplateInvalid || isSnaphotInvalid;
    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="primary success"
          ?disabled=${isBusy || isInvalid || this.disabledSelector.matches('create', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} key="create" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  }

  private __renderDelete(): TemplateResult {
    return html`
      <div>
        <foxy-internal-confirm-dialog
          data-testid="confirm"
          message="delete_prompt"
          confirm="delete"
          cancel="cancel"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.delete()}
        >
        </foxy-internal-confirm-dialog>

        ${this.renderTemplateOrSlot('delete:before')}

        <vaadin-button
          data-testid="delete"
          theme="primary error"
          class="w-full"
          ?disabled=${this.in('busy') || this.disabledSelector.matches('delete', true)}
          @click=${(evt: CustomEvent) => {
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
            confirm.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n ns=${this.ns} key="delete" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('delete:after')}
      </div>
    `;
  }
}
