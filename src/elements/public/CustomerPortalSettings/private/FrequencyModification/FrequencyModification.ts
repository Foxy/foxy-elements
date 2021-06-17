import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-lumo-styles/icons';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
import { Group, I18N, Section } from '../../../../private';
import { FrequencyModificationRule } from '../FrequencyModificationRule/FrequencyModificationRule';
import { FrequencyModificationRuleChangeEvent } from '../FrequencyModificationRule/FrequencyModificationRuleChangeEvent';
import { Rule } from '../FrequencyModificationRule/types';
import { FrequencyModificationChangeEvent } from './FrequencyModificationChangeEvent';

export class FrequencyModification extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-frequency-modification-rule': FrequencyModificationRule,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-section': Section,
      'iron-icon': customElements.get('iron-icon'),
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      value: { type: Array },
      disabled: { type: Boolean },
    };
  }

  public value: Rule[] = [];

  public disabled = false;

  public render(): TemplateResult {
    const { ns, lang } = this;

    return html`
      <x-section>
        <x-i18n .ns=${ns} .lang=${lang} key="fmod.title" slot="title" class="text-l"></x-i18n>
        <x-i18n .ns=${ns} .lang=${lang} key="fmod.subtitle" slot="subtitle" class="mr-xl"></x-i18n>

        ${this.value.map(
          (rule, index, array) => html`
            <x-frequency-modification-rule
              data-testid="rule"
              .disabled=${this.disabled}
              .value=${rule}
              .lang=${this.lang}
              .ns=${this.ns}
              @remove=${() => {
                this.value = array.filter((_, i) => i !== index);
                this.__sendChange();
              }}
              @change=${(evt: FrequencyModificationRuleChangeEvent) => {
                this.value = array.map((v, i) => (i === index ? evt.detail : v));
                this.__sendChange();
              }}
            >
            </x-frequency-modification-rule>
          `
        )}

        <div class="mt-m sm-flex sm-items-center">
          <vaadin-button
            class="w-full sm-w-auto"
            data-testid="add"
            theme="primary"
            .disabled=${this.disabled || this.value.length >= 10 || !this._isI18nReady}
            @click=${this.__addRule}
          >
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="fmod.add_rule"></x-i18n>
            <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
          </vaadin-button>

          <x-i18n
            .lang=${this.lang}
            .ns=${this.ns}
            key="fmod.add_rule_hint"
            class=${classMap({
              'text-xs text-center block font-lumo mt-xs transition duration-200 sm-mt-0 sm-ml-m':
                true,
              'text-tertiary': this.value.length < 10,
              'text-primary': this.value.length >= 10,
              'hidden': this.value.length === 0,
            })}
          >
          </x-i18n>
        </div>
      </x-section>
    `;
  }

  private __addRule() {
    this.value = [...this.value, { jsonataQuery: '*', values: [] }];
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyModificationChangeEvent(this.value));
  }
}
