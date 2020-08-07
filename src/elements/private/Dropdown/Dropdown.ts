import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-select';
import { html, TemplateResult } from 'lit-element';
import { Choice } from '../Choice/Choice';
import { DropdownChangeEvent } from './DropdownChangeEvent';

export class Dropdown extends Choice {
  public static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'vaadin-select': customElements.get('vaadin-select'),
      'vaadin-item': customElements.get('vaadin-item'),
    };
  }

  public render(): TemplateResult {
    return html`
      <vaadin-select
        class="w-full"
        data-testid="select"
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
