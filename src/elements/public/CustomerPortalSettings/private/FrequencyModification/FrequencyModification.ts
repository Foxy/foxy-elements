import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { Checkbox, Group, I18N, Section } from '../../../../private/index';
import { FrequencyList } from '../FrequencyList/FrequencyList';
import { FrequencyListChangeEvent } from '../FrequencyList/FrequencyListChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { FrequencyModificationChangeEvent } from './FrequencyModificationChangeEvent';
import { FrequencyModificationRule } from './FrequencyModificationRule';

export class FrequencyModification extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-frequency-list': FrequencyList,
      'x-jsonata-input': JSONataInput,
      'x-checkbox': Checkbox,
      'x-section': Section,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  @property({ type: Object })
  public value: boolean | FrequencyModificationRule = false;

  @property({ type: Boolean })
  public disabled = false;

  public constructor() {
    super('customer-portal-settings');
  }

  private get __normalizedValue() {
    return {
      jsonataQuery: this.__normalizedQuery,
      values: this.__normalizedValues,
    };
  }

  private get __normalizedQuery() {
    return typeof this.value === 'boolean' ? '*' : this.value.jsonataQuery;
  }

  private get __normalizedValues() {
    return typeof this.value === 'boolean' ? [] : this.value.values;
  }

  public render(): TemplateResult {
    const disabled = this.disabled || this.value === false;

    return html`
      <x-checkbox
        data-testid="toggle"
        .checked=${Boolean(this.value)}
        .disabled=${this.disabled || !this._isI18nReady}
        @change=${this.__toggleValue}
      >
        <x-section>
          <x-i18n slot="title" .ns=${this.ns} .lang=${this.lang} key="fmod.title"></x-i18n>
          <x-i18n slot="subtitle" .ns=${this.ns} .lang=${this.lang} key="fmod.subtitle"></x-i18n>
        </x-section>

        ${this.value
          ? html`
              <div class="space-y-m pt-m" slot="content">
                <x-group frame>
                  <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="fmod.match"></x-i18n>
                  <x-jsonata-input
                    data-testid="jsonata"
                    .lang=${this.lang}
                    .value=${this.__normalizedQuery}
                    .disabled=${disabled || !this._isI18nReady}
                    @change=${this.__handleQueryChange}
                  >
                  </x-jsonata-input>
                </x-group>

                <x-group frame>
                  <x-i18n
                    slot="header"
                    .ns=${this.ns}
                    .lang=${this.lang}
                    key="fmod.options"
                  ></x-i18n>
                  <x-frequency-list
                    data-testid="frequency"
                    .lang=${this.lang}
                    .value=${this.__normalizedValues}
                    .disabled=${disabled || !this._isI18nReady}
                    @change=${this.__handleValuesChange}
                  >
                  </x-frequency-list>
                </x-group>
              </div>
            `
          : ''}
      </x-checkbox>
    `;
  }

  private __handleQueryChange(evt: JSONataInputChangeEvent) {
    this.value = { ...this.__normalizedValue, jsonataQuery: evt.detail as string };
    this.__sendChange();
  }

  private __handleValuesChange(evt: FrequencyListChangeEvent) {
    this.value = { ...this.__normalizedValue, values: evt.detail };
    this.__sendChange();
  }

  private __toggleValue() {
    this.value = !this.value;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyModificationChangeEvent(this.value));
  }
}
