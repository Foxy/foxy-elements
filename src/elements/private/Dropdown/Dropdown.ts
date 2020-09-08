import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-select';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';
import { DropdownChangeEvent } from './DropdownChangeEvent';

/**
 * According to Vaadin docs: if you do not want to select any item by default, you can set
 * the vaadin-select value to an inexistent value in the items list. This function
 * generates such value.
 */
function getUnexistentValue() {
  return `@foxy.io/elements#dropdown-${Math.random().toFixed(16).substr(2)}`;
}

export class Dropdown extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-select': customElements.get('vaadin-select'),
      'vaadin-item': customElements.get('vaadin-item'),
    };
  }

  private __unexistentValue = getUnexistentValue();

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      getTex: { type: Object },
      items: { type: Array },
      value: { type: String },
    };
  }

  public disabled = false;

  public value: null | string = null;

  public items: null | string[] = null;

  public getText: (value: string) => string = v => v;

  public render(): TemplateResult {
    return html`
      <vaadin-select
        class="w-full"
        data-testid="select"
        .value=${this.value === null ? this.__unexistentValue : this.value}
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

    const items = this.items ?? [];
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
    const resolvedValue = value === this.__unexistentValue ? null : value;
    this.dispatchEvent(new DropdownChangeEvent(resolvedValue));
  }
}
