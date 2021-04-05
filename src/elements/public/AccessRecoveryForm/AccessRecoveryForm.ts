import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  html,
} from 'lit-element';

import { API } from '../NucleonElement/API';
import { EmailFieldElement } from '@vaadin/vaadin-text-field/vaadin-email-field';
import { I18n } from '../I18n/I18n';
import { Themeable } from '../../../mixins/themeable';

type State = 'invalid' | 'valid' | 'busy' | 'fail';

/**
 * Email-based "forgot password" form.
 *
 * @fires AccessRecoveryForm#fetch - Instance of `AccessRecoveryForm.API.FetchEvent`. Emitted before each API request.
 *
 * @element foxy-access-recovery-form
 * @since 1.4.0
 */
export class AccessRecoveryForm extends LitElement {
  /** API class constructor used by the instances of this class. */
  static readonly API = API;

  static get properties(): PropertyDeclarations {
    return {
      lang: { type: String },
      email: { type: String },
    };
  }

  static get styles(): CSSResultArray | CSSResult {
    return Themeable.styles;
  }

  /** Optional ISO 639-1 code describing the language element content is written in. */
  lang = '';

  /** User email. Value of this property is bound to the form field. */
  email = '';

  private __state: State = 'invalid';

  private __untrackTranslations?: () => void;

  private static __ns = 'sign-in-form';

  connectedCallback(): void {
    super.connectedCallback();
    const I18nElement = customElements.get('foxy-i18n') as typeof I18n;
    this.__untrackTranslations = I18nElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    return html`
      <div
        aria-live="polite"
        aria-busy=${this.__state === 'busy'}
        class="relative font-lumo text-m leading-m space-y-m"
      >
        <vaadin-email-field
          class="w-full"
          label=${this.__t('email').toString()}
          value=${this.email}
          ?disabled=${this.__state === 'busy'}
          required
          @input=${this.__handleEmailInput}
          @keydown=${this.__handleKeyDown}
        >
        </vaadin-email-field>

        ${this.__state.startsWith('fail')
          ? html`
              <div class="flex items-center text-s bg-error-10 rounded p-s text-error">
                <iron-icon icon="lumo:error" class="self-start flex-shrink-0 mr-s"></iron-icon>
                <foxy-i18n
                  class="leading-s"
                  lang=${this.lang}
                  ns=${AccessRecoveryForm.__ns}
                  key="unknown_error"
                >
                </foxy-i18n>
              </div>
            `
          : ''}

        <vaadin-button
          class="w-full"
          theme="primary"
          ?disabled=${this.__state === 'busy'}
          @click=${this.__submit}
        >
          <foxy-i18n ns=${AccessRecoveryForm.__ns} lang=${this.lang} key="recover_access">
          </foxy-i18n>
        </vaadin-button>

        ${this.__state === 'busy'
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
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

  /** Submits the form if it's valid. */
  submit(): void {
    this.__submit();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private get __t() {
    const I18nElement = customElements.get('foxy-i18n') as typeof I18n;
    return I18nElement.i18next.getFixedT(this.lang, AccessRecoveryForm.__ns);
  }

  private get __emailField() {
    return this.renderRoot.querySelector('vaadin-email-field') as EmailFieldElement;
  }

  private async __submit() {
    if (!this.__emailField.validate()) return;

    this.__setState('busy');

    const response = await new API(this).fetch('foxy://auth/recover', {
      method: 'POST',
      body: JSON.stringify({
        type: 'email',
        detail: { email: this.email },
      }),
    });

    this.__setState(response.ok ? 'valid' : 'fail');
  }

  private __setState(newState: State) {
    this.__state = newState;
    this.requestUpdate();
  }

  private __handleKeyDown(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.__submit();
  }

  private __handleEmailInput(evt: InputEvent) {
    this.email = (evt.target as EmailFieldElement).value;
  }
}
