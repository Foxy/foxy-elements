import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-button';
import '@vaadin/vaadin-lumo-styles/icons';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { Checkbox, Group, I18N, Section } from '../../../../private/index';
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
      'x-checkbox': Checkbox,
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

  public value: Ruleset = false;

  public disabled = false;

  public render(): TemplateResult {
    return html`
      <x-checkbox
        data-testid="toggle"
        .checked=${Boolean(this.value)}
        .disabled=${this.disabled}
        @change=${this.__toggleValue}
      >
        <x-section>
          <x-i18n slot="title" .ns=${this.ns} .lang=${this.lang} key="fmod.title"></x-i18n>
          <x-i18n slot="subtitle" .ns=${this.ns} .lang=${this.lang} key="fmod.subtitle"></x-i18n>
        </x-section>

        ${this.value
          ? html`
              ${this.__normalizedValue.map(
                (rule, index, array) => html`
                  <x-frequency-modification-rule
                    slot="content"
                    class="mt-m"
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

              <vaadin-button
                slot="content"
                class="mt-m"
                data-testid="add"
                .disabled=${this.disabled}
                @click=${this.__addRule}
              >
                <x-i18n .ns=${this.ns} .lang=${this.lang} key="fmod.add_rule"></x-i18n>
                <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
              </vaadin-button>
            `
          : ''}
      </x-checkbox>
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
