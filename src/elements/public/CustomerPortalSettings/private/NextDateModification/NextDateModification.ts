import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-button';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { I18N, Section } from '../../../../private/index';
import { Switch } from '../../../../private/Switch/Switch';
import { NextDateModificationRule } from '../NextDateModificationRule/NextDateModificationRule';
import { NextDateModificationRuleChangeEvent } from '../NextDateModificationRule/NextDateModificationRuleChangeEvent';
import { NextDateModificationChangeEvent } from './NextDateModificationChangeEvent';
import { Rule } from './Rule';

export class NextDateModification extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-next-date-modification-rule': NextDateModificationRule,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-section': Section,
      'iron-icon': customElements.get('iron-icon'),
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

  public value: Rule[] | boolean = false;

  public constructor() {
    super('customer-portal-settings');
  }

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
          <x-i18n .ns=${ns} .lang=${lang} key="ndmod.title" class="text-l"></x-i18n>
        </x-switch>

        <x-i18n .ns=${ns} .lang=${lang} key="ndmod.subtitle" slot="subtitle" class="mr-xl"></x-i18n>

        ${this.value
          ? html`
              ${this.__normalizedValue.map(
                (rule, index, array) => html`
                  <x-next-date-modification-rule
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
            `
          : ''}

        <vaadin-button
          class="mt-m w-full sm:w-auto"
          theme="primary"
          data-testid="add"
          .disabled=${this.disabled || !this.value}
          @click=${this.__addRule}
        >
          <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.add"></x-i18n>
          <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
        </vaadin-button>
      </x-section>
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
