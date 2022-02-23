import { html, TemplateResult } from 'lit-html';
import { ThemeableMixin } from '../../../../mixins/themeable';
import { TranslatableMixin } from '../../../../mixins/translatable';
import { NucleonElement } from '../../NucleonElement/NucleonElement';

type Data = { _links: { self: { href: string } }; returned_items: number };
const Base = TranslatableMixin(ThemeableMixin(NucleonElement));

export class InternalGiftCardCodesFormListItem extends Base<Data> {
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
