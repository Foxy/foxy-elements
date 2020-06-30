import { html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';

interface ListParams {
  id?: string;
  items?: string[];
  getText?: (item: string) => string;
  onRemove?: (index: number) => void;
}

export function List(params?: ListParams) {
  return html`
    <ul class="pl-m" id=${ifDefined(params?.id)}>
      ${(params?.items ?? []).map(
        (value, index) => html`
          <li
            class=${[
              'h-l font-lumo text-body text-m flex justify-between items-center',
              index > 0 ? 'border-t border-shade-10' : '',
            ].join(' ')}
          >
            ${params?.getText?.(value) ?? value}

            <button
              class="w-l h-l text-tertiary transition duration-150 hover:text-secondary"
              @click=${() => params?.onRemove?.(index)}
            >
              <iron-icon icon="lumo:cross"></iron-icon>
            </button>
          </li>
        `
      )}
    </ul>
  `;
}
