import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-lumo-styles/icons';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { Group, I18N, Section } from '../../../../private/index';
import { Switch } from '../../../../private/Switch/Switch';
import { FrequencyModificationRule } from '../FrequencyModificationRule/FrequencyModificationRule';
import { FrequencyModificationRuleChangeEvent } from '../FrequencyModificationRule/FrequencyModificationRuleChangeEvent';
import { Rule } from '../FrequencyModificationRule/types';
import { FrequencyModificationChangeEvent } from './FrequencyModificationChangeEvent';
import { Ruleset } from './types';

export class FrequencyModification extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-frequency-modification-rule': FrequencyModificationRule,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-section': Section,
      'iron-icon': customElements.get('iron-icon'),
      'x-switch': Switch,
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

  public value: Ruleset = false;

  public disabled = false;

  public render(): TemplateResult {
    const { ns, lang } = this;

    return html`
      <x-section>
        <x-switch
          slot="title"
          class="-my-xs"
          data-testid="toggle"
          .checked=${Boolean(this.value)}
          .disabled=${this.disabled}
          @change=${this.__toggleValue}
        >
          <x-i18n .ns=${ns} .lang=${lang} key="fmod.title" class="text-l"></x-i18n>
        </x-switch>

        <x-i18n .ns=${ns} .lang=${lang} key="fmod.subtitle" slot="subtitle" class="mr-xl"></x-i18n>

        ${this.value
          ? html`
              ${this.__normalizedValue.map(
                (rule, index, array) => html`
                  <x-frequency-modification-rule
                    data-testid="rule"
                    .disabled=${this.disabled}
                    .value=${rule}
                    .lang=${this.lang}
                    .ns=${this.ns}
                    @remove=${() => {
                      const newValue = array.filter((_, i) => i !== index);
                      this.value = newValue.length ? newValue : true;
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
            `
          : ''}

        <vaadin-button
          class="mt-m w-full sm:w-auto"
          data-testid="add"
          theme="primary"
          .disabled=${this.disabled || !this.value}
          @click=${this.__addRule}
        >
          <x-i18n .ns=${this.ns} .lang=${this.lang} key="fmod.add_rule"></x-i18n>
          <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
        </vaadin-button>
      </x-section>
    `;
  }

  private get __normalizedValue(): Rule[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  private __addRule() {
    this.value = [...this.__normalizedValue, { jsonataQuery: '*', values: [] }];
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
