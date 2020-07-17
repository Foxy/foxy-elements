import '@vaadin/vaadin-lumo-styles';
import { html, css } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Page extends Themeable {
  public static get styles() {
    return [
      super.styles,
      css`
        ::slotted(:not([slot])) {
          margin-top: var(--lumo-space-xl);
        }
      `,
    ];
  }

  public render() {
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
