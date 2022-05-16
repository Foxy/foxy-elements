import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CollectionPage } from '../../public';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../index';

import { InternalControl } from '../InternalControl/InternalControl';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-element';

/**
 * Internal control displaying a collapsible card with
 * optionally editable hAPI collection items.
 *
 * @tag foxy-internal-async-details-control
 * @since 1.17.0
 */
export class InternalAsyncDetailsControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      related: { type: Array },
      first: { type: String },
      limit: { type: Number },
      form: { type: String },
      item: { type: String },
      open: { type: Boolean },
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

  /** Same as the `open` property of `InternalDetails`. */
  open = false;

  private __itemRenderer: ItemRenderer = ctx => {
    if (!this.form || !ctx.data) return this.__cardRenderer(ctx);

    const isDisabled = this.disabledSelector.matches('card', true);

    return html`
      <button
        ?disabled=${isDisabled}
        class=${classMap({
          'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
          'text-left w-full block transition-colors': true,
          'hover-bg-contrast-5': !isDisabled,
        })}
        @click=${(evt: Event) => {
          const button = evt.currentTarget as HTMLButtonElement;
          const dialog = this.__dialog;

          dialog.header = 'header_update';
          dialog.href = ctx.href;
          dialog.show(button);
        }}
      >
        ${this.__cardRenderer(ctx)}
      </button>
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
      <foxy-internal-details
        summary="title"
        infer=""
        ?open=${this.open}
        @toggle=${(evt: Event) =>
          (this.open = (evt.currentTarget as InternalAsyncDetailsControl).open)}
      >
        ${this.form
          ? html`
              <foxy-form-dialog
                parent=${first}
                infer="dialog"
                id="form"
                .related=${this.related}
                .form=${this.form as any}
              >
              </foxy-form-dialog>

              ${this.readonly
                ? ''
                : html`
                    <button
                      class="h-xs w-xs rounded-full text-success flex items-center justify-center text-l focus-outline-none focus-ring-2 focus-ring-primary-50"
                      slot="actions"
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
                      <iron-icon class="icon-inline" icon="icons:add"></iron-icon>
                    </button>
                  `}
            `
          : ''}

        <foxy-pagination class="px-m pb-s" first=${first} infer="pagination">
          <foxy-collection-page
            class="-mx-m block divide-y divide-contrast-10 mb-s"
            infer="card"
            .related=${this.related}
            .item=${this.__itemRenderer as any}
          >
          </foxy-collection-page>
        </foxy-pagination>
      </foxy-internal-details>
    `;
  }

  private get __dialog() {
    return this.renderRoot.querySelector('#form') as FormDialog;
  }

  private get __cardRenderer() {
    return new Function(
      'ctx',
      `return ctx.html\`<${this.item} related=\${JSON.stringify(ctx.related)} parent=\${ctx.parent} class="p-m" infer href=\${ctx.href}></${this.item}>\``
    ) as ItemRenderer;
  }
}
