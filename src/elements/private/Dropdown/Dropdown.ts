import '@vaadin/vaadin-select';

import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  html,
} from 'lit-element';
import { css, registerStyles } from '@vaadin/vaadin-themable-mixin/register-styles';

import { DropdownChangeEvent } from './DropdownChangeEvent';
import { Themeable } from '../../../mixins/themeable';

registerStyles(
  'vaadin-list-box',
  css`
    [part='items'] ::slotted(vaadin-item.dropdown-divisor) {
      color: var(--lumo-contrast-40pct);
      box-shadow: 0 1px var(--lumo-contrast-10pct);
      border-radius: 0;
    }
    [part='items'] ::slotted(vaadin-item.dropdown-sub-item) {
      margin-left: var(--lumo-space-l);
    }
  `
);

/**
 * According to Vaadin docs: if you do not want to select any item by default, you can set
 * the vaadin-select value to a nonexistent value in the items list. This function
 * generates such value.
 */
function getUnexistentValue() {
  return `@foxy.io/elements#dropdown-${Math.random().toFixed(16).substr(2)}`;
}

export class Dropdown extends LitElement {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      getText: { attribute: false, type: Object },
      items: { type: Array },
      label: { type: String },
      value: { type: String },
    };
  }

  public static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  public disabled = false;

  public label = '';

  public value: null | string = null;

  public items: null | (string | [string, string[]])[] = null;

  public getText: (value: string) => string = v => v;

  private __unexistentValue = getUnexistentValue();

  private __renderedItems: Record<string, Element> = {};

  private readonly __list: HTMLElement;

  constructor() {
    super();
    this.__list = document.createElement('vaadin-list-box');
  }

  public render(): TemplateResult {
    return html`
      <vaadin-select
        class="w-full ${this.label ? '-mt-m' : ''}"
        data-testid="select"
        .label=${this.label}
        .value=${this.value === null ? this.__unexistentValue : this.value}
        .disabled=${this.disabled}
        .renderer=${this.__renderItems.bind(this)}
        @change=${this.__handleChange}
      >
      </vaadin-select>
    `;
  }

  private __renderItems(root: HTMLElement) {
    // Create vaadin-list-box element
    let list = root.querySelector('vaadin-list-box');
    if (list === null) {
      root.appendChild(this.__list);
      list = this.__list;
    }
    // Clean up keep indicator
    for (const v of Object.values(this.__renderedItems)) {
      (v as HTMLElement).dataset.keep = '';
    }

    const items = this.items ?? [];
    for (let i = 0; i < items.length; ++i) {
      if (typeof items[i] === 'string') {
        this.__addOrKeepItem(items[i] as string, items[i] as string, list).classList.add(
          'dropdown-item'
        );
      } else if (Array.isArray(items[i])) {
        const divisor = this.__addOrKeepItem(items[i][0], items[i][0], list as Element);
        divisor.classList.add('dropdown-item', 'dropdown-divisor');
        (divisor as HTMLInputElement).disabled = true;
        for (const sub of items[i][1]) {
          this.__addOrKeepItem(items[i][0] + ': ' + sub, sub, list as Element).classList.add(
            'dropdown-sub-item'
          );
        }
      }
    }

    // Remove items not set to keep
    for (const v of Object.values(this.__renderedItems)) {
      const tracked = v as HTMLElement;
      if (!tracked.dataset.keep) {
        v.remove();
        delete this.__renderedItems[tracked.dataset.trackId!];
      }
    }
  }

  // Adds an element to the dom, creating it if not already created, reusing it
  // if possible, in any case marking it with a keep signal sot it is not
  // removed.
  private __addOrKeepItem(key: string, text: string, list: Element): Element {
    let item: HTMLElement;

    if (this.__renderedItems[key]) {
      item = this.__renderedItems[key] as HTMLElement;
    } else {
      item = document.createElement('vaadin-item');
      this.__renderedItems[key] = item;
      (item as HTMLInputElement).value = key;
      list.appendChild(item);
    }

    item.dataset.keep = 'true';
    item.dataset.trackId = key;
    item.textContent = this.getText(text);

    return item;
  }

  private __handleChange(evt: CustomEvent) {
    const value = (evt.target as HTMLInputElement).value;
    const resolvedValue = value === this.__unexistentValue ? null : value;
    this.dispatchEvent(new DropdownChangeEvent(resolvedValue));
  }
}
