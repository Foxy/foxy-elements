import '@vaadin/vaadin-button';
import { html, property } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';

import {
  NextDateModificationRule,
  NextDateModificationRuleChangeEvent,
} from './next-date-modification-rule';

import { Checkbox } from '../../../private/checkbox/Checkbox';
import { Section } from '../../../private/section/Section';

interface Rule {
  min?: string;
  max?: string;
  jsonataQuery: string;
  disallowedDates?: string[];
  allowedDays?: {
    type: 'day' | 'month';
    days: number[];
  };
}

export class NextDateModificationChangeEvent extends CustomEvent<boolean | Rule[]> {
  constructor(value: boolean | Rule[]) {
    super('change', { detail: value });
  }
}

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

  @property({ type: Object })
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

                <vaadin-button .disabled=${this.disabled} @click=${this.__addRule}>
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
