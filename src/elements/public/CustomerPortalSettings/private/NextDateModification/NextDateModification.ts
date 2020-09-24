import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-button';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { Checkbox, I18N, Section } from '../../../../private/index';
import { NextDateModificationRule } from '../NextDateModificationRule/NextDateModificationRule';
import { NextDateModificationRuleChangeEvent } from '../NextDateModificationRule/NextDateModificationRuleChangeEvent';
import { NextDateModificationChangeEvent } from './NextDateModificationChangeEvent';
import { Rule } from './Rule';

export class NextDateModification extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-next-date-modification-rule': NextDateModificationRule,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-checkbox': Checkbox,
      'x-section': Section,
      'iron-icon': customElements.get('iron-icon'),
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

  public value: Rule[] | boolean = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-checkbox
        .checked=${Boolean(this.value)}
        .disabled=${this.disabled || !this._isI18nReady}
        @change=${this.__toggleValue}
      >
        <x-section>
          <x-i18n slot="title" .ns=${this.ns} .lang=${this.lang} key="ndmod.title"></x-i18n>
          <x-i18n slot="subtitle" .ns=${this.ns} .lang=${this.lang} key="ndmod.subtitle"></x-i18n>
        </x-section>

        ${this.value
          ? html`
              ${this.__normalizedValue.map(
                (rule, index, array) => html`
                  <x-next-date-modification-rule
                    slot="content"
                    class="mt-m"
                    data-testid="rule"
                    .disabled=${this.disabled || !this._isI18nReady}
                    .value=${rule}
                    .lang=${this.lang}
                    @remove=${() => {
                      this.value = array.filter((_, i) => i !== index);
                      this.__sendChange();
                    }}
                    @change=${(evt: NextDateModificationRuleChangeEvent) => {
                      this.value = array.map((v, i) => (i === index ? evt.detail : v));
                      this.__sendChange();
                    }}
                  >
                  </x-next-date-modification-rule>
                `
              )}

              <vaadin-button
                slot="content"
                class="mt-m"
                data-testid="add"
                .disabled=${this.disabled || !this._isI18nReady}
                @click=${this.__addRule}
              >
                <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.add"></x-i18n>
                <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
              </vaadin-button>
            `
          : ''}
      </x-checkbox>
    `;
  }

  private get __normalizedValue() {
    return typeof this.value === 'boolean' ? [] : this.value;
  }

  private __addRule() {
    this.value = [...this.__normalizedValue, { jsonataQuery: '*' }];
    this.__sendChange();
  }

  private __toggleValue() {
    this.value = !this.value;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new NextDateModificationChangeEvent(this.value));
  }
}
