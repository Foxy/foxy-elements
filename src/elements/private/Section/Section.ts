import { CSSResultArray, TemplateResult, css, html } from 'lit-element';
import { Page } from '../Page/Page';

export class Section extends Page {
  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        ::slotted(:not([slot])) {
          margin-top: var(--lumo-space-m);
        }
      `,
    ];
  }

  public render(): TemplateResult {
    return html`
      <section class="leading-s antialiased font-lumo">
        <header>
          <h2 class="text-header font-semibold text-l">
            <slot name="title"></slot>
          </h2>
          <p class="text-secondary text-m">
            <slot name="subtitle"></slot>
          </p>
        </header>

        <slot></slot>
      </section>
    `;
  }
}
