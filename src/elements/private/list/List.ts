import { html, property } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class ListChangeEvent extends CustomEvent<string[]> {
  constructor(value: string[]) {
    super('change', { detail: value });
  }
}

export class List extends Themeable {
  public static get scopedElements() {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  @property({ type: Object })
  public value: string[] = [];

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Object })
  public getText: (value: string) => string = v => v;

  public render() {
    return html`
      <div class="font-lumo text-m w-full">
        <ul>
          ${this.value.map((value, index) => {
            return html`
              <li
                class=${'ml-m h-l text-body flex justify-between items-center' +
                (index > 0 ? ' border-t border-shade-10' : '')}
              >
                ${this.getText(value)}

                <button
                  ?disabled=${this.disabled}
                  class="w-l h-l text-tertiary transition duration-150 hover:text-secondary"
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
