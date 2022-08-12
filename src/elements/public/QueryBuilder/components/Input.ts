import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { classMap } from '../../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { serializeDateUTC } from '../../../../utils/serialize-date';

export type InputParams = {
  t: I18n['t'];
  id?: string;
  list?: { label: string; value: string }[];
  type: string;
  label: string;
  value: string;
  disabled?: boolean;
  displayValue?: string;
  onChange: (newValue: string) => void;
};

export function Input(params: InputParams): TemplateResult {
  const id = params.id ?? String(Math.floor(Math.random() * Math.pow(10, 8)));
  const listId = `${id}-list`;
  const hasDisplayValue = !!params.displayValue;

  let normalizedValue = params.value;

  if (params.type === 'date') {
    const date = new Date(params.value);
    normalizedValue = isNaN(date.getTime()) ? '' : serializeDateUTC(date);
  }

  return html`
    <label class="relative flex items-center cursor-text group text-tertiary">
      <div class="relative flex-1 min-w-0 overflow-hidden">
        ${hasDisplayValue
          ? html`
              <div
                aria-hidden="true"
                class="absolute inset-0 h-m px-s font-medium text-body flex items-center"
              >
                <div class="truncate">${params.t(params.displayValue!)}</div>
              </div>
            `
          : ''}

        <input
          placeholder=${normalizedValue || params.type === 'date' ? '' : params.t(params.label)}
          class=${classMap({
            'bg-base text-body relative flex h-m px-s font-medium w-full': true,
            'flex max-w-full whitespace-nowrap': true, // ugh safari
            'focus-outline-none': true,
            'opacity-0 focus-opacity-100': hasDisplayValue,
          })}
          list=${ifDefined(params.list ? listId : undefined)}
          type=${params.type}
          max=${ifDefined(params.type === 'date' ? '9999-12-31' : '')}
          .value=${normalizedValue}
          ?disabled=${params.disabled}
          @input=${(evt: Event) => {
            const input = evt.currentTarget as HTMLInputElement;

            try {
              const valueAsDate = input.valueAsDate as Date;
              if (valueAsDate.getFullYear() > 9999) valueAsDate.setFullYear(9999);
              params.onChange(valueAsDate.toISOString());
            } catch {
              params.onChange(input.value);
            }
          }}
        />
      </div>

      <span
        class=${classMap({
          'font-tnum text-xs font-medium border border-current mr-s px-xs rounded-s': true,
          'inline-block': !!normalizedValue || params.type === 'date',
          'sr-only': !normalizedValue && params.type !== 'date',
        })}
      >
        ${params.t(params.label)}
      </span>

      ${params.list
        ? html`
            <datalist id=${listId}>
              ${params.list.map(
                ({ label, value }) => html`<option value=${value}>${params.t(label)}</option>`
              )}
            </datalist>
          `
        : ''}
      ${params.disabled
        ? ''
        : html`
            <div
              class="absolute inset-0 transition-colors bg-transparent group-hover-bg-contrast-5 pointer-events-none"
            ></div>
          `}
    </label>
  `;
}
