import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-button';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
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
    const isAddButtonDisabled =
      !this._isI18nReady ||
      this.disabled ||
      !this.value ||
      (Array.isArray(this.value) && this.value.length >= 10);

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
          <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.title" class="text-l"></x-i18n>
        </x-switch>

        <x-i18n
          .ns=${this.ns}
          .lang=${this.lang}
          key="ndmod.subtitle"
          slot="subtitle"
          class="mr-xl"
        >
        </x-i18n>

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

        <div class="mt-m sm-flex sm-items-center">
          <vaadin-button
            class="w-full sm-w-auto"
            data-testid="add"
            theme="primary"
            .disabled=${isAddButtonDisabled}
            @click=${this.__addRule}
          >
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.add"></x-i18n>
            <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
          </vaadin-button>

          <x-i18n
            .lang=${this.lang}
            .ns=${this.ns}
            key="ndmod.add_hint"
            class=${classMap({
              'text-xs text-center block font-lumo mt-xs transition duration-200 sm-mt-0 sm-ml-m':
                true,
              'text-tertiary': Array.isArray(this.value) && this.value.length < 10,
              'text-primary': Array.isArray(this.value) && this.value.length >= 10,
              'hidden': !Array.isArray(this.value) || this.value.length === 0,
            })}
          >
          </x-i18n>
        </div>
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
