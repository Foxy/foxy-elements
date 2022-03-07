import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'generate-codes';
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Form element for generating codes for coupons or gift cards (`fx:generate_codes`).
 *
 * @slot length:before
 * @slot length:after
 *
 * @slot number-of-codes:before
 * @slot number-of-codes:after
 *
 * @slot prefix:before
 * @slot prefix:after
 *
 * @slot current-balance:before
 * @slot current-balance:after
 *
 * @slot generate:before
 * @slot generate:after
 *
 * @element foxy-generate-codes-form
 * @since 1.15.0
 */
export class GenerateCodesForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ number_of_codes: v }) => (v && v > 0) || 'number_of_codes_required',
      ({ current_balance: v }) => !v || v >= 0 || 'current_balance_negative',
      ({ length: v }) => (v && v > 0) || 'length_required',
    ];
  }

  templates: Templates = {};

  render(): TemplateResult {
    const { hiddenSelector, lang, ns } = this;

    const isBusy = this.in('busy');
    const isFail = this.in('fail');
    const isSnapshot = this.in({ idle: 'snapshot' });
    const isTemplate = this.in({ idle: 'template' });

    const transition = 'transition-opacity duration-500';
    const hidden = 'opacity-0 pointer-events-none';

    return html`
      <div aria-busy=${isBusy} aria-live="polite" class="relative">
        <div
          class=${classMap({
            'grid grid-cols-2 gap-m': true,
            [transition]: true,
            [hidden]: isSnapshot,
          })}
        >
          ${hiddenSelector.matches('length', true) ? '' : this.__renderLength()}
          ${hiddenSelector.matches('number-of-codes', true) ? '' : this.__renderNumberOfCodes()}
          ${hiddenSelector.matches('current-balance', true) ? '' : this.__renderCurrentBalance()}
          ${hiddenSelector.matches('prefix', true) ? '' : this.__renderPrefix()}
          ${hiddenSelector.matches('generate', true) ? '' : this.__renderGenerate()}
        </div>

        <div
          class=${classMap({
            'absolute inset-0 flex flex-col items-center justify-center': true,
            'text-center text-m text-secondary leading-m': true,
            [transition]: true,
            [hidden]: !isSnapshot,
          })}
        >
          <div class="mx-auto flex mb-m w-l h-l rounded-t-l rounded-b-l bg-success">
            <iron-icon icon="icons:done-all" class="m-auto text-success-contrast"></iron-icon>
          </div>

          <foxy-i18n class="block" lang=${lang} key="generate_codes_done" ns=${ns}></foxy-i18n>
        </div>

        <div
          class=${classMap({
            'absolute inset-0 flex': true,
            [transition]: true,
            [hidden]: !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isTemplate ? 'empty' : 'busy'}
            lang=${lang}
            ns="${ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')) : '';
  }

  private __getValidator(prefix: string) {
    return () => !this.errors.some(err => err.startsWith(prefix));
  }

  private __renderLength() {
    const isTemplate = this.in({ idle: 'template' });

    return html`
      ${this.renderTemplateOrSlot('length:before')}

      <vaadin-integer-field
        error-message=${this.__getErrorMessage('length')}
        label=${this.t('length')}
        class="w-full"
        min="1"
        ?disabled=${!isTemplate || this.disabledSelector.matches('length', true)}
        ?readonly=${this.readonlySelector.matches('length', true)}
        prevent-invalid-input
        has-controls
        .checkValidity=${this.__getValidator('length')}
        .value=${isTemplate ? this.form.length : ''}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as IntegerFieldElement;
          this.edit({ length: parseInt(field.value) });
        }}
      >
      </vaadin-integer-field>

      ${this.renderTemplateOrSlot('length:after')}
    `;
  }

  private __renderNumberOfCodes() {
    const isTemplate = this.in({ idle: 'template' });

    return html`
      ${this.renderTemplateOrSlot('number-of-codes:before')}

      <vaadin-integer-field
        error-message=${this.__getErrorMessage('number_of_codes')}
        label=${this.t('number_of_codes')}
        class="w-full"
        min="1"
        ?disabled=${!isTemplate || this.disabledSelector.matches('number-of-codes', true)}
        ?readonly=${this.readonlySelector.matches('number-of-codes', true)}
        prevent-invalid-input
        has-controls
        .checkValidity=${this.__getValidator('number_of_codes')}
        .value=${isTemplate ? this.form.number_of_codes : ''}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as IntegerFieldElement;
          this.edit({ number_of_codes: parseInt(field.value) });
        }}
      >
      </vaadin-integer-field>

      ${this.renderTemplateOrSlot('number-of-codes:after')}
    `;
  }

  private __renderCurrentBalance() {
    const isTemplate = this.in({ idle: 'template' });

    return html`
      ${this.renderTemplateOrSlot('current-balance:before')}

      <vaadin-integer-field
        error-message=${this.__getErrorMessage('current_balance')}
        label=${this.t('balance')}
        class="w-full col-span-2"
        min="0"
        ?disabled=${!isTemplate || this.disabledSelector.matches('current-balance', true)}
        ?readonly=${this.readonlySelector.matches('current-balance', true)}
        prevent-invalid-input
        has-controls
        .checkValidity=${this.__getValidator('current_balance')}
        .value=${isTemplate ? this.form.current_balance ?? 0 : ''}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as IntegerFieldElement;
          this.edit({ current_balance: parseInt(field.value) });
        }}
      >
      </vaadin-integer-field>

      ${this.renderTemplateOrSlot('current-balance:after')}
    `;
  }

  private __renderPrefix() {
    const isTemplate = this.in({ idle: 'template' });

    return html`
      ${this.renderTemplateOrSlot('prefix:before')}

      <vaadin-text-field
        helper-text=${this.t('leave_empty_for_random_codes')}
        label=${this.t('prefix')}
        class="col-span-2"
        min="1"
        ?disabled=${!isTemplate || this.disabledSelector.matches('prefix', true)}
        ?readonly=${this.readonlySelector.matches('prefix', true)}
        clear-button-visible
        .value=${isTemplate ? this.form.prefix : ''}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as TextFieldElement;
          this.edit({ prefix: field.value });
        }}
      >
      </vaadin-text-field>

      ${this.renderTemplateOrSlot('prefix:after')}
    `;
  }

  private __renderGenerate() {
    const isValidTemplate = this.in({ idle: { template: { dirty: 'valid' } } });

    return html`
      ${this.renderTemplateOrSlot('generate:before')}

      <vaadin-button
        class="col-span-2"
        theme="success primary"
        ?disabled=${!isValidTemplate || this.disabledSelector.matches('generate', true)}
        @click=${this.submit}
      >
        <foxy-i18n lang=${this.lang} key="generate" ns=${this.ns}></foxy-i18n>
      </vaadin-button>

      ${this.renderTemplateOrSlot('create:after')}
    `;
  }
}
