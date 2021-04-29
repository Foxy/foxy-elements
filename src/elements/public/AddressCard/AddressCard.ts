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
          --content: calc(var(--lumo-line-height-m) * var(--lumo-font-size-m) * 4);
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

            <div>
              <div class="flex items-center text-m space-x-s">
                <iron-icon icon="social:person" class="icon-inline flex-shrink-0"></iron-icon>
                <foxy-i18n
                  ns=${ns}
                  key="full_name"
                  lang=${this.lang}
                  class="truncate"
                  options=${JSON.stringify(this.form)}
                >
                </foxy-i18n>
              </div>

              <div class="flex items-center text-m space-x-s">
                <iron-icon icon="maps:place" class="icon-inline flex-shrink-0"></iron-icon>
                <foxy-i18n
                  ns=${ns}
                  key="full_address"
                  class="truncate"
                  lang=${this.lang}
                  data-testid="fullAddress"
                  options=${JSON.stringify(this.form)}
                >
                </foxy-i18n>
              </div>

              <div class="flex items-center text-m space-x-s">
                <iron-icon icon="icons:work" class="icon-inline flex-shrink-0"></iron-icon>
                <span class="truncate">${this.form.company || '–'}</span>
              </div>

              <div class="flex items-center text-m space-x-s">
                <iron-icon icon="maps:local-phone" class="icon-inline flex-shrink-0"></iron-icon>
                <span class="truncate">${this.form.phone || '–'}</span>
              </div>
            </div>
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
