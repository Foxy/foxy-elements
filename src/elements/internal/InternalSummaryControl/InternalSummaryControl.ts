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
          padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);
        }

        ::slotted(:not(:first-child)) {
          border-top: thin var(--foxy-border-style, solid) var(--lumo-contrast-5pct) !important;
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
      <div class="border border-contrast-5 rounded"><slot></slot></div>
      <p class="mt-xs text-xs text-secondary" ?hidden=${!this.helperText}>${this.helperText}</p>
    `;
  }
}
