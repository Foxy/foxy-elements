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
        'block w-m h-m group': true,
        'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
        'text-primary bg-primary-10': !params.disabled,
        'text-tertiary bg-contrast-5 cursor-default': params.disabled,
      })}
      ?disabled=${params.disabled}
      @click=${params.onClick}
    >
      <span
        class=${classMap({
          'w-full h-full flex items-center justify-center': true,
          'transition-transform transform group-hover-scale-110': !params.disabled,
        })}
      >
        ${params.caption}
      </span>
    </button>
  `;
}
