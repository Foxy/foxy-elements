import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CollectionPage, NucleonElement } from '../../public';
import type { InternalConfirmDialog } from '../InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../index';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-element';

export class InternalAsyncListControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      hideDeleteButton: { type: Boolean, attribute: 'hide-delete-button' },
      hideCreateButton: { type: Boolean, attribute: 'hide-create-button' },
      getPageHref: { attribute: false },
      related: { type: Array },
      first: { type: String },
      limit: { type: Number },
      form: { type: String },
      item: { type: String },
      wide: { type: Boolean },
      alert: { type: Boolean },
    };
  }

  /** Same as the `related` property of `NucleonElement`. */
  related = [] as string[];

  /** Limit query parameter to apply to the `first` URL. */
  limit = 20;

  /** URI of the first page of the hAPI collection to display. */
  first = '';

  /** Same as the `form` property of `FormDialog`. If set, will open a dialog on item click. */
  form: FormDialog['form'] = '';

  /** Same as the `item` property of `CollectionPage`. */
  item: CollectionPage<any>['item'] = '';

  /** Same as the `wide` property of `FormDialog`. */
  wide = false;

  /** Same as the `alert` property of `FormDialog`. */
  alert = false;

  /** Hides Delete Swipe Action if true. */
  hideDeleteButton = false;

  /** Hides Create button if true. */
  hideCreateButton = false;

  /** If set, renders list items as <a> tags. */
  getPageHref: ((itemHref: string, item: unknown) => string) | null = null;

  private __deletionConfimationCallback: (() => void) | null = null;

  private __cachedCardRenderer: {
    item: InternalAsyncListControl['item'];
    render: ItemRenderer;
  } | null = null;

  private __itemRenderer: ItemRenderer = ctx => {
    if (!(this.form || this.getPageHref) || !ctx.data) return this.__cardRenderer(ctx);

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

    if (this.hideDeleteButton) return clickableItem;

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
    let first: string;

    try {
      const url = new URL(this.first);
      url.searchParams.set('limit', String(this.limit));
      first = url.toString();
    } catch {
      first = this.first;
    }

    return html`
      ${this.form
        ? html`
            <foxy-form-dialog
              parent=${first}
              infer="dialog"
              id="form"
              ?wide=${this.wide}
              ?alert=${this.alert}
              .related=${this.related}
              .form=${this.form as any}
            >
            </foxy-form-dialog>

            ${this.hideDeleteButton
              ? ''
              : html`
                  <foxy-internal-confirm-dialog
                    message="delete_message"
                    confirm="delete_confirm"
                    cancel="delete_cancel"
                    header="delete_header"
                    theme="error"
                    lang=${this.lang}
                    ns=${this.ns}
                    id="confirm"
                    @hide=${(evt: DialogHideEvent) => {
                      if (!evt.detail.cancelled) this.__deletionConfimationCallback?.();
                    }}
                  >
                  </foxy-internal-confirm-dialog>
                `}
          `
        : ''}
      ${this.label && this.label !== 'label'
        ? html`<div class="font-medium text-secondary text-s mb-xs">${this.label}</div>`
        : ''}

      <foxy-pagination first=${first} infer="pagination">
        <foxy-collection-page
          class="mb-s block divide-y divide-contrast-5 rounded overflow-hidden bg-contrast-5"
          infer="card"
          .related=${this.related}
          .item=${this.__itemRenderer as any}
        >
        </foxy-collection-page>

        ${!this.form || this.readonly || this.hideCreateButton
          ? ''
          : html`
              <vaadin-button
                class="mb-s w-full"
                theme="success"
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
                <foxy-i18n infer="" key="create_button_text"></foxy-i18n>
              </vaadin-button>
            `}
      </foxy-pagination>
    `;
  }

  private get __dialog() {
    return this.renderRoot.querySelector('#form') as FormDialog;
  }

  private get __cardRenderer() {
    if (this.__cachedCardRenderer?.item !== this.item) {
      this.__cachedCardRenderer = {
        item: this.item,
        render:
          typeof this.item === 'string'
            ? (new Function(
                'ctx',
                `return ctx.html\`<${this.item} related=\${JSON.stringify(ctx.related)} parent=\${ctx.parent} style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)" infer href=\${ctx.href}></${this.item}>\``
              ) as ItemRenderer)
            : this.item,
      };
    }

    return this.__cachedCardRenderer.render;
  }
}
