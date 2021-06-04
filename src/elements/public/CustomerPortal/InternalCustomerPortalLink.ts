import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ThemeableMixin } from '../../../mixins/themeable';

export class InternalCustomerPortalLink extends ThemeableMixin(LitElement) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
      icon: { type: String },
    };
  }

  href = '';

  icon = '';

  render(): TemplateResult {
    return html`
      <a
        class="flex-auto font-medium tracking-wide cursor-pointer text-s rounded-s hover-text-primary focus-text-primary focus-outline-none focus-ring-2 focus-ring-primary-50 focus-ring-offset-2"
        href=${this.href}
        rel="nofollow noopener"
      >
        ${this.icon ? html`<iron-icon icon=${this.icon} class="icon-inline"></iron-icon>` : ''}
        <slot></slot>
      </a>
    `;
  }
}
