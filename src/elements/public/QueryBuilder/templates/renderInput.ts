import { TemplateResult, html } from 'lit-html';

import { classMap } from '../../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

export type InputParams = {
  id?: string;
  type: string;
  label: string;
  value: string;
  displayValue?: string;
  datalist?: { key: string; value: string }[];
  onChange: (newValue: string) => void;
};

export function renderInput(params: InputParams): TemplateResult {
  const id = params.id ?? String(Math.floor(Math.random() * Math.pow(10, 8)));
  const listId = `${id}-list`;
  const hasDisplayValue = !!params.displayValue;

  let normalizedValue = params.value;

  if (params.type === 'date') {
    const date = new Date(params.value);

    if (!isNaN(date.getTime())) {
      const yyyy = date.getFullYear().toString().padStart(4, '0');
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const dd = date.getDate().toString().padStart(2, '0');

      normalizedValue = `${yyyy}-${mm}-${dd}`;
    }
  }

  return html`
    <label
      class="text-s flex items-center cursor-text group text-tertiary hover-text-primary focus-within-text-primary"
    >
      <div class="relative flex-1 min-w-0 overflow-hidden">
        ${hasDisplayValue
          ? html`
              <div class="absolute inset-0 h-s px-s font-medium text-body flex items-center">
                <div class="truncate">${params.displayValue}</div>
              </div>
            `
          : ''}

        <input
          list=${ifDefined(params.datalist ? listId : undefined)}
          type=${params.type}
          class=${classMap({
            'bg-base text-body relative appearance-none flex h-s px-s font-medium w-full': true,
            'flex max-w-full whitespace-nowrap': true, // ugh safari
            'focus-outline-none': true,
            'opacity-0 focus-opacity-100': hasDisplayValue,
          })}
          placeholder=${params.label}
          .value=${normalizedValue}
          @input=${(evt: Event) => {
            const input = evt.currentTarget as HTMLInputElement;

            if (params.type === 'date') {
              params.onChange(input.valueAsDate?.toISOString() ?? input.value);
            } else {
              params.onChange(input.value);
            }
          }}
        />
      </div>

      <span
        class=${classMap({
          'font-tnum text-xxs font-medium transition-colors border mx-s px-xs rounded-s': true,
          'border-contrast-10': true,
          'inline-block': !!normalizedValue,
          'sr-only': !normalizedValue,
        })}
      >
        ${params.label}
      </span>

      ${params.datalist
        ? html`
            <datalist id=${listId}>
              ${params.datalist.map(
                ({ key, value }) => html`<option value=${value}>${key}</option>`
              )}
            </datalist>
          `
        : ''}
    </label>
  `;
}
