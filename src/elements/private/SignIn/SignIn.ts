import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-email-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, TemplateResult } from 'lit-html';
import { interpret } from 'xstate';
import { RequestEvent } from '../../../events/request';
import { Translatable } from '../../../mixins/translatable';
import { Checkbox } from '../Checkbox/Checkbox';
import { CheckboxChangeEvent } from '../Checkbox/CheckboxChangeEvent';
import { I18N } from '../I18N/I18N';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';
import { Warning } from '../Warning/Warning';
import { AuthError, AuthErrorCode, machine } from './machine';

interface VaadinField extends HTMLInputElement {
  validate: () => boolean;
}

export class SignInAuthenticatedEvent extends CustomEvent<void> {
  constructor() {
    super('authenticated');
  }
}

export class SignIn extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'vaadin-email-field': customElements.get('vaadin-email-field'),
      'x-loading-screen': LoadingScreen,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-checkbox': Checkbox,
      'x-warning': Warning,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  private __machine = machine.withConfig({
    services: {
      authenticate: () => this.__authenticate(),
      reset: () => this.__reset(),
    },
  });

  private __service = interpret(this.__machine)
    .onTransition(({ changed }) => changed && this.requestUpdate())
    .onChange(() => this.requestUpdate())
    .start();

  public validate(): boolean {
    const root = this.shadowRoot!;
    const email = root.getElementById('email') as VaadinField;
    const password = root.getElementById('password') as VaadinField | undefined;
    const newPassword = root.getElementById('new-password') as VaadinField | undefined;

    return email.validate() && (password?.validate() ?? true) && (newPassword?.validate() ?? true);
  }

  public submit(): void {
    if (this.validate()) this.__service.send('SUBMIT');
  }

  public render(): TemplateResult {
    const ctx = this.__service.state.context;
    const state = this.__service.state;
    const isBusy = state.matches('authenticating') || state.matches('resetting');
    const isResetRequired = ctx.error === 'reset_required';
    const showPasswordReset = isResetRequired || ctx.error === 'invalid_new_password';

    if (state.matches('reset')) {
      return html`
        <article
          class="bg-base font-lumo text-center leading-m flex flex-col items-center justify-center"
        >
          <iron-icon icon="icons:done" class="text-success w-l h-l mb-m"></iron-icon>

          <header class="text-xl text-header container-narrow font-medium">
            <x-i18n ns=${this.ns} lang=${this.lang} key="password_reset.title"></x-i18n>
          </header>

          <p class="text-m text-secondary container-narrow mb-l">
            <x-i18n ns=${this.ns} lang=${this.lang} key="password_reset.message"></x-i18n>
          </p>

          <div class="flex space-x-m">
            <vaadin-button theme="primary" @click=${() => this.__service.send('RESET')}>
              <x-i18n ns=${this.ns} lang=${this.lang} key="go_back"></x-i18n>
            </vaadin-button>
            <a
              rel="nofollow noreferrer noopener"
              href="mailto:hello@foxy.io"
              target="_blank"
              class="flex items-center h-m px-m text-primary bg-contrast-5 tracking-wide rounded transition-colors duration-200 hover:bg-primary-10 focus:outline-none focus:shadow-outline"
              router-ignore
            >
              <x-i18n ns=${this.ns} lang=${this.lang} key="password_reset.action"></x-i18n>
            </a>
          </div>
        </article>
      `;
    }

    return html`
      <div class="bg-base text-body font-lumo relative">
        <div class="mb-xl flex items-center">
          <x-i18n
            class="text-xl text-body font-medium font-lumo flex-1"
            lang=${this.lang}
            key="sign_in"
            ns=${this.ns}
          >
          </x-i18n>
          <iron-icon icon="icons:lock"></iron-icon>
        </div>

        ${ctx.error
          ? html`
              <x-warning class="-mt-m mb-l">
                <x-i18n
                  lang=${this.lang}
                  key=${isResetRequired ? 'sign_in_reset' : 'sign_in_error'}
                  ns=${this.ns}
                >
                </x-i18n>
              </x-warning>
            `
          : ''}

        <vaadin-email-field
          .readonly=${showPasswordReset}
          .disabled=${isBusy}
          .value=${ctx.email}
          .label=${this._i18n.t('email').toString()}
          error-message=${this._i18n.t('required').toString()}
          autocomplete="email"
          class="w-full py-0 mb-m"
          id="email"
          required
          @keypress=${this.__submitOnEnter}
          @change=${(evt: Event) => evt.stopImmediatePropagation()}
          @input=${(evt: InputEvent) => {
            this.__service.send({
              type: 'SET_EMAIL',
              data: (evt.target as HTMLInputElement).value,
            });
          }}
        >
        </vaadin-email-field>

        ${showPasswordReset
          ? html`
              <vaadin-password-field
                .disabled=${isBusy}
                .value=${ctx.newPassword}
                .label=${this._i18n.t('password_new').toString()}
                error-message=${this._i18n.t('required').toString()}
                autocomplete="new-password"
                class="w-full py-0 mb-xl"
                id="new-password"
                required
                @keypress=${this.__submitOnEnter}
                @change=${(evt: Event) => evt.stopImmediatePropagation()}
                @input=${(evt: InputEvent) => {
                  this.__service.send({
                    type: 'SET_NEW_PASSWORD',
                    data: (evt.target as HTMLInputElement).value,
                  });
                }}
              >
              </vaadin-password-field>
            `
          : html`
              <vaadin-password-field
                .disabled=${isBusy}
                .value=${ctx.password}
                .label=${this._i18n.t(showPasswordReset ? 'password_old' : 'password').toString()}
                error-message=${this._i18n.t('required').toString()}
                autocomplete="current-password"
                class="w-full py-0 mb-m"
                id="password"
                required
                @keypress=${this.__submitOnEnter}
                @change=${(evt: Event) => evt.stopImmediatePropagation()}
                @input=${(evt: InputEvent) => {
                  this.__service.send({
                    type: 'SET_PASSWORD',
                    data: (evt.target as HTMLInputElement).value,
                  });
                }}
              >
              </vaadin-password-field>

              <x-checkbox
                .disabled=${isBusy}
                .checked=${ctx.persistence}
                class="mb-xl"
                @change=${(evt: CheckboxChangeEvent) => {
                  this.__service.send({
                    type: 'SET_PERSISTENCE',
                    data: evt.detail,
                  });
                }}
              >
                <x-i18n key="remember_me" lang=${this.lang} ns=${this.ns}></x-i18n>
              </x-checkbox>
            `}

        <vaadin-button
          .disabled=${isBusy}
          class="w-full mt-0 mb-s"
          theme="primary"
          @click=${this.submit}
        >
          <x-i18n key=${showPasswordReset ? 'continue' : 'sign_in'} lang=${this.lang} ns=${this.ns}>
          </x-i18n>
        </vaadin-button>

        ${showPasswordReset
          ? html`
              <vaadin-button
                theme="tertiary"
                class="w-full my-0"
                @click=${() => this.__service.send('RESET')}
              >
                <x-i18n key="go_back" lang=${this.lang} ns=${this.ns}></x-i18n>
              </vaadin-button>
            `
          : ctx.email
          ? html`
              <vaadin-button
                theme="tertiary"
                class="w-full my-0"
                @click=${() => this.__service.send('SUBMIT_RESET')}
              >
                <x-i18n key="reset_password" lang=${this.lang} ns=${this.ns}></x-i18n>
              </vaadin-button>
            `
          : html`
              <vaadin-button theme="tertiary" class="w-full my-0" disabled>
                <x-i18n key="sign_up" lang=${this.lang} ns=${this.ns}></x-i18n>
              </vaadin-button>
            `}
        ${isBusy ? html` <x-loading-screen></x-loading-screen> ` : ''}
      </div>
    `;
  }

  /**
   * Makes a request to a special URL: `foxy://sign-in`.
   * Expects either one of:
   *  - 200 OK (successful authentication);
   *  - 205 Reset Content (password reset required);
   *  - 401 Unauthorized (incorrect email / password);
   *  - 422 Unprocessable Entity (new password doesn't meet security requirements);
   */
  private async __authenticate() {
    try {
      const ctx = this.__service.state.context;

      const body = JSON.stringify({
        ...(ctx.newPassword ? { newPassword: ctx.newPassword } : {}),
        password: ctx.password,
        email: ctx.email,
      });

      const response = await RequestEvent.emit({
        init: ['foxy://sign-in', { body, method: 'POST' }],
        source: this,
      });

      if (response.status === 200) {
        this.dispatchEvent(new SignInAuthenticatedEvent());
      } else {
        const statusToCode: Record<number, AuthErrorCode> = {
          205: 'reset_required',
          401: 'unauthorized',
          422: 'invalid_new_password',
        };

        throw new AuthError(statusToCode[response.status] ?? 'unknown');
      }
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError('unknown');
    }
  }

  private async __reset() {
    try {
      const { email } = this.__service.state.context;
      const body = JSON.stringify({ email });
      const response = await RequestEvent.emit({
        init: ['foxy://reset-password', { body, method: 'POST' }],
        source: this,
      });

      if (!response.ok) throw new AuthError('unknown');
    } catch (err) {
      if (err instanceof AuthError) throw err;
      throw new AuthError('unknown');
    }
  }

  private __submitOnEnter(evt: KeyboardEvent) {
    if (evt.key === 'Enter') this.submit();
  }
}
