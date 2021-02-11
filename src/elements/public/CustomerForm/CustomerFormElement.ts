import { CSSResult, CSSResultArray } from 'lit-element';
import { Data, TextFieldParams } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfirmDialogElement } from '../../private/ConfirmDialog/index';
import { I18NElement } from '../I18N/index';
import { NucleonElement } from '../NucleonElement/index';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTableElement } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';
import { addBreakpoints } from '../../../utils/add-breakpoints';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';
import { memoize } from 'lodash-es';

export class CustomerFormElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
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
      ({ first_name: v }) => !v || v.length <= 50 || 'first_name_too_long',
      ({ last_name: v }) => !v || v.length <= 50 || 'last_name_too_long',
      ({ tax_id: v }) => !v || v.length <= 50 || 'tax_id_too_long',
      ({ email: v }) => (v && v.length > 0) || 'email_required',
      ({ email: v }) => (v && v.length <= 100) || 'email_too_long',
      ({ email: v }) => (v && isEmail(v)) || 'email_invalid',
    ];
  }

  private static __ns = 'customer-form';

  private __getValidator = memoize((prefix: string) => () => {
    return !this.state.context.errors.some(err => err.startsWith(prefix));
  });

  private __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.send({ type: 'EDIT', data: { [key]: target.value } });
    };
  });

  private __untrackTranslations?: () => void;

  private __removeBreakpoins?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
    this.__removeBreakpoins = addBreakpoints(this);
  }

  render(): TemplateResult {
    const { state, lang } = this;
    const ns = CustomerFormElement.__ns;

    const isTemplateValid = state.matches({ idle: { template: { dirty: 'valid' } } });
    const isSnapshotValid = state.matches({ idle: { snapshot: { dirty: 'valid' } } });
    const isDisabled = !state.matches('idle');
    const isValid = isTemplateValid || isSnapshotValid;

    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        @submit=${this.__handleDeleteConfirm}
      >
      </x-confirm-dialog>

      <div class="space-y-l">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-m">
          ${this.__renderTextField({ field: 'first_name' })}
          ${this.__renderTextField({ field: 'last_name' })}
          ${this.__renderTextField({ field: 'email', required: true })}
          ${this.__renderTextField({ field: 'tax_id' })}
        </div>

        ${this.href ? this.__renderPropertyTable() : undefined}

        <vaadin-button
          class="w-full"
          theme=${state.matches('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
          ?disabled=${(state.matches({ idle: 'template' }) && !isValid) || isDisabled}
          @click=${this.__handleActionClick}
        >
          <foxy-i18n ns=${ns} key=${this.href ? 'delete' : 'create'} lang=${lang}></foxy-i18n>
        </vaadin-button>

        ${!state.matches('idle')
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${state.matches('busy') ? 'busy' : 'error'}
                  layout="vertical"
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
    this.__removeBreakpoins?.();
    this.__getValidator.cache.clear?.();
  }

  private get __t() {
    return I18NElement.i18next.getFixedT(this.lang, CustomerFormElement.__ns);
  }

  private __formatDate(date: Date, lang = this.lang): string {
    try {
      return date.toLocaleDateString(lang, {
        month: 'long',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
        day: 'numeric',
      });
    } catch {
      return this.__formatDate(date, I18NElement.fallbackLng);
    }
  }

  private __renderPropertyTable() {
    return html`
      <x-property-table
        .items=${(['date_modified', 'date_created'] as const).map(field => {
          const name = this.__t(field);
          const data = this.state.context.data;
          return { name, value: data ? this.__formatDate(new Date(data[field])) : '' };
        })}
      >
      </x-property-table>
    `;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.state.context.errors.find(err => err.startsWith(prefix));
    return error ? this.__t(error).toString() : '';
  }

  private __renderTextField({ field, required = false }: TextFieldParams) {
    const { state } = this;
    const { data, edits } = state.context;
    const form = { ...data, ...edits } as Partial<Data>;

    return html`
      <vaadin-text-field
        label=${this.__t(field).toString()}
        value=${ifDefined(form?.[field]?.toString())}
        error-message=${this.__getErrorMessage(field)}
        .checkValidity=${this.__getValidator(field)}
        ?disabled=${!state.matches('idle')}
        ?required=${required}
        @input=${this.__bindField(field)}
        @keydown=${this.__handleKeyDown}
      >
      </vaadin-text-field>
    `;
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.send({ type: 'SUBMIT' });
  }

  private __handleActionClick(evt: Event) {
    if (this.state.matches({ idle: 'snapshot' })) {
      const confirm = this.renderRoot.querySelector('#confirm');
      (confirm as ConfirmDialogElement).show(evt.currentTarget as HTMLElement);
    } else {
      this.send({ type: 'SUBMIT' });
    }
  }

  private __handleDeleteConfirm() {
    this.send({ type: 'DELETE' });
  }
}
