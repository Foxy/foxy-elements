import { CSSResult, CSSResultArray } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';

export class AttributeCard extends NucleonElement<Data> {
  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  render(): TemplateResult {
    return html`
      <figure
        class="relative text-body text-l font-lumo leading-m focus-outline-none"
        aria-live="polite"
        aria-busy=${this.in('busy')}
      >
        <figcaption
          class="flex items-center space-x-xs uppercase text-xxs font-medium text-secondary tracking-wider"
        >
          <span class="block truncate" title=${this.data?.name ?? ''} data-testid="name">
            ${this.data?.name ?? html`&nbsp;`}
          </span>

          ${this.data && this.data.visibility !== 'public'
            ? html`
                <iron-icon
                  icon="icons:lock"
                  style="--iron-icon-width: 1em; --iron-icon-height: 1em"
                >
                </iron-icon>
              `
            : ''}
        </figcaption>

        <span class="block truncate" title=${this.data?.value ?? ''} data-testid="value">
          ${this.data?.value ?? html`&nbsp;`}
        </span>

        ${!this.in({ idle: 'snapshot' })
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  state=${this.in('fail')
                    ? 'error'
                    : this.in({ idle: 'template' })
                    ? 'empty'
                    : 'busy'}
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </figure>
    `;
  }
}
