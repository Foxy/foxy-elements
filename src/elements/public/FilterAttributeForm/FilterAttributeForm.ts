import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { QueryBuilder } from '../QueryBuilder/QueryBuilder';
import type { Option } from '../QueryBuilder/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { encode, decode } from 'html-entities';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
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
      pathname: {},
      options: { type: Array },
    };
  }

  /** Admin page pathname. */
  pathname: string | null = null;

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

  get hiddenSelector(): BooleanSelector {
    const alwaysHidden: string[] = [];
    const constructor = this.constructor as typeof FilterAttributeForm;
    const filterQuery = this.__getValueParam(constructor.filterQueryKey);
    const hasData = !!this.data;
    const hasValue = !!this.form.value;

    if (!hasData) alwaysHidden.push('filter-name');
    if (!hasValue || (!filterQuery && !hasData)) alwaysHidden.push('action');

    return new BooleanSelector(`${alwaysHidden.join(' ')} ${super.hiddenSelector}`.trim());
  }

  renderBody(): TemplateResult {
    const constructor = this.constructor as typeof FilterAttributeForm;

    return html`
      <foxy-query-builder
        infer="filter-query"
        .options=${this.options}
        .value=${this.__getValueParam(constructor.filterQueryKey)}
        @change=${this.__handleFilterQueryChange}
      >
      </foxy-query-builder>

      <foxy-internal-text-control
        infer="filter-name"
        .getValue=${this.__filterNameGetValue}
        .setValue=${this.__filterNameSetValue}
      >
      </foxy-internal-text-control>

      <foxy-internal-filter-attribute-form-action-control infer="action">
      </foxy-internal-filter-attribute-form-action-control>
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
      const url = new URL(decode(this.form.value ?? ''), 'https://example.com');
      return url.searchParams.get(key) ?? '';
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
  }
}
