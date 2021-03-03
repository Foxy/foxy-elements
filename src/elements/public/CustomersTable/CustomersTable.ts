import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { FormDialog } from '../FormDialog/index';
import { NucleonTable } from '../../private/NucleonTable/NucleonTable';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

export class CustomersTable extends NucleonTable<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  private static __ns = 'customers-table';

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = CustomersTable.__ns;

    return html`
      <foxy-form-dialog
        data-testclass="i18n"
        data-testid="customerDialog"
        parent=${this.href}
        header="update"
        lang=${this.lang}
        form="foxy-customer"
        id="customer-dialog"
        ns=${ns}
      >
      </foxy-form-dialog>

      ${super.render([
        {
          header: () => this.__t('name').toString(),
          cell: customer => html`
            <span data-testclass="names">${customer.first_name} ${customer.last_name}</span>
          `,
        },
        {
          mdAndUp: true,
          header: () => this.__t('id').toString(),
          cell: customer => html`
            <span role="presentation" class="text-s text-tertiary">ID&nbsp;</span>
            <span data-testclass="ids" class="text-s text-secondary font-tnum">${customer.id}</span>
          `,
        },
        {
          header: () => this.__t('email').toString(),
          cell: customer =>
            html`
              <span data-testclass="emails" class="text-s text-secondary"> ${customer.email} </span>
            `,
        },
        {
          mdAndUp: true,
          header: () => this.__t('actions').toString(),
          cell: customer =>
            html`
              <button
                data-testclass="previewButtons"
                class="rounded text-s font-medium tracking-wide text-primary hover:opacity-75 focus:outline-none focus:shadow-outline"
                @click=${(evt: Event) => {
                  this.__customerDialog.href = customer._links.self.href;
                  this.__customerDialog.show(evt.currentTarget as HTMLElement);
                }}
              >
                <foxy-i18n data-testclass="i18n" ns=${ns} lang=${this.lang} key="preview">
                </foxy-i18n>
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
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, CustomersTable.__ns);
  }

  private get __customerDialog(): any {
    return this.renderRoot.querySelector('#customer-dialog') as FormDialog;
  }
}
