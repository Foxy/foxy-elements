import { Data, GiftCardCodes } from './types';
import { Option, Type } from '../QueryBuilder/types';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CategoryRestrictionsPage } from './private/CategoryRestrictionsPage';
import { Column } from '../Table/types';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { EditableList } from '../../private/EditableList/EditableList';
import { FormDialog } from '../FormDialog';
import { FrequencyInput } from '../../private/FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../../private/FrequencyInput/FrequencyInputChangeEvent';
import { Group } from '../../private/Group/Group';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTable } from '../../private/PropertyTable/PropertyTable';
import { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { currencies } from './currencies';
import { ifDefined } from 'lit-html/directives/if-defined';

const NS = 'gift-card-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(ResponsiveMixin(TranslatableMixin(NucleonElement, NS))))
);

/**
 * Form element for creating or editing gift cards (`fx:gift_card`).
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot currency:before
 * @slot currency:after
 *
 * @slot expires:before
 * @slot expires:after
 *
 * @slot codes:before
 * @slot codes:after
 *
 * @slot product-restrictions:before
 * @slot product-restrictions:after
 *
 * @slot category-restrictions:before
 * @slot category-restrictions:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-gift-card-form
 * @since 1.15.0
 */
export class GiftCardForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'vaadin-button': customElements.get('vaadin-button'),

      'iron-icon': customElements.get('iron-icon'),

      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-query-builder': customElements.get('foxy-query-builder'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-pagination': customElements.get('foxy-pagination'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-table': customElements.get('foxy-table'),
      'foxy-i18n': customElements.get('foxy-i18n'),

      'x-category-restrictions-page': CategoryRestrictionsPage,
      'x-frequency-input': FrequencyInput,
      'x-property-table': PropertyTable,
      'x-editable-list': EditableList,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __codesTableQuery: { attribute: false },
      __itemCategories: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ name: v }) => !v || v.length <= 50 || 'name_too_long',
    ];
  }

  private __codesTableColumns: Column<GiftCardCodes>[] = [
    {
      header: ctx => html`<foxy-i18n lang=${ctx.lang} key="code" ns=${ctx.ns}></foxy-i18n>`,
      cell: ctx => html`
        <vaadin-button
          theme="tertiary contrast"
          class="p-0"
          @click=${(evt: CustomEvent) => {
            const dialog = this.renderRoot.querySelector<FormDialog>('#code-dialog')!;
            const button = evt.currentTarget as ButtonElement;

            dialog.href = ctx.data._links.self.href;
            dialog.show(button);
          }}
        >
          <span class="font-tnum">${ctx.data.code}</span>
        </vaadin-button>
      `,
    },
    {
      header: ctx => html`<foxy-i18n lang=${ctx.lang} key="date_created" ns=${ctx.ns}></foxy-i18n>`,
      cell: ctx => html`
        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.date_created })}
          class="text-tertiary"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `,
    },
    {
      hideBelow: 'sm',
      header: c => html`<foxy-i18n lang=${c.lang} key="end_date" ns=${c.ns}></foxy-i18n>`,
      cell: ctx => html`
        <foxy-i18n
          options=${JSON.stringify({ value: ctx.data.end_date })}
          class="text-tertiary"
          lang=${ctx.lang}
          key="date"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `,
    },
    {
      header: c => html`<foxy-i18n lang=${c.lang} key="current_balance" ns=${c.ns}></foxy-i18n>`,
      cell: ctx => html`
        <foxy-i18n
          options=${JSON.stringify({
            amount: `${ctx.data.current_balance} ${this.data?.currency_code}`,
            currencyDisplay: this.__currencyDisplay,
          })}
          lang=${ctx.lang}
          key="price"
          ns=${ctx.ns}
        >
        </foxy-i18n>
      `,
    },
  ];

  private static readonly __codesQueryOptions: Option[] = [
    { label: 'code', path: 'code', type: Type.String },
    { label: 'current_balance', path: 'current_balance', type: Type.Number },
    { label: 'end_date', path: 'end_date', type: Type.Date },
    { label: 'date_created', path: 'date_created', type: Type.Date },
    { label: 'date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __codesTableQuery: string | null = null;

  private __currencyDisplay = '';

  private __itemCategories = '';

  render(): TemplateResult {
    const hidden = this.hiddenSelector;
    const isNameHidden = hidden.matches('name', true);
    const isCurrencyHidden = hidden.matches('currency', true);
    const isExpiresHidden = hidden.matches('expires', true);

    return html`
      <div class="relative space-y-l">
        ${isNameHidden && isCurrencyHidden && isExpiresHidden
          ? ''
          : html`
              <div class="grid grid-cols-1 sm-grid-cols-3 md-grid-cols-4 gap-m">
                ${isNameHidden ? '' : html`<div class="md-col-span-2">${this.__renderName()}</div>`}
                ${isCurrencyHidden ? '' : this.__renderCurrency()}
                ${isExpiresHidden ? '' : this.__renderExpires()}
              </div>
            `}
        ${hidden.matches('codes', true) || !this.data ? '' : this.__renderCodes()}
        ${hidden.matches('product-restrictions', true) ? '' : this.__renderProductRestrictions()}
        ${hidden.matches('category-restrictions', true) || !this.data
          ? ''
          : this.__renderCategoryRestrictions()}
        ${hidden.matches('timestamps', true) ? '' : this.__renderTimestamps()}
        ${hidden.matches('create', true) || !!this.data ? '' : this.__renderCreate()}
        ${hidden.matches('delete', true) || !this.data ? '' : this.__renderDelete()}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !this.in('busy') && !this.in('fail'),
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  protected async _sendGet(): Promise<Data> {
    type Store = Resource<Rels.Store>;

    const giftCard = await super._sendGet();
    const store = await super._fetch<Store>(giftCard._links['fx:store'].href);
    const categoriesURL = new URL(store._links['fx:item_categories'].href);

    categoriesURL.searchParams.set('limit', '5');
    this.__currencyDisplay = store.use_international_currency_symbol ? 'code' : 'symbol';
    this.__itemCategories = categoriesURL.toString();

    return giftCard;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __getValidator(prefix: string) {
    return () => !this.errors.some(err => err.startsWith(prefix));
  }

  private __renderName() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('name:before')}

        <vaadin-text-field
          error-message=${this.__getErrorMessage('name')}
          helper-text=${this.t('gift_card_name_helper_text')}
          data-testid="name"
          class="w-full"
          label=${this.t('name')}
          .checkValidity=${this.__getValidator('name')}
          .value=${this.form.name ?? ''}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('name', true)}
          ?readonly=${this.readonlySelector.matches('name', true)}
          required
          @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.submit()}
          @input=${(evt: CustomEvent) => {
            const newName = (evt.currentTarget as TextFieldElement).value;
            this.edit({ name: newName });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot('name:after')}
      </div>
    `;
  }

  private __renderCurrency() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('currency:before')}

        <vaadin-combo-box
          item-label-path="label"
          item-value-path="value"
          item-id-path="value"
          class="w-full"
          label=${this.t('currency')}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('currency', true)}
          ?readonly=${this.readonlySelector.matches('currency', true)}
          .value=${this.form.currency_code?.toLowerCase() ?? ''}
          .items=${currencies.map(code => ({
            label: `${this.t(`currency_${code}`)} (${code.toUpperCase()})`,
            value: code,
          }))}
          @change=${(evt: CustomEvent) => {
            const comboBox = evt.currentTarget as ComboBoxElement;
            this.edit({ currency_code: comboBox.value });
          }}
        >
        </vaadin-combo-box>

        ${this.renderTemplateOrSlot('currency:after')}
      </div>
    `;
  }

  private __renderExpires() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('expires:before')}

        <x-frequency-input
          class="w-full"
          label=${this.t('expires_after')}
          placeholder=${this.t('select')}
          ?disabled=${!this.in('idle') || this.disabledSelector.matches('expires', true)}
          ?readonly=${this.readonlySelector.matches('expires', true)}
          .value=${this.form.expires_after ?? ''}
          @change=${(evt: FrequencyInputChangeEvent) => {
            const input = evt.currentTarget as FrequencyInput;
            this.edit({ expires_after: input.value });
          }}
        >
        </x-frequency-input>

        ${this.renderTemplateOrSlot('expires:after')}
      </div>
    `;
  }

  private __renderCodes() {
    const { disabledSelector, group, data, lang, ns } = this;

    const isDisabled = !this.in('idle') || disabledSelector.matches('codes', true);
    const filters = this.__codesTableQuery;
    const url = new URL(data!._links['fx:gift_card_codes'].href);

    new URLSearchParams(filters ?? '').forEach((value, name) => url.searchParams.set(name, value));
    url.searchParams.set('limit', '5');

    const filterButtonLabel = filters === null ? 'filter' : 'clear_filters';
    const filterButtonIcon = `icons:${filters === null ? 'filter-list' : 'clear'}`;

    return html`
      <foxy-form-dialog
        disabledcontrols=${disabledSelector.zoom('codes:generate:form').toString()}
        readonlycontrols=${this.readonlySelector.zoom('codes:generate:form').toString()}
        hiddencontrols="save-button ${this.hiddenSelector.zoom('codes:generate:form').toString()}"
        header="generate"
        parent=${data?._links['fx:generate_codes'].href ?? ''}
        group=${group}
        lang=${lang}
        form="foxy-generate-codes-form"
        ns=${ns}
        id="generate-codes-dialog"
        alert
        .related=${[url.toString()]}
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        disabledcontrols=${disabledSelector.zoom('codes:form').toString()}
        readonlycontrols=${this.readonlySelector.zoom('codes:form').toString()}
        hiddencontrols=${this.hiddenSelector.zoom('codes:form').toString()}
        header="code"
        parent=${url.toString()}
        group=${group}
        lang=${lang}
        form="foxy-gift-card-code-form"
        ns=${ns}
        id="code-dialog"
      >
      </foxy-form-dialog>

      <foxy-form-dialog
        disabledcontrols=${disabledSelector.zoom('codes:import:form').toString()}
        readonlycontrols=${this.readonlySelector.zoom('codes:import:form').toString()}
        hiddencontrols="save-button ${this.hiddenSelector.zoom('codes:generate:form').toString()}"
        header="import"
        parent=${data!._links['fx:gift_card_codes'].href}
        group=${group}
        lang=${lang}
        form="foxy-gift-card-codes-form"
        ns=${ns}
        id="import-dialog"
      >
      </foxy-form-dialog>

      <div>
        ${this.renderTemplateOrSlot('codes:before')}

        <div class="flex items-center justify-between mb-xs space-x-s">
          <foxy-i18n
            class="text-s font-medium text-secondary leading-none flex-1"
            lang=${lang}
            key="code_plural"
            ns=${ns}
          >
          </foxy-i18n>

          <vaadin-button
            theme="success tertiary small"
            ?disabled=${isDisabled}
            @click=${(evt: CustomEvent) => {
              const dialog = this.renderRoot.querySelector<FormDialog>('#generate-codes-dialog');
              const button = evt.currentTarget as ButtonElement;
              dialog?.show(button);
            }}
          >
            <foxy-i18n class="text-s" lang=${lang} key="generate" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:add"></iron-icon>
          </vaadin-button>

          <vaadin-button
            theme="contrast tertiary small"
            ?disabled=${isDisabled}
            @click=${(evt: CustomEvent) => {
              const dialog = this.renderRoot.querySelector<FormDialog>('#import-dialog');
              const button = evt.currentTarget as ButtonElement;
              dialog?.show(button);
            }}
          >
            <foxy-i18n class="text-s" lang=${lang} key="import" ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon="icons:open-in-browser"></iron-icon>
          </vaadin-button>

          <vaadin-button
            theme="contrast ${filters === null ? 'tertiary' : ''} small"
            ?disabled=${isDisabled}
            @click=${() => (this.__codesTableQuery = filters === null ? '' : null)}
          >
            <foxy-i18n class="text-s" lang=${lang} key=${filterButtonLabel} ns=${ns}></foxy-i18n>
            <iron-icon class="icon-inline text-s" icon=${filterButtonIcon}></iron-icon>
          </vaadin-button>
        </div>

        <foxy-query-builder
          class="bg-contrast-5 rounded-tl-l rounded-tr-s rounded-b-l p-m mb-s"
          lang=${lang}
          ns=${ns}
          ?disabled=${isDisabled}
          ?hidden=${filters === null}
          .options=${GiftCardForm.__codesQueryOptions}
          .value=${filters ?? ''}
          @change=${(evt: CustomEvent) => {
            const queryBuilder = evt.currentTarget as QueryBuilder;
            this.__codesTableQuery = queryBuilder.value;
          }}
        >
        </foxy-query-builder>

        <foxy-pagination first=${url.toString()} lang=${lang} ns=${ns} ?disabled=${isDisabled}>
          <foxy-table
            class="px-m mb-s border border-contrast-10 rounded-t-l rounded-b-l"
            group=${group}
            lang=${lang}
            ns=${ns}
            .columns=${this.__codesTableColumns}
          >
          </foxy-table>
        </foxy-pagination>

        ${this.renderTemplateOrSlot('codes:after')}
      </div>
    `;
  }

  private __renderProductRestrictions() {
    const scope = 'product-restrictions';
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(scope, true);
    const isReadonly = this.readonlySelector.matches(scope, true);
    const restrictions = this.form.product_code_restrictions ?? '';

    const groups = [
      { header: 'allow', items: [] as { label?: string; value: string }[] },
      { header: 'block', items: [] as { label?: string; value: string }[] },
    ];

    if (restrictions) {
      restrictions.split(',').forEach(value => {
        const isBlocklistValue = value.startsWith('-');
        const target = isBlocklistValue ? 1 : 0;
        const label = isBlocklistValue ? value.substring(1) : value;

        groups[target].items.push({ label, value });
      });
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('product-restrictions:before')}

        <div class="space-y-s">
          <x-group frame>
            <foxy-i18n
              class=${isDisabled ? 'text-disabled' : 'text-secondary'}
              slot="header"
              lang=${this.lang}
              key="product_restrictions"
              ns=${this.ns}
            >
            </foxy-i18n>

            <div class="grid sm-grid-cols-2 bg-contrast-10" style="gap: 1px">
              ${groups.map((group, index) => {
                return html`
                  <x-group class="bg-base pt-m">
                    <foxy-i18n
                      class=${isDisabled ? 'text-disabled' : 'text-tertiary'}
                      slot="header"
                      lang=${this.lang}
                      key=${group.header}
                      ns=${this.ns}
                    >
                    </foxy-i18n>

                    <x-editable-list
                      lang=${this.lang}
                      ns=${this.ns}
                      ?disabled=${isDisabled}
                      ?readonly=${isReadonly}
                      .items=${group.items}
                      @change=${(evt: CustomEvent) => {
                        const newItemsByGroup = [
                          index === 0 ? (evt.currentTarget as EditableList).items : groups[0].items,
                          index === 1 ? (evt.currentTarget as EditableList).items : groups[1].items,
                        ];

                        const newSanitizedItemsByGroup = newItemsByGroup
                          .map(list => list.map(v => v.value.replace(/^[\s-]*/, '').trimEnd()))
                          .map(list => list.filter(v => !!v))
                          .map(list => Array.from(new Set(list)));

                        const newRestrictions = newSanitizedItemsByGroup[0]
                          .concat(newSanitizedItemsByGroup[1].map(v => `-${v}`))
                          .join(',');

                        this.edit({ product_code_restrictions: newRestrictions });
                      }}
                    >
                    </x-editable-list>
                  </x-group>
                `;
              })}
            </div>
          </x-group>

          <foxy-i18n
            class=${classMap({
              'block text-xs leading-s transition-colors': true,
              'text-secondary': !isDisabled,
              'text-disabled': isDisabled,
            })}
            lang=${this.lang}
            key="gift_card_product_restrictions_explainer"
            ns=${this.ns}
          >
          </foxy-i18n>
        </div>

        ${this.renderTemplateOrSlot('product-restrictions:after')}
      </div>
    `;
  }

  private __renderCategoryRestrictions() {
    const scope = 'category-restrictions';
    const isDisabled = !this.in('idle') || this.disabledSelector.matches(scope, true);
    const isReadonly = this.readonlySelector.matches(scope, true);

    return html`
      ${this.renderTemplateOrSlot('category-restrictions:before')}

      <div class="space-y-xs">
        <foxy-pagination
          first=${this.__itemCategories}
          lang=${this.lang}
          ns=${this.ns}
          ?disabled=${isDisabled}
        >
          <foxy-i18n
            class="block text-s font-medium text-secondary leading-none mb-s"
            lang=${this.lang}
            key="category_restrictions"
            ns=${this.ns}
          >
          </foxy-i18n>

          <x-category-restrictions-page
            gift-card-item-categories=${ifDefined(
              this.data?._links['fx:gift_card_item_categories'].href
            )}
            gift-card=${this.href}
            class="border border-contrast-10 rounded-t-l rounded-b-l mb-s"
            group=${this.group}
            lang=${this.lang}
            ns=${this.ns}
            ?disabled=${isDisabled}
            ?readonly=${isReadonly}
          >
          </x-category-restrictions-page>
        </foxy-pagination>

        <foxy-i18n
          class="block text-xs leading-s text-secondary"
          lang=${this.lang}
          key="gift_card_category_restrictions_helper_text"
          ns=${this.ns}
        >
        </foxy-i18n>
      </div>

      ${this.renderTemplateOrSlot('category-restrictions:after')}
    `;
  }

  private __renderTimestamps() {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-property-table
          data-testid="timestamps"
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data?.[field]
              ? this.t('date', { value: new Date(this.data[field] as string) })
              : '',
          }))}
        >
        </x-property-table>

        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  }

  private __renderCreate() {
    const isCleanTemplateInvalid = this.in({ idle: { template: { clean: 'invalid' } } });
    const isDirtyTemplateInvalid = this.in({ idle: { template: { dirty: 'invalid' } } });
    const isCleanSnapshotInvalid = this.in({ idle: { snapshot: { clean: 'invalid' } } });
    const isDirtySnapshotInvalid = this.in({ idle: { snapshot: { dirty: 'invalid' } } });
    const isTemplateInvalid = isCleanTemplateInvalid || isDirtyTemplateInvalid;
    const isSnaphotInvalid = isCleanSnapshotInvalid || isDirtySnapshotInvalid;
    const isInvalid = isTemplateInvalid || isSnaphotInvalid;
    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          data-testid="create"
          class="w-full"
          theme="primary success"
          ?disabled=${isBusy || isInvalid || this.disabledSelector.matches('create', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} key="create" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  }

  private __renderDelete() {
    return html`
      <div>
        <foxy-internal-confirm-dialog
          data-testid="confirm"
          message="delete_prompt"
          confirm="delete"
          cancel="cancel"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.delete()}
        >
        </foxy-internal-confirm-dialog>

        ${this.renderTemplateOrSlot('delete:before')}

        <vaadin-button
          data-testid="delete"
          theme="primary error"
          class="w-full"
          ?disabled=${this.in('busy') || this.disabledSelector.matches('delete', true)}
          @click=${(evt: CustomEvent) => {
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
            confirm.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n ns=${this.ns} key="delete" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('delete:after')}
      </div>
    `;
  }
}
