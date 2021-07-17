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
      <span data-testclass="name" class="text-primary inline">${ctx.data.name}</span>
    `,
  };

  static scopeColumn: Column<Data> = {
    cell: ctx => {
      // as any is used here becaus there is no union in Tax for SDK yet.
      let content;
      switch ((ctx.data as any).type) {
        case 'global':
          content = html`<foxy-i18n key="global" ns="${ctx.ns}"></foxy-i18n>`;
          break;
        case 'union':
          content = html`
            <foxy-i18n key="union" ns="${ctx.ns}"></foxy-i18n>
            ${ctx.data.use_origin_rates
              ? html`<foxy-i18n key="${ctx.data.country}" ns="${ctx.ns}"></foxy-i18n>`
              : ''}
            <foxy-i18n key="union" ns="${ctx.ns}"></foxy-i18n>
          `;
          break;
        default:
          content = html`
            <foxy-i18n key="${ctx.data.country}" ns="country"></foxy-i18n>
            ${
              ['region', 'local'].includes(ctx.data.type)
                ? html` <foxy-i18n key="${ctx.data.region}" ns="region"></foxy-i18n> `
                : ''
            }
            ${['local'].includes(ctx.data.type) ? html`<span>${ctx.data.city}</span>` : ''}
          </span>`;
      }
      return html`
        <span data-testid="scope" class="text-s text-secondary flex flex-wrap gap-s">
          ${TaxesTable.__scopeIcon()} ${content}
        </span>
      `;
    },
  };

  static modeColumn: Column<Data> = {
    cell: ctx => {
      const auto = ctx.data.is_live;
      const value = auto ? ctx.data.service_provider : ctx.data.rate;
      return html`
        <div class="flex gap-s">
          ${TaxesTable.__automaticIcon(auto)}
          <foxy-i18n class="text-s text-secondary" key="${value}${auto ? '' : '%'}" ns="tax-form">
          </foxy-i18n>
        </div>
      `;
    },
    hideBelow: 'md',
  };

  static optionsColumn: Column<Data> = {
    cell: ctx => html`
      <div class="flex flex-wrap text-s text-secondary">
        <foxy-i18n
          class="${ctx.data.exempt_all_customer_tax_ids ? '' : 'text-disabled'}"
          key="exempt_all_customer_tax_ids"
          ns="${ctx.ns}"
        ></foxy-i18n>
        <foxy-i18n
          class="${ctx.data.apply_to_shipping ? '' : 'text-disabled'}"
          key="apply_to_shipping"
          ns="${ctx.ns}"
        ></foxy-i18n>
      </div>
    `,
    hideBelow: 'lg',
  };

  static actionsColumn: Column<Data> = {
    cell: ctx => html`
      <vaadin-button
        data-testclass="actions"
        class="cursor-pointer text-s font-semibold text-primary rounded hover-underline focus-outline-none focus-shadow-outline"
        theme="primary small"
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
      <foxy-form-dialog parent=${this.href} form="foxy-tax-form" lang=${this.lang} id="form">
      </foxy-form-dialog>
      ${super.render()}
    `;
  }

  private static __scopeIcon(): TemplateResult {
    return html`<iron-icon class="w-xxs p-0 m-0" icon="maps:place"></iron-icon>`;
  }

  private static __automaticIcon(auto: boolean): TemplateResult {
    return html`<iron-icon
      class="w-xxs p-0 m-0"
      icon="${auto ? 'icons:cloud' : 'icons:cloud-off'}"
    ></iron-icon>`;
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
