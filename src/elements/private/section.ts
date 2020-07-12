import { html, css } from 'lit-element';
import { Page } from './page/Page';

export class Section extends Page {
  public static get styles() {
    return [
      super.styles,
      css`
        ::slotted(*) {
          margin-top: var(--lumo-space-l);
        }
      `,
    ];
  }

  public render() {
    return html`
      <section class="leading-s">
        <header>
          <h2 class="text-header font-semibold text-l font-lumo">${this.header}</h2>
          <p class="text-tertiary text-m font-lumo">${this.subheader}</p>
        </header>

        <slot></slot>
      </section>
    `;
  }
}
