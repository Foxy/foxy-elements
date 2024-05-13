import '@vaadin/vaadin-lumo-styles';

import { CSSResultArray, LitElement, TemplateResult, css, html } from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

/** @deprecated – use internal controls instead */
export class Page extends LitElement {
  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
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
          <h1 class="font-medium text-header text-xl border-b border-contrast-10 pb-s mb-s">
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
