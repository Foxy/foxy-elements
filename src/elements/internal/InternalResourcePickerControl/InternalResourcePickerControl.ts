import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../public/FormDialog/FormDialog';
import type { Option } from '../../public/QueryBuilder/types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { classMap } from '../../../utils/class-map';
import { uniqueId } from 'lodash-es';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit-html';

import memoize from 'lodash-es/memoize';

export class InternalResourcePickerControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      virtualHost: {},
      filters: { type: Array },
      first: {},
      item: {},
    };
  }

  virtualHost = uniqueId('internal-resource-picker-control-');

  filters: Option[] = [];

  first: string | null = null;

  item: string | null = null;

  private readonly __getItemRenderer = memoize((item: string | null) => {
    return new Function(
      'ctx',
      `return ctx.html\`
        <${item ?? 'foxy-null'}
          related=\${JSON.stringify(ctx.related)}
          parent=\${ctx.parent}
          infer="card"
          href=$\{ctx.href}
          ...=\${ctx.spread(ctx.props)}
        >
        </${item ?? 'foxy-null'}>\``
    ) as ItemRenderer;
  });

  renderControl(): TemplateResult {
    return html`
      <foxy-form-dialog
        parent="foxy://${this.virtualHost}/select"
        infer="dialog"
        form="foxy-internal-resource-picker-control-form"
        alert
        .props=${{
          '.selectionProps': {
            '.filters': this.filters,
            '.first': this.first,
            '.item': this.item,
          },
        }}
        @fetch=${this.__handleFetchEvent}
      >
      </foxy-form-dialog>

      <div class="block group">
        <div
          class=${classMap({
            'transition-colors mb-xs font-medium text-s': true,
            'text-secondary group-hover-text-body': !this.disabled && !this.readonly,
            'text-secondary': this.readonly,
            'text-disabled': this.disabled,
          })}
        >
          ${this.label}
        </div>

        <button
          class=${classMap({
            'block w-full rounded text-left transition-colors': true,
            'border border-dashed': true,
            'border-transparent': !this.readonly,
            'cursor-pointer bg-contrast-5 hover-bg-contrast-10': !this.disabled && !this.readonly,
            'cursor-default bg-contrast-5': this.disabled,
            'cursor-default border-contrast-30': this.readonly,
            'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
          })}
          style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
          ?disabled=${this.disabled || this.readonly}
          @click=${(evt: MouseEvent) => {
            const button = evt.currentTarget as HTMLButtonElement;
            const dialog = this.renderRoot.querySelector('foxy-form-dialog') as FormDialog;

            dialog.href = '';
            dialog.show(button);
          }}
        >
          <div class=${classMap({ 'transition-opacity': true, 'opacity-50': this.disabled })}>
            ${this.__getItemRenderer(this.item)({
              html,
              data: null,
              href: (this._value as string | undefined) || '',
              related: [],
              parent: '',
              props: {},
              spread: spread,
              simplifyNsLoading: this.simplifyNsLoading,
              disabled: this.disabled,
              disabledControls: this.disabledControls,
              readonly: this.readonly,
              readonlyControls: this.readonlyControls,
              hidden: this.hidden,
              hiddenControls: this.hiddenControls,
              templates: this.templates,
              previous: null,
              next: null,
              group: this.nucleon?.group ?? '',
              lang: this.lang,
              ns: this.ns,
            })}
          </div>
        </button>

        <div
          class=${classMap({
            'transition-colors mt-xs text-xs': true,
            'text-secondary group-hover-text-body': !this.disabled && !this.readonly,
            'text-secondary': this.readonly,
            'text-disabled': this.disabled,
          })}
          ?hidden=${!this.helperText}
        >
          ${this.helperText}
        </div>

        <div
          class="mt-xs text-xs leading-xs text-error"
          ?hidden=${!this._errorMessage || this.disabled || this.readonly}
        >
          ${this._errorMessage}
        </div>
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (changes.has('item')) this.__getItemRenderer.cache.clear?.();
  }

  private __handleFetchEvent(event: Event) {
    if (!(event instanceof FetchEvent)) return;
    if (event.defaultPrevented) return;

    const { url, method } = event.request;

    if (url === `foxy://${this.virtualHost}/select` && method === 'POST') {
      return event.respondWith(this.__handleSelect(event.request));
    }

    if (url === `foxy://${this.virtualHost}/empty` && method === 'GET') {
      return event.respondWith(this.__handleEmpty());
    }
  }

  private async __handleEmpty(): Promise<Response> {
    return new Response(
      JSON.stringify({
        _links: { self: { href: `foxy://${this.virtualHost}/empty` } },
        message: 'Resource selected.',
      })
    );
  }

  private async __handleSelect(request: Request): Promise<Response> {
    const body = (await request.clone().json()) as { selection: string };
    this._value = body.selection;
    return new Response(
      JSON.stringify({
        _links: { self: { href: `foxy://${this.virtualHost}/empty` } },
        message: 'Resource selected.',
      })
    );
  }
}
