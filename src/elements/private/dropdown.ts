import '@vaadin/vaadin-select';
import { html } from 'lit-element';
import { Choice } from './choice/Choice';
import { ChoiceChangeEvent } from './choice/ChoiceChangeEvent';

export class DropdownChangeEvent extends ChoiceChangeEvent {}

export class Dropdown extends Choice {
  public static get scopedElements() {
    return {
      ...super.scopedElements,
      'vaadin-select': customElements.get('vaadin-select'),
    };
  }

  public render() {
    return html`
      <vaadin-select
        class="w-full"
        .value=${this.value}
        .disabled=${this.disabled}
        .renderer=${this.__renderItems.bind(this)}
        @change=${this.__handleChange}
      >
      </vaadin-select>
    `;
  }

  private __renderItems(root: HTMLElement) {
    let list = root.querySelector('vaadin-list-box');

    if (list === null) {
      list = document.createElement('vaadin-list-box');
      root.appendChild(list);
    }

    const items = this.items;
    const renderedItems = list.querySelectorAll('vaadin-item');

    for (let i = 0; i < Math.max(items.length, renderedItems.length); ++i) {
      if (items[i]) {
        let item: Element;

        if (renderedItems[i]) {
          item = renderedItems[i];
        } else {
          item = document.createElement('vaadin-item');
          list.appendChild(item);
        }

        (item as HTMLInputElement).value = items[i];
        item.textContent = this.getText(items[i]);
      } else {
        renderedItems[i].remove();
      }
    }
  }

  private __handleChange(evt: CustomEvent) {
    const value = (evt.target as HTMLInputElement).value;
    this.dispatchEvent(new DropdownChangeEvent(value));
  }
}
