import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { FxCustomerPortalSettings } from '../../../../../types/hapi';
import type { ScopedElementsMap } from '@open-wc/scoped-elements';

import { PasswordFieldElement } from '@vaadin/vaadin-text-field/vaadin-password-field';
import { SignUpChangeEvent } from './SignUpChangeEvent';
import { I18N, Section } from '../../../../private/index';
import { Translatable } from '../../../../../mixins/translatable';
import { Switch } from '../../../../private/Switch/Switch';
import { html } from 'lit-element';

import cloneDeep from 'lodash-es/cloneDeep';

export class SignUp extends Translatable {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-password-field': PasswordFieldElement,
      'x-section': Section,
      'x-switch': Switch,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Object },
    };
  }

  disabled = false;

  value: FxCustomerPortalSettings['signUp'] = undefined;

  constructor() {
    super('customer-portal-settings');
  }

  render(): TemplateResult {
    return html`
      <x-section>
        <x-switch
          data-testid="toggle"
          class="-my-xs"
          slot="title"
          .disabled=${this.disabled || !this._isI18nReady}
          .checked=${this.__normalizedValue.enabled}
          @change=${() => {
            const newValue = this.__normalizedValue;
            newValue.enabled = !newValue.enabled;

            if (!newValue.enabled) {
              newValue.verification.siteKey = '';
              newValue.verification.secretKey = '';
            }

            this.value = newValue;
            this.requestUpdate();
            this.__sendChange();
          }}
        >
          <x-i18n .ns=${this.ns} .lang=${this.lang} key="sign_up.title" class="text-l"></x-i18n>
        </x-switch>

        <x-i18n
          class="mr-xl"
          slot="subtitle"
          key="sign_up.subtitle"
          .lang=${this.lang}
          .ns=${this.ns}
        >
        </x-i18n>

        ${this.__normalizedValue?.enabled
          ? html`
              <div class="grid gap-m sm-grid-cols-2">
                <vaadin-password-field
                  .placeholder=${this._isI18nReady
                    ? this._t('sign_up.site_key_placeholder').toString()
                    : '---'}
                  .disabled=${this.disabled || !this._isI18nReady}
                  .value=${this._isI18nReady ? this.value?.verification.siteKey : ''}
                  .label=${this._isI18nReady ? this._t('sign_up.site_key_label').toString() : '---'}
                  autocomplete="off"
                  data-testid="site-key"
                  @change=${(evt: InputEvent) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) => {
                    const newValue = this.__normalizedValue;
                    newValue.verification.siteKey = (evt.target as PasswordFieldElement).value;
                    this.value = newValue;
                    this.requestUpdate();
                    this.__sendChange();
                  }}
                >
                </vaadin-password-field>

                <vaadin-password-field
                  .placeholder=${this._isI18nReady
                    ? this._t('sign_up.secret_key_placeholder').toString()
                    : '---'}
                  .disabled=${this.disabled || !this._isI18nReady}
                  .value=${this._isI18nReady ? this.value?.verification.secretKey : ''}
                  .label=${this._isI18nReady
                    ? this._t('sign_up.secret_key_label').toString()
                    : '---'}
                  autocomplete="off"
                  data-testid="secret-key"
                  @change=${(evt: InputEvent) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) => {
                    const newValue = this.__normalizedValue;
                    newValue.verification.secretKey = (evt.target as PasswordFieldElement).value;
                    this.value = newValue;
                    this.requestUpdate();
                    this.__sendChange();
                  }}
                >
                </vaadin-password-field>

                <x-i18n
                  class="sm-col-span-2 text-s text-secondary"
                  lang=${this.lang}
                  key="sign_up.hcaptcha_explainer"
                  ns=${this.ns}
                >
                </x-i18n>
              </div>
            `
          : ''}
      </x-section>
    `;
  }

  private get __normalizedValue(): Required<FxCustomerPortalSettings>['signUp'] {
    if (this.value) return cloneDeep(this.value);
    return {
      verification: { type: 'hcaptcha', siteKey: '', secretKey: '' },
      enabled: false,
    } as const;
  }

  private __sendChange() {
    this.dispatchEvent(new SignUpChangeEvent(this.value));
  }
}
