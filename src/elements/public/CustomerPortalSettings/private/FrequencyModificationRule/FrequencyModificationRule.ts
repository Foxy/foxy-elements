import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';
import { PropertyDeclarations } from 'lit-element';
import { TemplateResult, html } from 'lit-html';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
import { parseDuration } from '../../../../../utils/parse-duration';
import { prevent } from '../../../../../utils/prevent';
import { Group, I18N } from '../../../../private/index';
import { FrequencyList } from '../FrequencyList/FrequencyList';
import { FrequencyListChangeEvent } from '../FrequencyList/FrequencyListChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { FrequencyModificationRuleChangeEvent } from './FrequencyModificationRuleChangeEvent';
import { FrequencyModificationRuleRemoveEvent } from './FrequencyModificationRuleRemoveEvent';
import { Rule } from './types';

export class FrequencyModificationRule extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-frequency-list': FrequencyList,
      'x-jsonata-input': JSONataInput,
      'iron-icon': customElements.get('iron-icon'),
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { attribute: false },
      value: { attribute: false },
      disabled: { attribute: false },
    };
  }

  public open = false;

  public value: Rule = { jsonataQuery: '*', values: [] };

  public disabled = false;

  public render(): TemplateResult {
    const { jsonataQuery, values } = this.value;
    const openStyle = this.open ? '' : 'rounded-b-l';

    return html`
      <x-group frame>
        <details
          data-testid="details"
          class=${classMap({ 'font-lumo': true, 'pointer-events-none': !this._isI18nReady })}
          ?open=${this.open}
          @toggle=${() => (this.open = !this.open)}
        >
          <summary
            class="${openStyle} cursor-pointer relative leading-s rounded-t-l focus-outline-none focus-shadow-outline"
          >
            <div class="p-m space-y-xs mr-xl">
              <x-i18n
                .ns=${this.ns}
                .lang=${this.lang}
                .key=${`fmod.${jsonataQuery === '*' ? 'all' : 'some'}Title`}
                class="block text-m text-header font-medium"
              >
                ${jsonataQuery !== '*' ? this.__renderJSONataSummary(jsonataQuery) : ''}
              </x-i18n>

              <x-i18n
                .ns=${this.ns}
                .lang=${this.lang}
                class="block text-s text-tertiary"
                key="fmod.valuesLabel"
              >
                <x-i18n
                  .ns=${this.ns}
                  .key=${`fmod.valuesList${values.length === 0 ? 'Empty' : ''}`}
                  .lang=${this.lang}
                  .opts=${{ values: values.map(v => this.__translateFrequency(v)) }}
                  class="text-secondary"
                >
                </x-i18n>
              </x-i18n>
            </div>

            <button
              data-testid="remove"
              .disabled=${this.disabled || !this._isI18nReady}
              class="flex items-center justify-center rounded absolute top-0 right-0 text-tertiary hover-text-secondary disabled-text-tertiary disabled-opacity-50 disabled-cursor-default focus-outline-none focus-shadow-outline"
              style="width: 54px; height: 54px"
              @click=${prevent(() => {
                this.dispatchEvent(new FrequencyModificationRuleRemoveEvent());
              })}
            >
              <iron-icon icon="lumo:cross"></iron-icon>
            </button>
          </summary>

          <div class="space-y-l pt-m" slot="content">
            <x-group>
              <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="fmod.match"></x-i18n>
              <x-jsonata-input
                data-testid="jsonata"
                .ns=${this.ns}
                .lang=${this.lang}
                .value=${this.value.jsonataQuery}
                .disabled=${this.disabled || !this._isI18nReady}
                @change=${this.__handleQueryChange}
              >
              </x-jsonata-input>
            </x-group>

            <x-group>
              <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="fmod.options"> </x-i18n>
              <x-frequency-list
                data-testid="frequency"
                .lang=${this.lang}
                .value=${this.value.values}
                .disabled=${this.disabled || !this._isI18nReady}
                @change=${this.__handleValuesChange}
              >
              </x-frequency-list>
            </x-group>
          </div>
        </details>
      </x-group>
    `;
  }

  private __translateFrequency(frequency: string) {
    if (frequency === '.5m') return this._t('frequency_0_5m');
    const { count, units } = parseDuration(frequency);
    return this._t('frequency', {
      units: this._t(units, { count }),
      count,
    });
  }

  private __renderJSONataSummary(content: string) {
    return html`
      <code class="inline-block rounded bg-success-10 text-success px-xs text-xs leading-s">
        ${content}
      </code>
    `;
  }

  private __handleQueryChange(evt: JSONataInputChangeEvent) {
    this.value = { ...this.value, jsonataQuery: evt.detail as string };
    this.__sendChange();
  }

  private __handleValuesChange(evt: FrequencyListChangeEvent) {
    this.value = { ...this.value, values: evt.detail };
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyModificationRuleChangeEvent(this.value));
  }
}
