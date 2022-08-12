import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { classMap } from '../../../../utils/class-map';

export type SelectParams = {
  clearable?: boolean;
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
      class="flex items-center cursor-pointer transition-colors group text-tertiary hover-bg-contrast-5"
    >
      <div class="relative flex-1 min-w-0 overflow-hidden">
        <select
          class=${classMap({
            'cursor-pointer bg-transparent relative appearance-none flex h-m px-s': true,
            'font-medium w-full max-w-full whitespace-nowrap focus-outline-none': true,
            'text-tertiary': isEmpty,
            'text-body': !isEmpty,
          })}
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
              class="font-tnum text-xs font-medium border mr-s px-xs rounded-s border-current inline-block"
            >
              ${params.t(params.label)}
            </span>

            ${params.clearable
              ? html`
                  <button
                    aria-label=${params.t('delete')}
                    class="w-s h-s mr-xs text-body flex items-center justify-center transition-colors rounded-full focus-outline-none focus-ring-2 focus-ring-primary-50 hover-bg-contrast-5 hover-text-error"
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
