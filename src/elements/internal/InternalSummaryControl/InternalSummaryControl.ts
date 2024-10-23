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
          background-color: var(--lumo-contrast-5pct);
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
      <div class="leading-s mb-s" ?hidden=${!this.label && !this.helperText}>
        <p class="font-medium text-body text-l" ?hidden=${!this.label}>${this.label}</p>
        <p class="text-s text-secondary" ?hidden=${!this.helperText}>${this.helperText}</p>
      </div>
      <div class="rounded overflow-hidden grid" style="gap: 1px">
        <slot></slot>
      </div>
    `;
  }
}
