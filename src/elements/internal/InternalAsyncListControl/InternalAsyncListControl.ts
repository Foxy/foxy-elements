import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CollectionPage, NucleonElement } from '../../public/index';
import type { InternalConfirmDialog } from '../InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../index';

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
      item: {},
      itemProps: { type: Object, attribute: 'item-props' },
      wide: { type: Boolean },
      alert: { type: Boolean },
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

  /** Limit query parameter to apply to the `first` URL. */
  limit = 20;

  /** URI of the first page of the hAPI collection to display. */
  first: string | null = null;

  /** Same as the `form` property of `FormDialog`. If set, will open a dialog on item click. */
  form: FormDialog['form'] = null;

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
        const button = evt.currentTarget as HTMLButtonElement;
        const dialog = this.__dialog;

        dialog.header = 'header_update';
        dialog.href = ctx.href;
        dialog.show(button);
      };

      clickableItem = html`
        <button ?disabled=${isDisabled} class=${wrapperClass} @click=${handleClick}>${card}</button>
      `;
    }

    if (this.hideDeleteButton || this.readonly) return clickableItem;

    return html`
      <foxy-swipe-actions class="block">
        ${clickableItem}

        <vaadin-button
          theme="primary error"
          class="h-full"
          slot="action"
          @click=${(evt: CustomEvent) => {
            const button = evt.currentTarget as HTMLElement;
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;

            confirm.show(button);

            this.__deletionConfimationCallback = () => {
              const cardButton = button.previousElementSibling!;
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

  renderControl(): TemplateResult {
    let first: string | undefined;

    try {
      const url = new URL(this.first ?? '');
      url.searchParams.set('limit', String(this.limit));
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
      <div class="flex items-center justify-between mb-xs text-s font-medium">
        <span class="text-secondary">
          ${this.label && this.label !== 'label' ? this.label : ''}
        </span>
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
