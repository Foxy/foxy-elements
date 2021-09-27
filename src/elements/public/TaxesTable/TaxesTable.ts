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
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(Table, 'tax-form')))
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
          content = html`<foxy-i18n
            data-testclass="global"
            class="inline"
            key="global"
            ns="${ctx.ns}"
          ></foxy-i18n>`;
          break;
        case 'union':
          content = html`
            <foxy-i18n class="inline" data-testclass="union" key="union" ns="${ctx.ns}"></foxy-i18n>
            ${ctx.data.use_origin_rates
              ? html`<foxy-i18n
                  data-testclass="origin"
                  class="inline"
                  key="${ctx.data.country}"
                  ns="${ctx.ns}"
                ></foxy-i18n>`
              : ''}
          `;
          break;
        default:
          content = html`
            <foxy-i18n data-testclass="country" class="inline" key="${
              ctx.data.country
            }" ns="country"></foxy-i18n>
            ${
              ['region', 'local'].includes(ctx.data.type)
                ? html`
                    <foxy-i18n
                      data-testclass="region"
                      class="inline"
                      key="${ctx.data.region}"
                      ns="region"
                    ></foxy-i18n>
                  `
                : ''
            }
            ${
              ['local'].includes(ctx.data.type)
                ? html`<span data-testclass="city" class="inline">${ctx.data.city}</span>`
                : ''
            }
          </span>`;
      }
      return html`
        <span data-testclass="scope" class="text-s text-secondary flex flex-col flex-wrap gap-0">
          ${content}
        </span>
      `;
    },
  };

  static modeColumn: Column<Data> = {
    cell: ctx => {
      const auto = ctx.data.is_live;
      const value = auto ? ctx.data.service_provider : ctx.data.rate;
      return html`
        <foxy-i18n
          data-testclass="mode"
          class="text-s text-secondary inline"
          key="${value}${auto ? '' : '%'}"
          ns="tax-form"
        >
        </foxy-i18n>
      `;
    },
  };

  static optionsColumn: Column<Data> = {
    cell: ctx => {
      const options = ['exempt_all_customer_tax_ids', 'apply_to_shipping'];
      return html`
        <div class="flex flex-wrap text-s text-secondary" data-testclass="options">
          ${options
            .filter(o => (ctx.data as any)[o])
            .map(i => html`<foxy-i18n key="${i}" ns="${ctx.ns}"></foxy-i18n>`)}
        </div>
      `;
    },
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
    };
  }

  static get styles(): CSSResultArray {
    return Themeable.styles;
  }

  ns = 'tax-form';

  namespaces = [this.ns, 'country'];

  columns = [
    TaxesTable.nameColumn,
    TaxesTable.modeColumn,
    TaxesTable.scopeColumn,
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

  private __loadTranslations() {
    const newNamespaces: string[] = ['shared', this.ns];
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
