import { TemplateResult, html } from 'lit-html';

import { classMap } from '../../../../utils/class-map';

export type SelectParams = {
  label: string;
  value: string;
  options: { key: string; value: string }[];
  onChange: (newValue: string) => void;
};

export function renderSelect(params: SelectParams): TemplateResult {
  return html`
    <label
      class="flex items-center cursor-text group text-tertiary hover-text-primary focus-within-text-primary"
    >
      <div class="relative flex-1 min-w-0 overflow-hidden">
        <select
          class=${classMap({
            'bg-base text-body relative appearance-none flex h-m px-s font-medium w-full': true,
            'flex max-w-full whitespace-nowrap': true, // ugh safari
            'focus-outline-none': true,
          })}
          @change=${(evt: Event) => {
            const select = evt.currentTarget as HTMLSelectElement;
            const value = select.options[select.options.selectedIndex].value;
            params.onChange(value);
          }}
        >
          ${params.options.map(({ key, value }) => {
            return html`<option value=${value} ?selected=${value === params.value}>${key}</option>`;
          })}
        </select>
      </div>

      <span
        class=${classMap({
          'font-tnum text-xs font-medium transition-colors border mr-s px-xs rounded-s': true,
          'border-contrast-10 inline-block': true,
        })}
      >
        ${params.label}
      </span>
    </label>
  `;
}
