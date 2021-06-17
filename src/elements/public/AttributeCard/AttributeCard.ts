import { CSSResult, CSSResultArray } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { Skeleton } from '../../private';
import { Themeable } from '../../../mixins/themeable';
import { ifDefined } from 'lit-html/directives/if-defined';

export class AttributeCard extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-skeleton': Skeleton,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  render(): TemplateResult {
    const variant = ifDefined(this.in('busy') ? undefined : 'error');

    return html`
      <figure
        class="text-body text-l font-lumo leading-m focus-outline-none"
        aria-live="polite"
        aria-busy=${this.in('busy')}
      >
        <figcaption
          class="flex items-center space-x-xs uppercase text-xxs font-medium text-secondary tracking-wider"
        >
          ${this.in({ idle: 'snapshot' })
            ? html`
                <span class="block truncate" title=${this.data.name} data-testid="name">
                  ${this.data.name}
                </span>

                ${this.data.visibility !== 'public'
                  ? html`
                      <iron-icon
                        icon="icons:lock"
                        style="--iron-icon-width: 1em; --iron-icon-height: 1em"
                      >
                      </iron-icon>
                    `
                  : ''}
              `
            : html`<x-skeleton variant=${variant} class="w-full">&nbsp;</x-skeleton>`}
        </figcaption>

        ${this.in({ idle: 'snapshot' })
          ? html`
              <span class="block truncate" title=${this.data.value} data-testid="value">
                ${this.data.value}
              </span>
            `
          : html`<x-skeleton variant=${variant} class="w-full">&nbsp;</x-skeleton>`}
      </figure>
    `;
  }
}
