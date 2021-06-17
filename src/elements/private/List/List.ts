import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  html,
} from 'lit-element';

import { ListChangeEvent } from './ListChangeEvent';
import { Themeable } from '../../../mixins/themeable';

export class List extends LitElement {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      getText: { type: Object },
      value: { type: Array },
    };
  }

  public static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  public value: string[] = [];

  public disabled = false;

  public getText: (value: string) => string = v => v;

  public render(): TemplateResult {
    return html`
      <div class="font-lumo text-m w-full">
        <ul>
          ${this.value.map((value, index) => {
            return html`
              <li
                class=${'ml-m h-l text-body flex justify-between items-center' +
                (index > 0 ? ' border-t border-contrast-10' : '')}
              >
                <slot name=${index}>${this.getText(value)}</slot>

                <button
                  ?disabled=${this.disabled}
                  class="w-l h-l rounded text-tertiary transition duration-150 hover-text-secondary disabled-text-tertiary disabled-opacity-50 disabled-cursor-default focus-outline-none focus-shadow-outline"
                  @click=${() => this.__remove(index)}
                >
                  <iron-icon icon="lumo:cross"></iron-icon>
                </button>
              </li>
            `;
          })}
        </ul>

        <div class="p-m">
          <slot></slot>
        </div>
      </div>
    `;
  }

  private __remove(index: number) {
    this.value = this.value.filter((_, i) => i !== index);
    this.dispatchEvent(new ListChangeEvent(this.value));
  }
}
