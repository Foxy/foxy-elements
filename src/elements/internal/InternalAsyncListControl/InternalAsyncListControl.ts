import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CollectionPage, NucleonElement } from '../../public/index';
import type { BulkAction, SwipeAction } from './types';
import type { InternalSummaryControl } from '../InternalSummaryControl/InternalSummaryControl';
import type { InternalConfirmDialog } from '../InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { UpdateEvent } from '../../public/NucleonElement/UpdateEvent';
import type { FormDialog } from '../../index';
import type { Option } from '../../public/QueryBuilder/types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { render } from 'lit-html';
import { html } from 'lit-element';

export class InternalAsyncListControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      keepDialogOpenOnDelete: { type: Boolean, attribute: 'keep-dialog-open-on-delete' },
      keepDialogOpenOnPost: { type: Boolean, attribute: 'keep-dialog-open-on-post' },
      hideDeleteButton: { type: Boolean, attribute: 'hide-delete-button' },
      hideCreateButton: { type: Boolean, attribute: 'hide-create-button' },
      createPageHref: { attribute: 'create-page-href' },
      getPageHref: { attribute: false },
      related: { type: Array },
      layout: {},
      first: {},
      limit: { type: Number },
      form: {},
      formProps: { type: Object, attribute: 'form-props' },
      item: {},
      itemProps: { type: Object, attribute: 'item-props' },
      wide: { type: Boolean },
      open: { type: Boolean },
      hideWhenEmpty: { type: Boolean, attribute: 'hide-when-empty' },
      alert: { type: Boolean },
      actions: { attribute: false },
      bulkActions: { attribute: false },
      filters: { type: Array },
      filter: {},
      __selection: { attribute: false },
      __totalItems: { attribute: false },
      __isSelecting: { attribute: false },
      __notification: { attribute: false },
      __isFilterVisible: { attribute: false },
      __activeBulkAction: { attribute: false },
    };
  }

  /** If true, FormDialog won't automatically close after the associated form deletes the resource. */
  keepDialogOpenOnDelete = false;

  /** If true, FormDialog won't automatically close after the associated form creates a resource. */
  keepDialogOpenOnPost = false;

  /** If provided, renders Create button as a link to this page. */
  createPageHref: string | null = null;

  /** Bulk actions that appear when one or more items are selected. */
  bulkActions = [] as BulkAction[];

  /** Same as the `related` property of `NucleonElement`. */
  related = [] as string[];

  /** When set to `details`, makes the entire control collapsible. */
  layout: 'details' | null = null;

  /** Swipe actions. */
  actions = [] as SwipeAction[];

  /** Query parameters to apply to the `first` URL. */
  filters = [] as Option[];

  /** Limit query parameter to apply to the `first` URL. */
  limit = 20;

  /** URI of the first page of the hAPI collection to display. */
  first: string | null = null;

  /** Same as the `form` property of `FormDialog`. If set, will open a dialog on item click. */
  form: FormDialog['form'] = null;

  /** Props to pass through to the form rendered by `FormDialog`. */
  formProps: Record<string, unknown> = {};

  /** Same as the `item` property of `CollectionPage`. */
  item: CollectionPage<any>['item'] = null;

  /** Props to pass through to the `CollectionPage` rendering items. */
  itemProps: Record<string, unknown> = {};

  /** Same as the `wide` property of `FormDialog`. */
  wide = false;

  /** Visually hides the control when the collection is empty or loading. */
  hideWhenEmpty = false;

  /** Same as the `open` property of `InternalSummaryControl`. */
  open = false;

  /** Same as the `alert` property of `FormDialog`. */
  alert = false;

  /** Hides Delete Swipe Action if true. */
  hideDeleteButton = false;

  /** Hides Create button if true. */
  hideCreateButton = false;

  /** If set, renders list items as <a> tags. */
  getPageHref: ((itemHref: string, item: unknown) => string | null) | null = null;

  filter: string | null = null;

  private __deletionConfimationCallback: (() => void) | null = null;

  private __cachedCardRenderer: {
    item: InternalAsyncListControl['item'];
    render: ItemRenderer;
  } | null = null;

  private __activeBulkAction: BulkAction | null = null;

  private __isFilterVisible = false;

  private __notification: { key: string; theme?: string } | null = null;

  private __isSelecting = false;

  private __totalItems = 0;

  private __selection: HALJSONResource[] = [];

  private __itemRenderer: ItemRenderer = ctx => {
    const item = this.__cardRenderer(ctx);
    const readonlyItem = html`<div class="bg-contrast-5">${item}</div>`;

    if (!ctx.data) return readonlyItem;

    if (this.__isSelecting) {
      return html`
        <vaadin-checkbox
          class=${classMap({ 'block w-full': true, 'bg-contrast-5': this.layout === 'details' })}
          style="padding-left: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
          data-async-list-control
          ?disabled=${this.disabled || !!this.__activeBulkAction}
          ?checked=${this.__selection.find(v => v._links.self.href === ctx.data!._links.self.href)}
          @change=${(evt: CustomEvent) => {
            if ((evt.currentTarget as CheckboxElement).checked) {
              this.__selection = [...this.__selection, ctx.data!];
            } else {
              this.__selection = this.__selection.filter(
                v => v._links.self.href !== ctx.data!._links.self.href
              );
            }
          }}
        >
          ${this.__cardRenderer(ctx)}
        </vaadin-checkbox>
      `;
    }

    const href = this.getPageHref?.(ctx.href, ctx.data);
    if (typeof href !== 'string' && !this.form) return readonlyItem;

    const isDisabled = this.disabledSelector.matches('card', true);
    const card = this.__cardRenderer(ctx);
    let clickableItem: TemplateResult;

    const wrapperClass = classMap({
      'rounded-t': this.layout !== 'details' && !ctx.previous,
      'rounded-b': !ctx.next,
      'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
      'text-left w-full block bg-contrast-5 transition-colors': true,
      'hover-bg-contrast-10': !isDisabled,
    });

    if (this.getPageHref) {
      if (isDisabled) {
        clickableItem = html`<div class=${wrapperClass}>${card}</div>`;
      } else {
        const href = this.getPageHref(ctx.href, ctx.data);
        clickableItem = html`<a class=${wrapperClass} href=${href}>${card}</a>`;
      }
    } else {
      const handleClick = (evt: Event) => {
        const clickEvent = new CustomEvent<string>('itemclick', {
          cancelable: true,
          composed: true,
          bubbles: true,
          detail: ctx.href,
        });

        if (this.dispatchEvent(clickEvent)) {
          const button = evt.currentTarget as HTMLButtonElement;
          const dialog = this.__dialog;

          dialog.header = 'header_update';
          dialog.href = ctx.href;
          dialog.show(button);
        }
      };

      clickableItem = html`
        <button ?disabled=${isDisabled} class=${wrapperClass} @click=${handleClick}>${card}</button>
      `;
    }

    if ((this.hideDeleteButton && !this.actions.length) || this.readonly) return clickableItem;

    return html`
      <foxy-swipe-actions class="block">
        ${clickableItem}
        ${this.actions.map(action => {
          return html`
            <vaadin-button
              data-testclass="action"
              theme=${action.theme}
              class="h-full rounded-none relative"
              slot="action"
              ?disabled=${this.disabled}
              @click=${() => action.onClick(ctx.data!)}
            >
              <foxy-i18n
                class=${classMap({
                  'transition-opacity': true,
                  'opacity-0': action.state !== 'idle',
                })}
                infer=""
                key=${action.text}
              >
              </foxy-i18n>
              <div
                class=${classMap({
                  'absolute inset-0 flex items-center justify-center transition-opacity': true,
                  'opacity-0': action.state === 'idle',
                })}
              >
                <foxy-spinner layout="no-label" infer="spinner" state=${action.state}>
                </foxy-spinner>
              </div>
            </vaadin-button>
          `;
        })}
        ${this.hideDeleteButton
          ? ''
          : html`
              <vaadin-button
                theme="primary error"
                class="h-full rounded-none"
                slot="action"
                @click=${(evt: CustomEvent) => {
                  const button = evt.currentTarget as HTMLElement;
                  const confirm = this.renderRoot.querySelector(
                    '#confirm'
                  ) as InternalConfirmDialog;

                  confirm.show(button);

                  this.__deletionConfimationCallback = () => {
                    const cardButton = button.parentElement!.firstElementChild!;
                    const card = cardButton.querySelector<NucleonElement<any>>('[href]');

                    card?.delete();
                    this.__deletionConfimationCallback = null;
                  };
                }}
              >
                <foxy-i18n infer="" key="delete_button_text"></foxy-i18n>
              </vaadin-button>
            `}
      </foxy-swipe-actions>
    `;
  };

  render(): TemplateResult {
    const hidden = this.hideWhenEmpty && !this.__totalItems;
    return html`<div class=${classMap({ hidden })}>${super.render()}</div>`;
  }

  renderControl(): TemplateResult {
    const actions = this.__renderActions();
    const content = this.__renderContent();

    return html`
      ${this.form && !this.__isSelecting
        ? html`
            <foxy-form-dialog
              parent=${ifDefined(this.first ?? void 0)}
              infer="dialog"
              id="form"
              ?wide=${this.wide}
              ?alert=${this.alert}
              ?keep-open-on-post=${this.keepDialogOpenOnPost}
              ?keep-open-on-delete=${this.keepDialogOpenOnDelete}
              .related=${this.related}
              .props=${this.formProps}
              .form=${this.form as any}
            >
            </foxy-form-dialog>
          `
        : ''}
      ${this.hideDeleteButton || this.readonly || this.__isSelecting
        ? ''
        : html`
            <foxy-internal-confirm-dialog
              message="delete_message"
              confirm="delete_confirm"
              cancel="delete_cancel"
              header="delete_header"
              theme="error"
              infer=""
              id="confirm"
              @hide=${(evt: DialogHideEvent) => {
                if (!evt.detail.cancelled) this.__deletionConfimationCallback?.();
              }}
            >
            </foxy-internal-confirm-dialog>
          `}
      ${this.layout === 'details'
        ? html`
            <foxy-internal-summary-control
              layout="details"
              count=${ifDefined(this.open ? void 0 : `${this.__totalItems}`)}
              infer=""
              ?open=${this.open}
              @toggle=${(evt: CustomEvent) => {
                const summary = evt.currentTarget as InternalSummaryControl;
                this.open = summary.open;
                if (!evt.composed && !evt.bubbles) this.dispatchEvent(new CustomEvent('toggle'));
              }}
            >
              ${actions.length
                ? html`
                    <div class="flex gap-s">
                      <foxy-i18n
                        infer=""
                        class="mr-auto text-tertiary"
                        key="total_items"
                        .options=${{ count: this.__totalItems }}
                      >
                      </foxy-i18n>
                      ${actions}
                    </div>
                  `
                : ''}
              <div class="p-0 bg-transparent">${content}</div>
            </foxy-internal-summary-control>
          `
        : html`
            <div class="flex gap-s items-center justify-between font-medium">
              <span class="text-body mr-auto text-l">
                ${this.label && this.label !== 'label' ? this.label : ''}
              </span>
              ${actions}
            </div>

            <div
              class="text-secondary text-s"
              ?hidden=${!this.helperText || this.helperText === 'helper_text'}
            >
              ${this.helperText}
            </div>

            ${content}
          `}

      <div
        class="mt-s text-s leading-xs text-error"
        ?hidden=${!this._errorMessage || this.disabled || this.readonly || this.__isSelecting}
      >
        ${this._errorMessage}
      </div>

      <vaadin-notification
        position="bottom-end"
        duration="3000"
        theme=${ifDefined(this.__notification?.theme)}
        .renderer=${(root: HTMLElement) => {
          if (!root.firstElementChild) root.innerHTML = '<span></span>';

          const theme = this.__notification?.theme;
          const layout = html`
            <foxy-i18n
              style="color: var(--lumo-${theme ? `${theme}-contrast` : 'body-text'}-color)"
              lang=${this.lang}
              key=${this.__notification?.key}
              ns="${this.ns} pagination"
            >
            </foxy-i18n>
          `;

          render(layout, root.firstElementChild!);
        }}
      >
      </vaadin-notification>
    `;
  }

  private get __cardRenderer() {
    const item = this.item;

    if (this.__cachedCardRenderer?.item !== item) {
      this.__cachedCardRenderer = {
        item: item,
        render:
          typeof item === 'string'
            ? (new Function(
                'ctx',
                `return ctx.html\`
                  <${item}
                    related=\${JSON.stringify(ctx.related)}
                    parent=\${ctx.parent}
                    style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                    infer=""
                    href=\${ctx.href}
                    ...=\${ctx.spread(ctx.props)}
                  >
                  </${item}>\``
              ) as ItemRenderer)
            : ctx => html`
                <div style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)">
                  ${item?.(ctx)}
                </div>
              `,
      };
    }

    return this.__cachedCardRenderer.render;
  }

  private get __dialog() {
    return this.renderRoot.querySelector('#form') as FormDialog;
  }

  private __renderActions() {
    return [
      this.filters.length > 0 && !this.__isSelecting
        ? html`
            <foxy-internal-async-list-control-filter-overlay
              .noVerticalOverlap=${true}
              .positionTarget=${this.renderRoot.querySelector('#filters')}
              .model=${{
                options: this.filters,
                value: this.filter ?? '',
                lang: this.lang,
                ns: this.ns,
              }}
              ?opened=${this.__isFilterVisible}
              @vaadin-overlay-close=${() => (this.__isFilterVisible = false)}
              @search=${(evt: CustomEvent<string | undefined>) => {
                this.filter = evt.detail ?? '';
              }}
            >
            </foxy-internal-async-list-control-filter-overlay>

            <vaadin-button
              theme="tertiary-inline contrast"
              id="filters"
              ?disabled=${this.disabled}
              @click=${() => (this.__isFilterVisible = !this.__isFilterVisible)}
            >
              <foxy-i18n infer="pagination" key="search_button_text"></foxy-i18n>
              ${this.filter ? html`<span>(${this.filter.split('&').length})</span>` : ''}
            </vaadin-button>
          `
        : '',

      this.bulkActions.length > 0 && this.first
        ? html`
            ${this.__selection.length > 0
              ? this.bulkActions.map(action => {
                  const nPrefix = `${action.name}_bulk_action_notification`;
                  const cPrefix = `${action.name}_bulk_action_caption`;
                  const isActive = this.__activeBulkAction?.name === action.name;

                  return html`
                    <vaadin-button
                      data-testclass="bulk-action"
                      theme="tertiary-inline"
                      ?disabled=${this.disabled || !!this.__activeBulkAction}
                      @click=${async () => {
                        this.__activeBulkAction = action;

                        try {
                          await action.onClick(this.__selection);
                          this.__selection = [];
                          this.__isSelecting = false;
                          this.__notification = { key: `${nPrefix}_done`, theme: 'success' };
                        } catch {
                          this.__notification = { key: `${nPrefix}_fail`, theme: 'error' };
                        } finally {
                          this.__activeBulkAction = null;
                          this.renderRoot.querySelector('vaadin-notification')?.open();
                        }
                      }}
                    >
                      <foxy-i18n
                        infer="pagination"
                        key="${cPrefix}_${isActive ? 'busy' : 'idle'}"
                        .options=${{ count: this.__selection.length }}
                      >
                      </foxy-i18n>
                    </vaadin-button>
                  `;
                })
              : ''}
            <vaadin-button
              theme="tertiary-inline contrast"
              ?disabled=${this.disabled || !!this.__activeBulkAction}
              @click=${() => {
                this.__isSelecting = !this.__isSelecting;
                this.__selection = [];
              }}
            >
              <foxy-i18n
                infer="pagination"
                key=${this.__isSelecting ? 'cancel_button_text' : 'select_button_text'}
              >
              </foxy-i18n>
            </vaadin-button>
          `
        : '',

      (!this.form && !this.createPageHref) ||
      this.readonly ||
      this.hideCreateButton ||
      this.__isSelecting
        ? ''
        : this.createPageHref && !this.disabled
        ? html`
            <a
              class="rounded-s text-primary group focus-outline-none focus-ring-2 focus-ring-primary-50"
              href=${this.createPageHref}
            >
              <foxy-i18n
                class="transition-opacity group-hover-opacity-80"
                infer=""
                key="create_button_text"
              >
              </foxy-i18n>
            </a>
          `
        : html`
            <vaadin-button
              theme="tertiary-inline"
              ?disabled=${this.disabled}
              @click=${(evt: Event) => {
                evt.preventDefault();
                evt.stopPropagation();

                const dialog = this.__dialog;
                const button = evt.currentTarget as HTMLButtonElement;

                dialog.header = 'header_create';
                dialog.href = '';
                dialog.show(button);
              }}
            >
              <foxy-i18n infer="pagination" key="create_button_text"></foxy-i18n>
            </vaadin-button>
          `,
    ].filter(v => !!v);
  }

  private __renderContent() {
    const helperText = this.helperText;
    const isDetails = this.layout === 'details';
    const label = this.label;

    let first: string | undefined;

    try {
      const url = new URL(this.first ?? '');
      const filter = new URLSearchParams(this.filter ?? '');

      url.searchParams.set('limit', String(this.limit));
      filter.forEach((value, key) => url.searchParams.set(key, value));
      first = url.toString();
    } catch {
      first = undefined;
    }

    return html`
      <foxy-pagination
        first=${ifDefined(first)}
        infer="pagination"
        class=${classMap({ hidden: isDetails && this.__totalItems === 0 })}
      >
        <foxy-collection-page
          class=${classMap({
            'grid grid-cols-1 overflow-hidden': true,
            'rounded': !isDetails,
            'mt-s':
              !isDetails &&
              ((!!label && label !== 'label') || (!!helperText && helperText !== 'helper_text')),
          })}
          style="gap: 1px"
          infer="card"
          .related=${this.related}
          .props=${this.itemProps}
          .item=${this.__itemRenderer}
          @update=${(evt: UpdateEvent) => {
            const page = evt.currentTarget as CollectionPage<any>;
            this.__totalItems = parseInt(page.data?.total_items ?? 0);
          }}
        >
        </foxy-collection-page>
      </foxy-pagination>
    `;
  }
}
