import type { TemplateResult } from 'lit-html';
import type { I18n } from '../../I18n/I18n';

import { classMap } from '../../../../utils/class-map';
import { html } from 'lit-html';

type Params = {
  disabled: boolean;
  readonly: boolean;
  label: string;
  value: string;
  t: I18n['t'];
  onChange: (newValue: string) => void;
};

export function AdvancedInput(params: Params): TemplateResult {
  return html`
    <label class="relative flex items-center cursor-text group text-tertiary">
      <div class="relative flex-1 min-w-0 overflow-hidden">
        <input
          placeholder=${params.t(params.label)}
          class=${classMap({
            'bg-base relative flex h-m px-s font-medium w-full': true,
            'text-body': !params.disabled && !params.readonly,
            'text-disabled': params.disabled,
            'text-secondary': params.readonly,
            'flex max-w-full whitespace-nowrap': true, // ugh safari
            'focus-outline-none': true,
          })}
          .value=${params.value}
          ?disabled=${params.disabled || params.readonly}
          @input=${(evt: Event) => {
            const input = evt.currentTarget as HTMLInputElement;
            params.onChange(input.value);
          }}
        />
      </div>

      <span
        class=${classMap({
          'font-tnum text-xs font-medium border border-current mr-s px-xs rounded-s': true,
          'inline-block': !!params.value,
          'sr-only': !params.value,
          'text-body': !params.disabled && !params.readonly,
          'text-disabled': params.disabled,
          'text-secondary': params.readonly,
        })}
      >
        ${params.t(params.label)}
      </span>

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
