import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { classMap } from '../../../../utils/class-map';

export type SelectParams = {
  clearable?: boolean;
  disabled: boolean;
  readonly: boolean;
  label: string;
  value: string;
  list?: { label: string; value: string }[];
  t: I18n['t'];
  onChange: (newValue: string) => void;
};

export function Select(params: SelectParams): TemplateResult {
  const isEmpty = params.list?.every(v => v.value !== params.value) ?? true;

  return html`
    <label
      class=${classMap({
        'flex items-center transition-colors group text-tertiary': true,
        'cursor-pointer hover-bg-contrast-5': !params.disabled && !params.readonly,
        'cursor-default': params.disabled || params.readonly,
      })}
    >
      <div class="relative flex-1 min-w-0 overflow-hidden">
        <select
          class=${classMap({
            'bg-transparent relative appearance-none flex h-m px-s': true,
            'font-medium w-full max-w-full whitespace-nowrap focus-outline-none': true,
            'text-tertiary': isEmpty && !params.disabled,
            'text-body': !isEmpty && !params.disabled && !params.readonly,
            'text-disabled': params.disabled,
            'text-secondary': !isEmpty && params.readonly,
            'cursor-pointer': !params.disabled && !params.readonly,
            'cursor-default': params.disabled || params.readonly,
          })}
          ?disabled=${params.disabled || params.readonly}
          @change=${(evt: Event) => {
            const select = evt.currentTarget as HTMLSelectElement;
            const value = select.options[select.options.selectedIndex].value;
            params.onChange(value);
          }}
        >
          ${isEmpty
            ? html`
                <option value="" disabled ?selected=${isEmpty}>${params.t(params.label)}</option>
              `
            : ''}
          ${params.list?.map(
            ({ label, value }) =>
              html`
                <option value=${value} ?selected=${value === params.value}>
                  ${params.t(label)}
                </option>
              `
          )}
        </select>
      </div>

      ${isEmpty
        ? ''
        : html`
            <span
              class=${classMap({
                'font-tnum text-xs font-medium border mr-s px-xs rounded-s border-current inline-block':
                  true,
                'text-body': !params.disabled && !params.readonly,
                'text-disabled': params.disabled,
                'text-secondary': params.readonly,
              })}
            >
              ${params.t(params.label)}
            </span>

            ${params.clearable && !params.readonly
              ? html`
                  <button
                    aria-label=${params.t('delete')}
                    class=${classMap({
                      'w-s h-s mr-xs flex items-center justify-center transition-colors rounded-full':
                        true,
                      'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
                      'hover-bg-contrast-5 hover-text-error text-body': !params.disabled,
                      'text-disabled': params.disabled,
                    })}
                    ?disabled=${params.disabled}
                    @click=${() => params.onChange('')}
                  >
                    <iron-icon
                      aria-hidden="true"
                      class="icon-inline text-l"
                      icon="icons:remove-circle-outline"
                    >
                    </iron-icon>
                  </button>
                `
              : ''}
          `}
    </label>
  `;
}
