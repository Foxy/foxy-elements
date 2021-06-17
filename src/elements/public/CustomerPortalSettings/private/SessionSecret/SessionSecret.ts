import '@polymer/iron-icon';
import '@polymer/iron-icons';

import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { I18N } from '../../../../private';
import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../../../mixins/translatable';
import random from 'lodash-es/random';
import times from 'lodash-es/times';

export class SessionSecretChangeEvent extends CustomEvent<{ value: string; invalid: boolean }> {
  constructor(detail: { value: string; invalid: boolean }) {
    super('change', { detail });
  }
}

export class SessionSecret extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-password-field': PasswordFieldElement,
      'vaadin-button': ButtonElement,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { attribute: false },
      value: { attribute: false },
    };
  }

  public disabled = false;

  public value = '';

  private __errorMessage: '' | 'required' | 'invalid' | 'too_short' | 'too_long' = '';

  public render(): TemplateResult {
    const invalid = this.__errorMessage !== '' && !this.disabled;
    const errorMessage = invalid ? this._t(`jwt.${this.__errorMessage}`).toString() : '';

    return html`
      <div class="space-y-xs">
        <div class="flex items-start">
          <vaadin-password-field
            .errorMessage=${errorMessage}
            .disabled=${this.disabled || !this._isI18nReady}
            .invalid=${invalid}
            .value=${this._isI18nReady ? this.value : ''}
            .label=${this._isI18nReady ? this._t('jwt.title').toString() : '---'}
            data-testid="input"
            class="w-full"
            @change=${(evt: InputEvent) => evt.stopPropagation()}
            @input=${this.__handleInput}
          >
          </vaadin-password-field>

          <vaadin-button
            class="flex-shrink-0 ml-s"
            style="margin-top: calc(var(--lumo-font-size-s) * 1.5)"
            theme="error"
            data-testid="button"
            .disabled=${this.disabled || !this._isI18nReady}
            @click=${this.__regenerateValue}
          >
            <x-i18n .lang=${this.lang} .ns=${this.ns} key="jwt.refresh"></x-i18n>
            <iron-icon icon="icons:refresh" slot="suffix"></iron-icon>
          </vaadin-button>
        </div>

        <x-i18n
          .lang=${this.lang}
          .ns=${this.ns}
          key="jwt.subtitle"
          class="text-xs text-tertiary font-lumo"
        >
        </x-i18n>
      </div>
    `;
  }

  public updated(changedProperties: Map<keyof SessionSecret, unknown>): void {
    if (changedProperties.has('value')) this.__reportValidity();
  }

  private __regenerateValue() {
    this.__errorMessage = '';
    this.value = times(72, () => random(35).toString(36)).join('');
    this.dispatchEvent(new SessionSecretChangeEvent({ value: this.value, invalid: false }));
  }

  private __handleInput(evt: InputEvent) {
    this.value = (evt.target as PasswordFieldElement).value;
    this.dispatchEvent(
      new SessionSecretChangeEvent({
        value: this.value,
        invalid: !this.__reportValidity(),
      })
    );
  }

  private __reportValidity() {
    const isAlphaNumeric = (v: string) => /^[a-z0-9-]+$/i.test(v);
    const minLength = 40;
    const maxLength = 100;

    this.__errorMessage =
      this.value.length === 0
        ? 'required'
        : this.value.length < minLength
        ? 'too_short'
        : this.value.length > maxLength
        ? 'too_long'
        : !isAlphaNumeric(this.value)
        ? 'invalid'
        : '';

    this.requestUpdate();

    return this.__errorMessage === '';
  }
}
