import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';
import { NucleonTableElement } from '../../private/NucleonTable/NucleonTableElement';
import { FormDialogElement } from '../FormDialog/index';
import { I18NElement } from '../I18N/index';
import { Data } from './types';

export class CustomersTableElement extends NucleonTableElement<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
    };
  }

  private static __ns = 'customers-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = CustomersTableElement.__ns;

    return html`
      <foxy-form-dialog
        parent=${this.href}
        header="edit"
        lang=${this.lang}
        form="foxy-customer"
        id="customer-dialog"
      >
      </foxy-form-dialog>

      ${super.render([
        {
          header: () => this.__t('name').toString(),
          cell: customer => `${customer.first_name} ${customer.last_name}`,
        },
        {
          mdAndUp: true,
          header: () => this.__t('id').toString(),
          cell: customer => html`
            <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
            <span class="text-s text-secondary font-tnum">${customer.id}</span>
          `,
        },
        {
          header: () => this.__t('email').toString(),
          cell: customer => html`<span class="text-s text-secondary">${customer.email}</span>`,
        },
        {
          mdAndUp: true,
          header: () => this.__t('actions').toString(),
          cell: customer =>
            html`
              <button
                class="rounded text-s font-medium tracking-wide text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                @click=${(evt: Event) => {
                  this.__customerDialog.href = customer._links.self.href;
                  this.__customerDialog.show(evt.currentTarget as HTMLElement);
                }}
              >
                <foxy-i18n ns=${ns} lang=${this.lang} key="preview"></foxy-i18n>
              </button>
            `,
        },
      ])}
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  private get __t() {
    return I18NElement.i18next.getFixedT(this.lang, CustomersTableElement.__ns);
  }

  private get __customerDialog(): any {
    return this.renderRoot.querySelector('#customer-dialog') as FormDialogElement;
  }
}
