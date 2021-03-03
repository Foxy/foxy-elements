import { CSSResult, CSSResultArray } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';

export class AddressCard extends NucleonElement<Data> {
  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  render(): TemplateResult {
    const ns = 'address-card';

    return this.in({ idle: 'snapshot' })
      ? html`
          <div
            class="h-full text-left text-m flex leading-m font-lumo space-x-m text-body"
            aria-live="polite"
            aria-busy="false"
            data-testid="wrapper"
          >
            <foxy-i18n
              ns=${ns}
              key="full_address"
              lang=${this.lang}
              class="whitespace-pre-line block text-m flex-1"
              data-testid="fullAddress"
              .opts=${this.form}
            >
            </foxy-i18n>

            ${this.form.is_default_billing
              ? html`<iron-icon icon="icons:payment" data-testid="icon"></iron-icon>`
              : this.form.is_default_shipping
              ? html`<iron-icon icon="maps:local-shipping" data-testid="icon"></iron-icon>`
              : ''}
          </div>
        `
      : html`
          <div
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
          </div>
        `;
  }
}
