import { Data, Templates } from './types';
import { TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';

const NS = 'access-recovery-form';
const Base = ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)));

/**
 * Email-based "forgot password" form.
 *
 * @slot email:before
 * @slot email:after
 *
 * @slot message:before
 * @slot message:after
 *
 * @slot submit:before
 * @slot submit:after
 *
 * @element foxy-access-recovery-form
 * @since 1.4.0
 */
export class AccessRecoveryForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ detail: d }) => (d?.email && d.email.length > 0) || 'email_required',
      ({ detail: d }) => isEmail(d?.email ?? '') || 'email_invalid_email',
    ];
  }

  templates: Templates = {};

  private readonly __checkEmailValidity = () => {
    return !this.errors.some(err => err.startsWith('email'));
  };

  private readonly __renderEmail = () => {
    const isFailed = this.in('fail');
    const isBusy = this.in('busy');

    const emailErrors = this.errors.filter(error => error.startsWith('email'));
    const emailErrorKeys = emailErrors.map(error => error.replace('email', 'v8n'));
    const emailErrorMessage = emailErrorKeys[0] ? this.t(emailErrorKeys[0]).toString() : '';

    const handleKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === 'Enter') this.submit();
    };

    const handleInput = (evt: InputEvent) => {
      this.edit({
        detail: { email: (evt.target as EmailFieldElement).value },
        type: 'email',
      });
    };

    return html`
      ${this._renderTemplateOrSlot('email:before')}

      <vaadin-email-field
        error-message=${emailErrorMessage}
        data-testid="email"
        class="w-full"
        label=${this.t('email').toString()}
        value=${ifDefined(this.form.detail?.email)}
        ?disabled=${isBusy || isFailed || this.disabledSelector.matches('email', true)}
        ?readonly=${this.readonlySelector.matches('email', true)}
        .checkValidity=${this.__checkEmailValidity}
        @input=${handleInput}
        @keydown=${handleKeyDown}
      >
      </vaadin-email-field>

      ${this._renderTemplateOrSlot('email:after')}
    `;
  };

  private readonly __renderMessage = () => {
    const isFailed = this.in('fail');
    const color = isFailed ? 'bg-error-10 text-error' : 'bg-success-10 text-success';
    const icon = isFailed ? 'lumo:error' : 'lumo:cog';
    const key = isFailed ? 'unknown_error' : 'recover_access_success';

    return html`
      ${this._renderTemplateOrSlot('message:before')}

      <p class="leading-s flex items-start text-s rounded p-s ${color}">
        <iron-icon class="flex-shrink-0 mr-s" icon=${icon}></iron-icon>
        <foxy-i18n lang=${this.lang} key=${key} ns=${this.ns} data-testid="message"></foxy-i18n>
      </p>

      ${this._renderTemplateOrSlot('message:after')}
    `;
  };

  private readonly __renderSubmit = () => {
    const isFailed = this.in('fail');
    const isValid = this.errors.length === 0;
    const isBusy = this.in('busy');

    return html`
      ${this._renderTemplateOrSlot('submit:before')}

      <vaadin-button
        data-testid="submit"
        class="w-full"
        theme="primary"
        ?disabled=${isBusy || !isValid || isFailed || this.disabledSelector.matches('submit', true)}
        @click=${this.submit}
      >
        <foxy-i18n lang=${this.lang} key="recover_access" ns=${this.ns}></foxy-i18n>
      </vaadin-button>

      ${this._renderTemplateOrSlot('submit:after')}
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const isDone = this.in({ idle: 'snapshot' }) || this.in('fail');
    const isBusy = this.in('busy');

    return html`
      <main
        data-testid="wrapper"
        aria-live="polite"
        aria-busy=${isBusy}
        class="relative font-lumo text-m leading-m space-y-m"
      >
        ${hiddenSelector.matches('email', true) ? '' : this.__renderEmail()}
        ${hiddenSelector.matches('message', true) || !isDone ? '' : this.__renderMessage()}
        ${hiddenSelector.matches('submit', true) ? '' : this.__renderSubmit()}

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state="busy"
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-spinner>
        </div>
      </main>
    `;
  }
}
