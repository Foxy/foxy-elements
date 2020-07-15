import '@vaadin/vaadin-button';
import { html, property } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { Checkbox, Section } from '../../../../private/index';

import { NextDateModificationRule } from '../NextDateModificationRule/NextDateModificationRule';
import { NextDateModificationRuleChangeEvent } from '../NextDateModificationRule/NextDateModificationRuleChangeEvent';
import { Rule } from './Rule';
import { NextDateModificationChangeEvent } from './NextDateModificationChangeEvent';

export class NextDateModification extends Translatable {
  public static get scopedElements() {
    return {
      'x-next-date-modification-rule': NextDateModificationRule,
      'vaadin-button': customElements.get('vaadin-button'),
      'x-checkbox': Checkbox,
      'x-section': Section,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Array })
  public value: Rule[] | boolean = false;

  public constructor() {
    super('customer-portal-settings');
  }

  private get __normalizedValue() {
    return typeof this.value === 'boolean' ? [] : this.value;
  }

  public render() {
    return html`
      <x-checkbox
        ?checked=${Boolean(this.value)}
        ?disabled=${this.disabled}
        @change=${this.__toggleValue}
      >
        <x-section
          .header=${this._i18n.t('ndmod.title').toString()}
          .subheader=${this._i18n.t('ndmod.subtitle').toString()}
        >
        </x-section>

        ${this.value
          ? html`
              <div class="space-y-m pt-m" slot="content">
                ${this.__normalizedValue.map(
                  (rule, index, array) => html`
                    <x-next-date-modification-rule
                      data-testid="rule"
                      .disabled=${this.disabled}
                      .value=${rule}
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
                  data-testid="add"
                  .disabled=${this.disabled}
                  @click=${this.__addRule}
                >
                  ${this._i18n.t('ndmod.add')}
                  <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
                </vaadin-button>
              </div>
            `
          : ''}
      </x-checkbox>
    `;
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
