import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import type { Option } from '../QueryBuilder/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { encode, decode } from 'html-entities';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'filter-attribute-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating and editing saved filters in Admin. Saved filters
 * are powered by the Bookmark attribute format that allows adding custom sidebar items
 * to Admin. Bookmark attributes are named `foxy-admin-bookmark` and contain a
 * relative URL of the bookmarked Admin page in the value.
 *
 * @element foxy-filter-attribute-form
 * @since 1.24.0
 */
export class FilterAttributeForm extends Base<Data> {
  static readonly attributeVisibility: Data['visibility'] = 'restricted';

  static readonly filterQueryKey: string = 'filter_query';

  static readonly attributeName: string = 'foxy-admin-bookmark';

  static readonly filterNameKey: string = 'filter_name';

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaults: {},
      pathname: {},
      docsHref: { attribute: 'docs-href' },
      options: { type: Array },
    };
  }

  /** Default filter query. */
  defaults: string | null = null;

  /** Admin page pathname. */
  pathname: string | null = null;

  /** Same as the `docsHref` property of `QueryBuilder`. */
  docsHref: string | null = null;

  /** Filter options passed down to `QueryBuilder.options.` */
  options: Option[] = [];

  private readonly __filterNameGetValue = () => {
    const constructor = this.constructor as typeof FilterAttributeForm;
    return this.__getValueParam(constructor.filterNameKey);
  };

  private readonly __filterNameSetValue = (v: string) => {
    const constructor = this.constructor as typeof FilterAttributeForm;
    this.__setValueParam(constructor.filterNameKey, v);
  };

  renderBody(): TemplateResult {
    const constructor = this.constructor as typeof FilterAttributeForm;
    const filterQuery = this.__getValueParam(constructor.filterQueryKey);
    const hasValue = !!this.form.value;
    const hasData = !!this.data;
    const hasChanges =
      this.in({ idle: { snapshot: 'dirty' } }) || this.in({ idle: { template: 'dirty' } });

    return html`
      <div class="flex gap-s">
        ${this.data
          ? html`
              <div
                class="flex-1 rounded bg-contrast-5 transition-colors hover-bg-contrast-10 focus-within-bg-contrast-10 focus-within-ring-2 focus-within-ring-primary-50"
              >
                <input
                  placeholder=${this.t('filter-name.placeholder')}
                  aria-label=${this.t('filter-name.label')}
                  style="padding: 0 calc(0.625 * var(--lumo-font-size-m) + (var(--lumo-border-radius) / 4) - 1px)"
                  class="block w-full h-full appearance-none bg-transparent text-xl font-medium focus-outline-none"
                  .value=${this.__filterNameGetValue()}
                  @keydown=${(evt: KeyboardEvent) => {
                    if (evt.key === 'Enter') {
                      evt.preventDefault();
                      this.submit();
                    }
                  }}
                  @input=${(evt: Event) => {
                    this.__filterNameSetValue((evt.target as HTMLInputElement).value);
                  }}
                />
              </div>
            `
          : html`
              <foxy-i18n class="text-xl flex-1 font-medium" infer="header" key="title"></foxy-i18n>
            `}
        ${!hasValue || (!filterQuery && !hasData)
          ? ''
          : html`
              <vaadin-button
                theme=${hasData ? (hasChanges ? 'secondary' : 'error') : 'success'}
                style=${ifDefined(hasData ? void 0 : '--lumo-button-size: auto')}
                ?disabled=${this.disabled}
                @click=${() => (!hasData || hasChanges ? this.submit() : this.delete())}
              >
                <foxy-i18n
                  infer="action"
                  class="px-s"
                  key=${hasData ? (hasChanges ? 'update' : 'delete') : 'create'}
                >
                </foxy-i18n>
              </vaadin-button>
            `}
      </div>

      <foxy-query-builder
        docs-href=${ifDefined(this.docsHref ?? void 0)}
        options=${JSON.stringify(this.options)}
        infer="filter-query"
        value=${filterQuery}
        disable-zoom
        @change=${this.__handleFilterQueryChange}
      >
      </foxy-query-builder>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (typeof this.form.value === 'string') {
      const url = new URL(decode(this.form.value), 'https://example.com');
      url.pathname = this.pathname ?? '';
      const value = encode(url.toString().substring(url.origin.length));
      if (value !== this.form.value) this.edit({ value });
    }
  }

  submit(): void {
    const constructor = this.constructor as typeof FilterAttributeForm;

    this.edit({
      visibility: constructor.attributeVisibility,
      name: constructor.attributeName,
    });

    super.submit();
  }

  private __getValueParam(key: string) {
    try {
      const constructor = this.constructor as typeof FilterAttributeForm;
      const url = new URL(decode(this.form.value ?? ''), 'https://example.com');

      let result = url.searchParams.get(key) ?? '';

      if (
        key === constructor.filterQueryKey &&
        (this.in({ idle: { snapshot: 'clean' } }) || this.in({ idle: { template: 'clean' } }))
      ) {
        try {
          const fullQuery = new URLSearchParams(result);
          const defaults = new URLSearchParams(this.defaults ?? '');
          fullQuery.forEach((v, k) => defaults.set(k, v));
          result = defaults.toString();
        } catch {
          // no-op
        }
      }

      return result;
    } catch {
      return '';
    }
  }

  private __setValueParam(key: string, value: string) {
    try {
      const url = new URL(decode(this.form.value ?? ''), 'https://example.com');
      url.searchParams.set(key, value);
      this.edit({ value: encode(url.toString().substring(url.origin.length)) });
    } catch {
      // ignore
    }
  }

  private __handleFilterQueryChange(evt: CustomEvent) {
    const constructor = this.constructor as typeof FilterAttributeForm;
    const element = evt.currentTarget as QueryBuilder;
    this.__setValueParam(constructor.filterQueryKey, element.value ?? '');
    this.requestUpdate();
  }
}
