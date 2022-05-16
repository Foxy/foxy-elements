import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { FormDialog } from '../../index';

import { html } from 'lit-element';
import { InternalControl } from '../InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { ItemRenderer } from '../../public/CollectionPage/types';
import { classMap } from '../../../utils/class-map';

export class InternalCollectionCard extends InternalControl {
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

  related = [] as string[];

  limit = 20;

  first = '';

  form: FormDialog['form'] = '';

  item = '';

  open = false;

  renderControl(): TemplateResult {
    let first: string;

    try {
      const url = new URL(this.first);
      url.searchParams.set('limit', String(this.limit));
      first = url.toString();
    } catch {
      first = this.first;
    }

    const cardRenderer = new Function(
      'ctx',
      `return ctx.html\`<${this.item} related=\${JSON.stringify(ctx.related)} parent=\${ctx.parent} class="p-m" infer href=\${ctx.href}></${this.item}>\``
    ) as ItemRenderer;

    const itemRenderer: ItemRenderer = ctx => {
      if (this.form && !!ctx.data) {
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
              const dialog = this.renderRoot.querySelector('#form') as FormDialog;
              const button = evt.currentTarget as HTMLButtonElement;

              dialog.header = 'header_update';
              dialog.href = ctx.href;
              dialog.show(button);
            }}
          >
            ${cardRenderer(ctx)}
          </button>
        `;
      }

      return cardRenderer(ctx);
    };

    return html`
      <foxy-internal-details
        summary="title"
        infer=""
        ?open=${this.open}
        @toggle=${(evt: Event) => {
          this.open = (evt.currentTarget as InternalCollectionCard).open;
        }}
      >
        ${this.form
          ? html`
              <foxy-form-dialog
                parent=${first}
                group=${ifDefined(this.nucleon?.group)}
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

                        const dialog = this.renderRoot.querySelector('#form') as FormDialog;

                        dialog.header = 'header_create';
                        dialog.href = '';
                        dialog.show(evt.currentTarget as HTMLButtonElement);
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
            group=${ifDefined(this.nucleon?.group)}
            infer="card"
            .related=${this.related}
            .item=${itemRenderer as any}
          >
          </foxy-collection-page>
        </foxy-pagination>
      </foxy-internal-details>
    `;
  }
}
