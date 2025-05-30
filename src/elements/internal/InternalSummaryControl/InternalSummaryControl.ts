import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import { svg, TemplateResult } from 'lit-html';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { html, css } from 'lit-element';

export class InternalSummaryControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      unsafeHelperText: { type: Boolean, attribute: 'unsafe-helper-text' },
      layout: {},
      count: { type: Number },
      open: { type: Boolean, reflect: true },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        ::slotted(*) {
          min-width: 100%;
        }

        :host(:not([layout='section'])) slot::slotted(*) {
          background-color: var(--lumo-contrast-5pct);
          padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px);
        }

        details summary > div {
          border-radius: var(--lumo-border-radius);
        }

        details[open] summary > div {
          border-radius: var(--lumo-border-radius) var(--lumo-border-radius) 0 0;
        }

        .with-unsafe a {
          text-decoration: underline;
          transition: color 0.1s ease-in-out;
        }

        .with-unsafe a:hover {
          color: var(--lumo-primary-text-color);
        }

        .with-unsafe a:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
          border-radius: var(--lumo-border-radius-s);
        }
      `,
    ];
  }

  unsafeHelperText = false;

  layout: null | 'section' | 'details' = null;

  count: number | null = null;

  open = false;

  renderLightDom(): void {
    return;
  }

  renderControl(): TemplateResult {
    if (this.layout === 'details') {
      return html`
        <details
          class="rounded overflow-hidden"
          ?open=${this.open}
          @toggle=${(evt: Event) => {
            const details = evt.currentTarget as HTMLDetailsElement;
            this.open = details.open;
            if (!evt.composed && !evt.bubbles) this.dispatchEvent(new CustomEvent('toggle'));
          }}
        >
          <summary class="select-none cursor-pointer focus-outline-none group">
            <div
              class="leading-xs bg-contrast-5 group-focus-ring-2 group-focus-ring-inset group-focus-ring-primary-50"
              style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
              ?hidden=${!this.label && !this.helperText}
            >
              <p
                class="flex items-center justify-between gap-s transition-opacity group-hover-opacity-80"
                ?hidden=${!this.label}
              >
                <span class="font-medium">
                  ${this.label}${typeof this.count === 'number' ? ` (${this.count})` : ''}
                </span>
                <span class="flex items-center justify-center" style="transform: scale(1.35)">
                  ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1.2em; height: 1.2em"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>`}
                </span>
              </p>
              <p class="text-xs text-secondary with-unsafe" ?hidden=${!this.helperText}>
                ${this.unsafeHelperText ? unsafeHTML(this.helperText) : this.helperText}
              </p>
            </div>
          </summary>
          <div class="overflow-hidden grid" style="gap: 1px">
            <slot></slot>
          </div>
        </details>
      `;
    }

    return html`
      <div class="leading-s mb-s" ?hidden=${!this.label && !this.helperText}>
        <p class="font-medium text-body text-l" ?hidden=${!this.label}>${this.label}</p>
        <p class="text-s text-secondary with-unsafe" ?hidden=${!this.helperText}>
          ${this.unsafeHelperText ? unsafeHTML(this.helperText) : this.helperText}
        </p>
      </div>
      <div class="rounded overflow-hidden grid" style="gap: 1px">
        <slot></slot>
      </div>
    `;
  }
}
