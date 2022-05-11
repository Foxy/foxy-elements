import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../InternalControl/InternalControl';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-element';

/**
 * Internal details/summary control.
 *
 * @since 1.17.0
 * @tag foxy-internal-details-control
 */
export class InternalDetailsControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      summary: { type: String },
      open: { type: Boolean },
    };
  }

  /** i18n key for summary text. */
  summary: string | null = null;

  /** Same as `HTMLDetailsElement['open']`. */
  open = false;

  renderControl(): TemplateResult {
    return html`
      <details
        class="w-full border border-contrast-10 rounded-t-l rounded-b-l"
        ?open=${this.open}
        @toggle=${(evt: Event) => {
          this.open = (evt.currentTarget as HTMLDetailsElement).open;
        }}
      >
        <summary
          class=${classMap({
            'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
            'transition-colors cursor-pointer hover-bg-contrast-5': true,
            'rounded-t-l': true,
            'rounded-b-l': !this.open,
          })}
        >
          <div class="flex items-center h-m pl-m pr-s">
            <div class="flex items-center flex-1">
              <foxy-i18n
                class="flex items-center text-xs tracking-wide uppercase font-bold text-body"
                infer=""
                key=${this.summary ?? ''}
              >
              </foxy-i18n>

              <slot name="actions"></slot>
            </div>

            <iron-icon
              class="icon-inline text-xl text-body"
              icon="icons:expand-${this.open ? 'less' : 'more'}"
            >
            </iron-icon>
          </div>
        </summary>

        <div class="border-t border-contrast-10">
          <slot></slot>
        </div>
      </details>
    `;
  }
}
