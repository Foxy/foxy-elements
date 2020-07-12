import '@vaadin/vaadin-lumo-styles';
import { html, property, css } from 'lit-element';
import { Themeable } from '../../mixins/themeable';

export class Page extends Themeable {
  public static get styles() {
    return [
      super.styles,
      css`
        ::slotted(*) {
          margin-top: var(--lumo-space-xl);
        }
      `,
    ];
  }

  @property({ type: String })
  public header = '';

  @property({ type: String })
  public subheader = '';

  @property({ type: Boolean })
  public skeleton = false;

  public render() {
    return html`
      <article class="relative p-m md:p-l lg:p-xl">
        <header class="space-y-xs leading-s font-lumo">
          <h1 class="relative font-semibold text-header text-xxl">
            ${this.skeleton ? html`&nbsp;` : this.header}
            ${this.skeleton ? this.__renderSkeleton() : ''}
          </h1>

          <p class="relative text-l text-tertiary">
            ${this.skeleton ? html`&nbsp;` : this.subheader}
            ${this.skeleton ? this.__renderSkeleton() : ''}
          </p>
        </header>

        ${this.skeleton ? '' : html`<slot></slot>`}
      </article>
    `;
  }

  private __renderSkeleton() {
    return html`<div class="bg-shade-5 rounded my-xs absolute inset-0"></div>`;
  }
}
