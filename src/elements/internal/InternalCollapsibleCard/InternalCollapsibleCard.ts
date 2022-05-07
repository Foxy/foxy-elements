import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { html, LitElement } from 'lit-element';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

export class InternalCollapsibleCard extends ThemeableMixin(
  TranslatableMixin(InferrableMixin(LitElement))
) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      summary: { type: String },
      open: { type: Boolean },
    };
  }

  summary = '';

  open = false;

  render(): TemplateResult {
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
                key=${this.summary}
                infer
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
