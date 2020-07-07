import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import { Themeable } from '../../mixins/themeable';
import { html, property } from 'lit-element';

export class ChoiceChangeEvent extends CustomEvent<string> {
  constructor(value: string) {
    super('change', { detail: value });
  }
}

export class Choice extends Themeable {
  public static get scopedElements() {
    return {
      'vaadin-radio-button': customElements.get('vaadin-radio-button'),
      'vaadin-radio-group': customElements.get('vaadin-radio-group'),
    };
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value = '';

  @property({ type: Object })
  public items: string[] = [];

  @property({ type: Object })
  public getText: (value: string) => string = v => v;

  public render() {
    return html`
      <vaadin-radio-group class="w-full" style="padding: 8px 0 0 13px">
        ${this.items.map(
          (item, index) => html`
            ${index > 0
              ? html`<div class="border-t border-shade-10" style="margin: 8px 0 8px 35px"></div>`
              : ''}

            <vaadin-radio-button
              class="w-full"
              value=${item}
              ?checked=${this.value === item}
              .disabled=${this.disabled}
              @keydown=${this.__overrideFocus}
              @change=${(evt: Event) => {
                if ((evt.target as HTMLInputElement).checked) {
                  this.value = item;
                  this.dispatchEvent(new ChoiceChangeEvent(item));
                }
              }}
            >
              <div style="margin-left: 5px">${this.getText(item)}</div>
            </vaadin-radio-button>

            <div class="pr-m mt-s" style="padding-left: 35px">
              <slot name=${item}></slot>
            </div>

            <div class="mt-s"></div>
          `
        )}
      </vaadin-radio-group>
    `;
  }

  private __overrideFocus(evt: KeyboardEvent) {
    if (!evt.key.startsWith('Arrow')) return;

    let target = evt.target as HTMLInputElement | null;
    const targetTagName = target!.tagName;

    evt.preventDefault();
    evt.stopImmediatePropagation();

    while (target) {
      target = (evt.key === 'ArrowUp' || evt.key === 'ArrowLeft'
        ? target.previousElementSibling
        : target.nextElementSibling) as HTMLInputElement | null;

      if (target?.tagName === targetTagName) {
        target.click();
        target.focus();
        break;
      }
    }
  }
}
