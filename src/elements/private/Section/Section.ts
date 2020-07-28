import { html, css } from 'lit-element';
import { Page } from '../Page/Page';

export class Section extends Page {
  public static get styles() {
    return [
      super.styles,
      css`
        ::slotted(:not([slot])) {
          margin-top: var(--lumo-space-l);
        }
      `,
    ];
  }

  public render() {
    return html`
      <section class="leading-s">
        <header>
          <h2 class="text-header font-semibold text-l font-lumo">
            <slot name="title"></slot>
          </h2>
          <p class="text-tertiary text-m font-lumo">
            <slot name="subtitle"></slot>
          </p>
        </header>

        <slot></slot>
      </section>
    `;
  }
}
