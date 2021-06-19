import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { Group, I18N, List, Skeleton } from '../../../../private';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { ListChangeEvent } from '../../../../private/events';
import { OriginsListChangeEvent } from './OriginsListChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';

export class OriginsList extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-group': Group,
      'x-i18n': I18N,
      'x-list': List,
      'x-skeleton': Skeleton,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      invalid: { type: Boolean },
      value: { type: Array },
    };
  }

  public value: string[] = [];

  public disabled = false;

  private __errorCode: 'invalid' | 'https_only' = 'invalid';

  private __invalid = false;

  private __newValue = '';

  public render(): TemplateResult {
    return html`
      <x-group frame>
        <x-list
          data-testid="list"
          .disabled=${this.disabled || !this._isI18nReady}
          .value=${this.value}
          @change=${this.__handleChange}
        >
          ${this.value.map((item, index) =>
            this._isI18nReady
              ? html`
                  <div class="flex items-center" slot=${index}>
                    <img
                      height="16"
                      width="16"
                      class="mr-m"
                      src="https://www.google.com/s2/favicons?domain=${item}"
                    />
                    ${item}
                  </div>
                `
              : html`<x-skeleton slot=${index}>${item}</x-skeleton>`
          )}

          <div class="flex flex-col space-y-s sm-space-y-0 sm-flex-row sm-space-x-s sm-items-start">
            <vaadin-text-field
              data-testid="input"
              .placeholder=${this._isI18nReady ? 'https://foxy.io' : ''}
              .errorMessage=${this._t(`origins.${this.__errorCode}`).toString()}
              .disabled=${this.disabled || !this._isI18nReady}
              .invalid=${this.__invalid}
              .value=${this.__newValue}
              @keypress=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.__submit()}
              @change=${(evt: InputEvent) => evt.stopPropagation()}
              @input=${this.__handleInput}
            >
            </vaadin-text-field>

            <div class="sm-flex sm-items-center">
              <vaadin-button
                class="w-full sm-w-auto"
                data-testid="button"
                .disabled=${!this._isI18nReady ||
                this.disabled ||
                this.__invalid ||
                this.value.length >= 10}
                @click=${this.__submit}
              >
                <x-i18n .ns=${this.ns} .lang=${this.lang} key="origins.add"></x-i18n>
                <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
              </vaadin-button>

              <x-i18n
                .lang=${this.lang}
                .ns=${this.ns}
                key="origins.add_hint"
                class=${classMap({
                  hidden: this.value.length === 0,
                  'text-primary': this.value.length >= 10,
                  'text-tertiary': this.value.length < 10,
                  'text-xs text-center block font-lumo mt-xs transition duration-200 sm-mt-0 sm-ml-m':
                    true,
                })}
              >
              </x-i18n>
            </div>
          </div>
        </x-list>
      </x-group>
    `;
  }

  private __sendChange() {
    this.dispatchEvent(new OriginsListChangeEvent(this.value));
  }

  private __handleInput(evt: InputEvent) {
    this.__newValue = (evt.target as HTMLInputElement).value;

    try {
      const url = new URL(this.__newValue);
      const isSecure = url.protocol === 'https:';
      const isLocalhost = url.hostname === 'localhost';

      this.__invalid = !isLocalhost && !isSecure;
      this.__errorCode = 'https_only';
    } catch {
      this.__invalid = this.__newValue.length > 0;
      this.__errorCode = 'invalid';
    }

    this.requestUpdate();
  }

  private __submit() {
    if (this.__newValue.length > 0) {
      this.value = [...this.value, new URL(this.__newValue).origin];
      this.__newValue = '';
      this.__invalid = false;
      this.__sendChange();
    }

    this.requestUpdate();
  }

  private __handleChange(evt: ListChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }
}
