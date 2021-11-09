import { TemplateResult, html } from 'lit-html';

import { classMap } from '../../../../utils/class-map';

export type SelectParams = {
  label: string;
  value: string;
  list?: { key: string; value: string }[];
  clearable?: boolean;
  onChange: (newValue: string) => void;
};

export function renderSelect(params: SelectParams): TemplateResult {
  const isEmpty = params.list?.every(v => v.value !== params.value) ?? true;

  return html`
    <label
      class="flex items-center cursor-pointer transition-colors group text-transparent hover-text-tertiary hover-bg-contrast-5 focus-within-text-tertiary"
    >
      <div class="relative flex-1 min-w-0 overflow-hidden">
        <select
          class=${classMap({
            'cursor-pointer bg-transparent relative appearance-none flex h-m px-s font-medium w-full max-w-full whitespace-nowrap focus-outline-none':
              true,
            'text-body': !isEmpty,
            'text-tertiary': isEmpty,
          })}
          @change=${(evt: Event) => {
            const select = evt.currentTarget as HTMLSelectElement;
            const value = select.options[select.options.selectedIndex].value;
            params.onChange(value);
          }}
        >
          ${isEmpty
            ? html`<option value disabled ?selected=${isEmpty}>${params.label}</option>`
            : ''}
          ${params.list?.map(({ key, value }) => {
            return html`<option value=${value} ?selected=${value === params.value}>${key}</option>`;
          })}
        </select>
      </div>

      ${isEmpty
        ? ''
        : html`
            <span
              class="font-tnum text-xs font-medium border mr-s px-xs rounded-s border-current inline-block"
            >
              ${params.label}
            </span>

            ${params.clearable
              ? html`
                  <button
                    class="w-s h-s mr-xs text-body flex items-center justify-center transition-colors rounded-full focus-outline-none focus-ring-2 focus-ring-primary-50 hover-bg-contrast-5 hover-text-error"
                    @click=${() => params.onChange('')}
                  >
                    <iron-icon icon="icons:remove-circle-outline" class="icon-inline text-l">
                    </iron-icon>
                  </button>
                `
              : ''}
          `}
    </label>
  `;
}
