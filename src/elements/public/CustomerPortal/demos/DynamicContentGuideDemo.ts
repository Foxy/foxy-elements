import { LitElement, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

class PromoElement extends LitElement {
  static get properties() {
    return { email: { type: String } };
  }

  static get styles() {
    return css`
      :host {
        font: normal var(--lumo-font-size-s) var(--lumo-font-family);
        color: var(--lumo-body-text-color);
        display: block;
      }

      figure {
        margin: 0;
        display: flex;
        align-items: center;
      }

      img {
        width: var(--lumo-size-m);
        height: var(--lumo-size-m);
        border: thin solid var(--lumo-contrast-10pct);
        padding: var(--lumo-space-xs);
        margin-right: var(--lumo-space-s);
        border-radius: var(--lumo-border-radius-m);
      }

      a {
        color: inherit;
        display: block;
        font-weight: bold;
        margin-bottom: var(--lumo-space-xs);
      }
    `;
  }

  email = '';

  product: any = null;

  render() {
    const { image, title, description } = this.product ?? {};

    return html`
      <figure aria-busy=${!!this.product} aria-live="polite">
        <img src=${image} alt=${title} />
        <figcaption>
          <a href="https://cutt.ly/MnYFptp">${title}</a>
          <span>Top pick for you. ${description}</span>
        </figcaption>
      </figure>
    `;
  }

  async updated(changes: Map<keyof this, unknown>) {
    if (changes.has('email') && this.email) {
      const response = await fetch(`https://fakestoreapi.com/products/1?email=${this.email}`);
      this.product = await response.json();
      this.requestUpdate();
    }
  }
}

customElements.define('demo-promo', PromoElement);

export const DynamicContentGuideDemo = (): TemplateResult => html`
  <foxy-customer-portal base="https://demo.api/portal/" simplify-ns-loading>
    <template slot="customer:header:after">
      <demo-promo email="\${host.data.email}" style="margin: var(--lumo-space-m) 0"></demo-promo>
    </template>
  </foxy-customer-portal>
`;
