import type { TemplateResult } from 'lit-html';
import type { I18n } from '../../I18n/I18n';

import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../../utils/class-map';
import { html } from 'lit-html';

type Params = {
  disabled: boolean;
  readonly: boolean;
  layout?: 'auto-grow' | 'fixed';
  value: string;
  label: string;
  type?: string;
  min?: string | number;
  t: I18n['t'];
  onChange: (newValue: string) => void;
};

export function SimpleInput(params: Params): TemplateResult {
  const { disabled, readonly, layout, label, value, type, min, t, onChange } = params;

  return html`
    <label class="flex-shrink-0 flex items-center gap-s relative">
      <foxy-i18n infer="" class=${classMap({ 'sr-only': layout !== 'fixed' })} key=${label}>
      </foxy-i18n>

      <span
        class=${classMap({
          'relative block whitespace-pre text-m': true,
          'px-s py-xs -my-xs font-medium opacity-0': !readonly,
          'text-contrast-80': readonly,
        })}
        ?hidden=${layout !== 'auto-grow' && !readonly}
        >${value || html`<foxy-i18n infer="" key="value_empty"></foxy-i18n>`}</span
      >

      ${readonly
        ? ''
        : html`
            <input
              placeholder=${t('value_empty')}
              class=${classMap({
                'appearance-none transition-all text-body text-m font-medium rounded-s': true,
                'bg-base px-s py-xs -my-xs': true,
                'opacity-50': disabled,
                'absolute inset-0': layout === 'auto-grow',
                'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
              })}
              ?disabled=${disabled}
              type=${ifDefined(type)}
              min=${ifDefined(min)}
              .value=${value}
              @input=${(evt: Event) => onChange((evt.target as HTMLInputElement).value)}
            />
          `}
    </label>
  `;
}
