import '@vaadin/vaadin-lumo-styles';
import { css, CSSResultArray, html, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Page extends Themeable {
  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        ::slotted(:not([slot])) {
          margin-top: var(--lumo-space-xl);
        }
      `,
    ];
  }

  public render(): TemplateResult {
    return html`
      <article class="relative antialiased font-lumo">
        <header class="space-y-xs leading-s">
          <h1 class="font-bold text-header text-xl border-b border-contrast-10 pb-s mb-s">
            <slot name="title"></slot>
          </h1>
          <p class="text-l text-secondary">
            <slot name="subtitle"></slot>
          </p>
        </header>

        <slot></slot>
      </article>
    `;
  }
}
