import { TemplateResult, html } from 'lit-html';

import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../../mixins/themeable';
import { TranslatableMixin } from '../../../../mixins/translatable';

type Data = Resource<Rels.CouponCodes>;
const Base = TranslatableMixin(ThemeableMixin(NucleonElement));

export class InternalCouponCodesFormListItem extends Base<Data> {
  render(): TemplateResult {
    let code: string;

    try {
      code = new URL(this.href).searchParams.get('code') ?? '';
    } catch {
      return html``;
    }

    let statusClass = 'text-tertiary bg-contrast-5';
    let statusKey: string;
    let codeClass = 'text-body';

    if (this.in('fail')) {
      statusKey = 'loading_error';
    } else if (this.in('busy')) {
      statusKey = 'loading_busy';
    } else if (this.data?.returned_items === 0) {
      statusClass = 'text-success bg-success-10';
      statusKey = 'unique';
    } else {
      statusClass = 'text-error bg-error-10';
      statusKey = 'duplicate';
      codeClass = 'text-error';
    }

    return html`
      <div class="flex justify-between items-center font-lumo leading-m">
        <div class="text-m ${codeClass}">${code}</div>
        <foxy-i18n
          class="text-xs font-medium px-xs rounded ${statusClass}"
          lang=${this.lang}
          key=${statusKey}
          ns=${this.ns}
        >
        </foxy-i18n>
      </div>
    `;
  }
}
