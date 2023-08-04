import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { classMap } from '../../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { serializeDateTime } from '../../../../utils/serialize-date';

export type InputParams = {
  t: I18n['t'];
  id?: string;
  list?: { label: string; value: string }[];
  type: string;
  label: string;
  value: string;
  disabled: boolean;
  readonly: boolean;
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
    normalizedValue = isNaN(date.getTime()) ? '' : serializeDateTime(date);
  }

  return html`
    <label class="relative flex items-center cursor-text group text-tertiary">
      <div class="relative flex-1 min-w-0 overflow-hidden">
        ${hasDisplayValue
          ? html`
              <div
                aria-hidden="true"
                class=${classMap({
                  'absolute inset-0 h-m px-s font-medium flex items-center': true,
                  'text-body': !params.disabled && !params.readonly,
                  'text-disabled': params.disabled,
                  'text-secondary': params.readonly,
                })}
              >
                <div class="truncate">${params.t(params.displayValue!)}</div>
              </div>
            `
          : ''}

        <input
          placeholder=${normalizedValue || params.type === 'date' ? '' : params.t(params.label)}
          class=${classMap({
            'bg-base relative flex h-m px-s font-medium w-full': true,
            'text-body': !params.disabled && !params.readonly,
            'text-disabled': params.disabled,
            'text-secondary': params.readonly,
            'flex max-w-full whitespace-nowrap': true, // ugh safari
            'focus-outline-none': true,
            'opacity-0 focus-opacity-100': hasDisplayValue,
          })}
          list=${ifDefined(params.list ? listId : undefined)}
          type=${params.type === 'date' ? 'datetime-local' : params.type}
          max=${ifDefined(params.type === 'date' ? '9999-12-31T23:59' : '')}
          .value=${normalizedValue}
          ?disabled=${params.disabled || params.readonly}
          @input=${(evt: Event) => {
            const input = evt.currentTarget as HTMLInputElement;
            let newValue = input.value;

            try {
              if (params.type === 'date') {
                const newDate = new Date(input.value);
                if (!isNaN(newDate.getTime())) newValue = newDate.toISOString();
              }
            } catch {
              // ignore
            }

            params.onChange(newValue);
          }}
        />
      </div>

      <span
        class=${classMap({
          'font-tnum text-xs font-medium border border-current mr-s px-xs rounded-s': true,
          'inline-block': !!normalizedValue || params.type === 'date',
          'sr-only': !normalizedValue && params.type !== 'date',
          'text-body': !params.disabled && !params.readonly,
          'text-disabled': params.disabled,
          'text-secondary': params.readonly,
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
      ${params.disabled || params.readonly
        ? ''
        : html`
            <div
              class="absolute inset-0 transition-colors bg-transparent group-hover-bg-contrast-5 pointer-events-none"
            ></div>
          `}
    </label>
  `;
}
