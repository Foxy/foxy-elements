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
      <article class="relative p-m md:p-l lg:p-xl">
        <header class="space-y-xs leading-s font-lumo">
          <h1 class="font-semibold text-header text-xxl">
            <slot name="title"></slot>
          </h1>
          <p class="text-l text-tertiary">
            <slot name="subtitle"></slot>
          </p>
        </header>

        <slot></slot>
      </article>
    `;
  }
}
