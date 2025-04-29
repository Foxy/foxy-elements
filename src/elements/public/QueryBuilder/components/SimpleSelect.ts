import type { TemplateResult } from 'lit-html';
import type { I18n } from '../../I18n/I18n';

import { html, svg } from 'lit-html';
import { classMap } from '../../../../utils/class-map';

type Params = {
  disabled: boolean;
  readonly: boolean;
  current: { value: string } & ({ label: string } | { rawLabel: string });
  options: ({ value: string } & ({ label: string } | { rawLabel: string }))[];
  t: I18n['t'];
  onChange: (newValue: string) => void;
};

export function SimpleSelect(params: Params): TemplateResult {
  const { t, disabled, readonly, current, options, onChange } = params;

  return html`
    <div
      class=${classMap({
        'relative flex items-center gap-xs leading-m px-xs -m-xs rounded-s transition-colors': true,
        'focus-within-ring-2 focus-within-ring-primary-50': true,
        'text-contrast': !disabled && !readonly,
        'hover-text-contrast-80': !disabled && !readonly,
        'text-disabled': disabled,
        'text-contrast-80': readonly,
        'font-medium': !readonly,
      })}
    >
      ${'label' in current
        ? html`<foxy-i18n infer="" key=${current.label}></foxy-i18n>`
        : html`<span>${current.rawLabel}</span>`}
      ${readonly
        ? ''
        : html`
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="flex-shrink-0" style="width: 1em; height: 1em; transform: scale(1.25)"><path fill-rule="evenodd" d="M10.53 3.47a.75.75 0 0 0-1.06 0L6.22 6.72a.75.75 0 0 0 1.06 1.06L10 5.06l2.72 2.72a.75.75 0 1 0 1.06-1.06l-3.25-3.25Zm-4.31 9.81 3.25 3.25a.75.75 0 0 0 1.06 0l3.25-3.25a.75.75 0 1 0-1.06-1.06L10 14.94l-2.72-2.72a.75.75 0 0 0-1.06 1.06Z" clip-rule="evenodd" /></svg>`}
            <select
              class=${classMap({
                'absolute inset-0 opacity-0 focus-outline-none': true,
                'cursor-pointer': !disabled,
                'cursor-default': disabled,
              })}
              ?disabled=${disabled}
              @change=${(evt: Event) => onChange((evt.target as HTMLSelectElement).value)}
            >
              ${options.map(option => {
                return html`
                  <option value=${option.value} ?selected=${option.value === current.value}>
                    ${'label' in option ? t(option.label) : option.rawLabel}
                  </option>
                `;
              })}
            </select>
          `}
    </div>
  `;
}
