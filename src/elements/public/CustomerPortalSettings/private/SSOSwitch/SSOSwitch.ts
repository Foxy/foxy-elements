import { I18N, Section } from '../../../../private/index';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { SSOSwitchChangeEvent } from './SSOSwitchChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Switch } from '../../../../private/Switch/Switch';
import { Translatable } from '../../../../../mixins/translatable';

export class SSOSwitch extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-section': Section,
      'x-switch': Switch,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Array },
    };
  }

  public disabled = false;

  public value = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-section>
        <x-switch
          slot="title"
          class="-my-xs"
          data-testid="toggle"
          .checked=${Boolean(this.value)}
          .disabled=${this.disabled || !this._isI18nReady}
          @change=${this.__toggleValue}
        >
          <x-i18n .ns=${this.ns} .lang=${this.lang} key="sso.title" class="text-l"></x-i18n>
        </x-switch>

        <x-i18n .ns=${this.ns} .lang=${this.lang} key="sso.subtitle" slot="subtitle" class="mr-xl">
        </x-i18n>
      </x-section>
    `;
  }

  private __toggleValue() {
    this.value = !this.value;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new SSOSwitchChangeEvent(this.value));
  }
}
