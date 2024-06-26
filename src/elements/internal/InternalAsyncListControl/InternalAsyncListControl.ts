import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CollectionPage, NucleonElement } from '../../public/index';
import type { InternalConfirmDialog } from '../InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../index';
import type { Option } from '../../public/QueryBuilder/types';
import type { Action } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
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
      first: {},
      limit: { type: Number },
      form: {},
      formProps: { type: Object, attribute: 'form-props' },
      item: {},
      itemProps: { type: Object, attribute: 'item-props' },
      wide: { type: Boolean },
      alert: { type: Boolean },
      actions: { type: Array },
      filters: { type: Array },
      __filter: { attribute: false },
      __isFilterVisible: { attribute: false },
    };
  }

  /** If true, FormDialog won't automatically close after the associated form deletes the resource. */
  keepDialogOpenOnDelete = false;

  /** If true, FormDialog won't automatically close after the associated form creates a resource. */
  keepDialogOpenOnPost = false;

  /** If provided, renders Create button as a link to this page. */
  createPageHref: string | null = null;

  /** Same as the `related` property of `NucleonElement`. */
  related = [] as string[];

  /** Swipe actions. */
  actions = [] as Action[];

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

  /** Same as the `alert` property of `FormDialog`. */
  alert = false;

  /** Hides Delete Swipe Action if true. */
  hideDeleteButton = false;

  /** Hides Create button if true. */
  hideCreateButton = false;

  /** If set, renders list items as <a> tags. */
  getPageHref: ((itemHref: string, item: unknown) => string | null) | null = null;

  private __deletionConfimationCallback: (() => void) | null = null;

  private __cachedCardRenderer: {
    item: InternalAsyncListControl['item'];
    render: ItemRenderer;
  } | null = null;

  private __isFilterVisible = false;

  private __itemRenderer: ItemRenderer = ctx => {
    if (!ctx.data) return this.__cardRenderer(ctx);

    const href = this.getPageHref?.(ctx.href, ctx.data);
    if (typeof href !== 'string' && !this.form) return this.__cardRenderer(ctx);

    const isDisabled = this.disabledSelector.matches('card', true);
    const card = this.__cardRenderer(ctx);
    let clickableItem: TemplateResult;

    const wrapperClass = classMap({
      'rounded-t': !ctx.previous,
      'rounded-b': !ctx.next,
      'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
      'text-left w-full block transition-colors': true,
      'hover-bg-contrast-5': !isDisabled,
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

    if (this.hideDeleteButton || this.readonly) return clickableItem;

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

        <vaadin-button
          theme="primary error"
          class="h-full rounded-none"
          slot="action"
          @click=${(evt: CustomEvent) => {
            const button = evt.currentTarget as HTMLElement;
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;

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
      </foxy-swipe-actions>
    `;
  };

  private __filter = '';

  renderControl(): TemplateResult {
    let first: string | undefined;

    try {
      const url = new URL(this.first ?? '');
      const filter = new URLSearchParams(this.__filter);

      url.searchParams.set('limit', String(this.limit));
      filter.forEach((value, key) => url.searchParams.set(key, value));
      first = url.toString();
    } catch {
      first = undefined;
    }

    return html`
      ${this.form
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
      ${this.hideDeleteButton || this.readonly
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
      <div class="flex gap-m items-center justify-between mb-xs text-s font-medium">
        <span class="text-secondary">
          ${this.label && this.label !== 'label' ? this.label : ''}
        </span>

        ${this.filters.length > 0
          ? html`
              <foxy-internal-async-list-control-filter-overlay
                .noVerticalOverlap=${true}
                .positionTarget=${this.renderRoot.querySelector('#filters')}
                .model=${{
                  options: this.filters,
                  value: this.__filter,
                  lang: this.lang,
                  ns: this.ns,
                }}
                ?opened=${this.__isFilterVisible}
                @vaadin-overlay-close=${() => (this.__isFilterVisible = false)}
                @search=${(evt: CustomEvent<string | undefined>) => {
                  this.__filter = evt.detail ?? '';
                }}
              >
              </foxy-internal-async-list-control-filter-overlay>

              <vaadin-button
                theme="tertiary-inline contrast"
                class="ml-auto"
                id="filters"
                ?disabled=${this.disabled}
                @click=${() => (this.__isFilterVisible = !this.__isFilterVisible)}
              >
                <foxy-i18n infer="pagination" key="search_button_text"></foxy-i18n>
              </vaadin-button>
            `
          : ''}
        ${(!this.form && !this.createPageHref) || this.readonly || this.hideCreateButton
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
            `}
      </div>

      <foxy-pagination first=${ifDefined(first)} infer="pagination">
        <foxy-collection-page
          class=${classMap({
            'block divide-y divide-contrast-5 rounded overflow-hidden': true,
            'ring-1 ring-inset ring-contrast-10': !this.form && !this.getPageHref,
            'bg-contrast-5': !!this.form || !!this.getPageHref,
          })}
          infer="card"
          .related=${this.related}
          .props=${this.itemProps}
          .item=${this.__itemRenderer as any}
        >
        </foxy-collection-page>
      </foxy-pagination>

      <div
        class=${classMap({
          'transition-colors mt-xs text-xs': true,
          'text-secondary group-hover-text-body': !this.disabled && !this.readonly,
          'text-disabled': this.disabled,
        })}
        ?hidden=${!this.helperText || this.helperText === 'helper_text'}
      >
        ${this.helperText}
      </div>

      <div
        class="mt-xs text-xs leading-xs text-error"
        ?hidden=${!this._errorMessage || this.disabled || this.readonly}
      >
        ${this._errorMessage}
      </div>
    `;
  }

  private get __dialog() {
    return this.renderRoot.querySelector('#form') as FormDialog;
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
}
