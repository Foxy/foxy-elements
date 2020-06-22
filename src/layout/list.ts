import { html } from 'lit-html';

interface ListParams {
  items?: string[];
  onRemove?: (index: number) => void;
}

export function List(params?: ListParams) {
  return html`
    <ul class="pl-m">
      ${(params?.items ?? []).map(
        (value, index) => html`
          <li
            class=${[
              'h-l font-lumo text-body text-m flex justify-between items-center',
              index > 0 ? 'border-t border-shade-10' : '',
            ].join(' ')}
          >
            ${value}

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
