import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class InternalCustomerPortalLink extends ThemeableMixin(LitElement) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      href: { type: String },
      icon: { type: String },
    };
  }

  disabled = false;

  href = '';

  icon = '';

  render(): TemplateResult {
    const actionClass = classMap({
      'flex-auto leading-m font-medium tracking-wide text-m rounded-s transition-colors': true,
      'text-primary hover-underline hover-cursor-pointer': !this.disabled,
      'focus-outline-none focus-ring-2 ring-primary-50 ring-offset-2': !this.disabled,
      'text-disabled cursor-default': this.disabled,
    });

    const actionContent = html`
      ${this.icon ? html`<iron-icon icon=${this.icon} class="icon-inline"></iron-icon>` : ''}
      <slot></slot>
    `;

    if (this.disabled) {
      return html`<button class=${actionClass} disabled>${actionContent}</button>`;
    }

    return html`
      <a class=${actionClass} href=${this.href} rel="nofollow noopener">${actionContent}</a>
    `;
  }
}
