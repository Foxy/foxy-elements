import '@polymer/iron-icon';
import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Themeable, ThemeableMixin } from '../../../mixins/themeable';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Column } from '../Table/types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { FormDialog } from '../FormDialog/FormDialog';
import { I18N } from '../../private';
import { Table } from '../Table/Table';
import { TranslatableMixin } from '../../../mixins/translatable';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(Table, 'taxes-table')))
);

export class TaxesTable extends Base<Data> {
  static nameColumn: Column<Data> = {
    cell: ctx => html`
      <span data-testclass="name" class="text-s font-medium">
        ${ctx.data.name} ${ctx.data.name}
      </span>
    `,
  };

  static scopeColumn: Column<Data> = {
    cell: ctx => {
      // as any is used here becaus there is no union in Tax for SDK yet.
      switch ((ctx.data as any).type) {
        case 'global':
          return html` <span data-testid="scope" class="text-s text-secondary">
            <foxy-i18n key="global" ns=${ctx.ns}> </foxy-i18n>
          </span>`;
        case 'union':
          return html` <span data-testid="scope" class="text-s text-secondary">
            <foxy-i18n key="union" ns=${ctx.ns}></foxy-i18n>
            ${ctx.data.use_origin_rates
              ? html`<foxy-i18n key="${ctx.data.country}" ns=${ctx.ns}></foxy-i18n> `
              : ''}
            <foxy-i18n key="union" ns=${ctx.ns}></foxy-i18n>
          </span>`;
        default:
          return html` <span data-testid="scope" class="text-s text-secondary">
            <foxy-i18n class="hidden sm:inline" key="${ctx.data.country}" ns="country"></foxy-i18n>
            <span class="inline sm:hidden">${ctx.data.country}</span>
            ${['region', 'local'].includes(ctx.data.type)
              ? html`
                  <foxy-i18n
                    class="hidden sm:inline"
                    key="${ctx.data.region}"
                    ns="region"
                  ></foxy-i18n>
                  <span class="inline sm:hidden">${ctx.data.region}</span>
                `
              : ''}
            ${['local'].includes(ctx.data.type) ? html`<span>${ctx.data.city}</span>` : ''}
          </span>`;
      }
    },
  };

  static modeColumn: Column<Data> = {
    cell: ctx => {
      if (ctx.data.is_live) {
        return html`<foxy-i18n key="${ctx.data.service_provider}" ns=${ctx.ns}></foxy-i18n> `;
      } else {
        return html`<foxy-i18n key="${ctx.data.rate}" ns=${ctx.ns}></foxy-i18n> `;
      }
    },
    hideBelow: 'md',
  };

  static optionsColumn: Column<Data> = {
    cell: ctx => html`
      <foxy-i18n
        class="${ctx.data.exempt_all_customer_tax_ids ? '' : 'text-disabled'}"
        key="exempt_all_customer_tax_ids"
        ns=${ctx.ns}
      ></foxy-i18n>
      <foxy-i18n
        class="${ctx.data.apply_to_shipping ? '' : 'text-disabled'}"
        key="apply_to_shipping"
        ns=${ctx.ns}
      ></foxy-i18n>
    `,
    hideBelow: 'lg',
  };

  static actionsColumn: Column<Data> = {
    cell: ctx => html`
      <vaadin-button
        data-testclass="actions"
        theme="tertiary small"
        @click=${(evt: CustomEvent) => {
          const button = evt.target as ButtonElement;
          const root = button.getRootNode() as ShadowRoot;
          const form = root.querySelector('#form') as FormDialog;
          form.href = ctx.data._links.self.href;
          form.show(button);
        }}
      >
        <foxy-i18n lang=${ctx.lang} key="update" ns="${ctx.ns}"></foxy-i18n>
      </vaadin-button>
    `,
  };

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-form-dialog': FormDialog,
      'foxy-i18n': I18N,
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  static get styles(): CSSResultArray {
    return Themeable.styles;
  }

  ns = 'taxes-table';

  namespaces = [this.ns, 'country'];

  columns = [
    TaxesTable.nameColumn,
    TaxesTable.scopeColumn,
    TaxesTable.modeColumn,
    TaxesTable.optionsColumn,
    TaxesTable.actionsColumn,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    this.__loadTranslations();
    this.addEventListener('update', this.__loadTranslations.bind(this));
  }

  render(): TemplateResult {
    return html`
      <foxy-form-dialog
        parent=${this.href}
        form="foxy-tax-form"
        lang=${this.lang}
        ns=${this.ns}
        id="form"
      >
      </foxy-form-dialog>
      ${super.render()}
    `;
  }

  private __loadTranslations() {
    const newNamespaces: string[] = ['shared', this.ns, 'tax-form'];
    if (this.data) {
      for (const t of this.data!._embedded['fx:taxes']) {
        if (t.country) {
          newNamespaces.push('region-' + t.country.toLowerCase());
        }
      }
    }
    for (const n of newNamespaces) {
      if (!this.namespaces.includes(n)) {
        this.namespaces.push(n);
      }
    }
    customElements.get('foxy-i18n').i18next.loadNamespaces(this.namespaces);
  }
}
