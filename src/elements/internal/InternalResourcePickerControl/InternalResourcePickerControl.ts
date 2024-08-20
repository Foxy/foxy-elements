import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import type { FormRenderer } from '../../public/FormDialog/types';
import type { ItemRenderer } from '../../public/CollectionPage/types';
import type { FormDialog } from '../../public/FormDialog/FormDialog';
import type { Option } from '../../public/QueryBuilder/types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { FetchEvent } from '../../public/NucleonElement/FetchEvent';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';
import { uniqueId } from 'lodash-es';
import { spread } from '@open-wc/lit-helpers';

import memoize from 'lodash-es/memoize';

type DisplayValueOptionsCb = (resource: HALJSONResource) => Record<string, unknown>;

export class InternalResourcePickerControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getDisplayValueOptions: { attribute: false },
      virtualHost: {},
      formProps: { type: Object },
      filters: { type: Array },
      layout: {},
      first: {},
      item: {},
      form: {},
    };
  }

  getDisplayValueOptions: DisplayValueOptionsCb = resource => ({ resource });

  virtualHost = uniqueId('internal-resource-picker-control-');

  formProps: Record<string, unknown> = {};

  filters: Option[] = [];

  layout: 'summary-item' | 'standalone' | null = null;

  first: string | null = null;

  item: string | null = null;

  form: string | null | FormRenderer = null;

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
    const dialogProps = {
      ...this.formProps,
      '.selectionProps': { '.filters': this.filters, '.first': this.first, '.item': this.item },
    };

    return html`
      <foxy-form-dialog
        parent="foxy://${this.virtualHost}/select"
        header="header"
        infer="dialog"
        alert
        .props=${dialogProps}
        .form=${this.form ?? 'foxy-internal-resource-picker-control-form'}
        @fetch=${this.__handleFetchEvent}
      >
      </foxy-form-dialog>

      ${this.layout === 'summary-item'
        ? this.__renderSummaryItemLayout()
        : this.__renderStandaloneLayout()}
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (changes.has('item')) this.__getItemRenderer.cache.clear?.();
  }

  private __renderSummaryItemLayout() {
    const resource = this.renderRoot.querySelector<NucleonElement<any>>('#value');
    const onClick = (evt: Event) => {
      if (this.disabled || this.readonly) return;
      const button = evt.currentTarget as HTMLButtonElement;
      const dialog = this.renderRoot.querySelector('foxy-form-dialog') as FormDialog;

      dialog.href = '';
      dialog.show(button);
    };

    return html`
      <div class="flex items-start leading-xs gap-m">
        <div class="flex-1">
          <div class="text-m text-body whitespace-nowrap">${this.label}</div>
          <div class="text-s text-secondary">${this.helperText}</div>
          <div class="text-s text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </div>
        </div>

        <div class="flex items-center gap-xs">
          <button
            aria-label=${this.t('select')}
            class=${classMap({
              'text-right min-w-0 transition-colors transition-opacity': true,
              'rounded-s focus-outline-none focus-ring-2 focus-ring-primary-50': true,
              'text-secondary': this.readonly,
              'text-disabled': this.disabled,
              'cursor-pointer text-body hover-opacity-80': !this.disabled && !this.readonly,
              'font-medium': !this.readonly,
            })}
            ?disabled=${this.disabled || this.readonly}
            @click=${onClick}
          >
            <div class="truncate min-w-0">
              ${this._value
                ? html`
                    <foxy-i18n
                      infer=""
                      key="value"
                      .options=${resource?.data
                        ? this.getDisplayValueOptions(resource.data)
                        : { context: resource?.in('fail') ? 'fail' : 'busy' }}
                    >
                    </foxy-i18n>
                  `
                : this.placeholder}
            </div>
          </button>

          <button
            aria-label=${this.t('clear')}
            class=${classMap({
              'rounded-full transition-colors': true,
              'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
              'cursor-pointer text-tertiary hover-text-body': !this.disabled,
              'cursor-default text-disabled': this.disabled,
            })}
            style="width: 1em; height: 1em;"
            ?disabled=${this.disabled}
            ?hidden=${this.readonly || !this._value}
            @click=${() => {
              this._value = '';
              this.dispatchEvent(new CustomEvent('clear'));
            }}
          >
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style="width: 1em; height: 1em; transform: scale(1.25); margin-right: -0.16em"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>`}
          </button>
        </div>
      </div>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this._value || void 0)}
        id="value"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private __renderStandaloneLayout() {
    return html`
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

  private async __handleEmpty(): Promise<Response> {
    return new Response(
      JSON.stringify({
        _links: { self: { href: `foxy://${this.virtualHost}/empty` } },
        message: 'Resource selected.',
      })
    );
  }
}
