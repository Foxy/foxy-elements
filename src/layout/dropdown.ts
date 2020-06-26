import '@vaadin/vaadin-select';
import { html } from 'lit-html';

interface DropdownParams {
  name?: string;
  value?: string;
  items?: { text: string; value: string }[];
  disabled?: boolean;
  fullWidth?: boolean;
  onChange?: (newValue: string) => void;
}

export function Dropdown(params?: DropdownParams) {
  return html`
    <vaadin-select
      class=${params?.fullWidth ? 'w-full' : ''}
      .name=${params?.name}
      .value=${params?.value}
      .disabled=${params?.disabled}
      .renderer=${(root: HTMLElement) => {
        let list = root.querySelector('vaadin-list-box');

        if (list === null) {
          list = document.createElement('vaadin-list-box')
          root.appendChild(list);
        }

        const items = params?.items ?? [];
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

            (item as HTMLInputElement).value = items[i].value;
            item.textContent = items[i].text;
          } else {
            renderedItems[i].remove();
          }
        }
      }}
      @change=${(evt: CustomEvent) => {
        const value = (evt.target as HTMLInputElement).value;
        params?.onChange?.(value);
      }}
    >
    </vaadin-select>
  `;
}
