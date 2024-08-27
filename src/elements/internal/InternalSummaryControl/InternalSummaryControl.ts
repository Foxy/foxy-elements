import type { CSSResultArray } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css } from 'lit-element';

export class InternalSummaryControl extends InternalEditableControl {
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        ::slotted(*) {
          background-color: var(--lumo-base-color);
          padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);
        }
      `,
    ];
  }

  renderLightDom(): void {
    return;
  }

  renderControl(): TemplateResult {
    return html`
      <p class="mb-xs font-medium text-secondary text-s" ?hidden=${!this.label}>${this.label}</p>
      <div
        class="rounded overflow-hidden border border-transparent grid bg-contrast-10"
        style="gap: 1px"
      >
        <slot></slot>
      </div>
      <p class="mt-xs text-xs text-secondary" ?hidden=${!this.helperText}>${this.helperText}</p>
    `;
  }
}
