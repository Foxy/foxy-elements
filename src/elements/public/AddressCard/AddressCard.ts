import { CSSResult, CSSResultArray, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';

export class AddressCard extends NucleonElement<Data> {
  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        :host {
          --content: calc(var(--lumo-line-height-m) * var(--lumo-font-size-m) * 3);
          --space: var(--lumo-space-s);
          --label: calc(var(--lumo-line-height-m) * var(--lumo-font-size-xxs));

          height: calc(var(--label) + var(--space) + var(--content));
        }
      `,
    ];
  }

  render(): TemplateResult {
    const ns = 'address-card';

    return this.in({ idle: 'snapshot' })
      ? html`
          <figure
            class="h-full text-left text-m leading-m font-lumo space-y-s text-body"
            aria-live="polite"
            aria-busy="false"
            data-testid="wrapper"
          >
            <figcaption class="uppercase text-xxs font-medium text-secondary tracking-wider">
              <foxy-i18n
                lang=${this.lang}
                ns=${ns}
                key=${this.data.is_default_billing
                  ? 'default_billing_address'
                  : this.data.is_default_shipping
                  ? 'default_shipping_address'
                  : this.data.address_name}
              >
              </foxy-i18n>
            </figcaption>

            <foxy-i18n
              ns=${ns}
              key="full_address"
              lang=${this.lang}
              class="whitespace-pre-line block text-m flex-1"
              data-testid="fullAddress"
              .options=${this.form}
            >
            </foxy-i18n>
          </figure>
        `
      : html`
          <figure
            aria-live="polite"
            aria-busy=${this.in('busy')}
            data-testid="wrapper"
            class="w-full h-full flex items-center justify-center"
          >
            <foxy-spinner
              lang=${this.lang}
              state=${this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty'}
              data-testid="spinner"
            >
            </foxy-spinner>
          </figure>
        `;
  }
}
