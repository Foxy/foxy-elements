import { TemplateResult, html } from 'lit-html';

import { classMap } from '../../../../utils/class-map';

export type ToggleParams = {
  disabled: boolean;
  caption: TemplateResult;
  onClick: () => void;
};

export function renderToggle(params: ToggleParams): TemplateResult {
  return html`
    <button
      class=${classMap({
        'flex items-center justify-center w-m h-m transition-colors': true,
        'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
        'hover-bg-contrast-5': !params.disabled,
        'text-tertiary cursor-default': params.disabled,
      })}
      ?disabled=${params.disabled}
      @click=${params.onClick}
    >
      ${params.caption}
    </button>
  `;
}
