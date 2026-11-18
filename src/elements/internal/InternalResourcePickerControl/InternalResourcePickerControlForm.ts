import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { HALJSONResource } from '../../public/NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../InternalForm/InternalForm';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit-html';

type Data = HALJSONResource & { selection: string; query: string };

const Base = TranslatableMixin(InternalForm);

export class InternalResourcePickerControlForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      selectionProps: { attribute: false },
      searchFields: { attribute: false },
      __search: { attribute: false },
    };
  }

  selectionProps: Record<PropertyKey, unknown> = {};

  /** The fields a search box above the list looks in, any of which may match. No box without them. */
  searchFields: string[] = [];

  private __search = '';

  private __searchTimeout?: ReturnType<typeof setTimeout>;

  renderBody(): TemplateResult {
    const extendFilter = this.selectionProps['.extendFilter'] as
      | ((params: URLSearchParams) => void)
      | null
      | undefined;
    const [field, ...otherFields] = this.searchFields;
    // The API reads * as any text and | as "or", so neither can be searched for.
    const pattern = `*${this.__search.replace(/[*|]/g, '').trim()}*`;
    const selectionProps =
      field && pattern !== '**'
        ? {
            ...this.selectionProps,
            '.extendFilter': (params: URLSearchParams) => {
              extendFilter?.(params);
              params.set(field, [pattern, ...otherFields.map(f => `${f}=${pattern}`)].join('|'));
            },
          }
        : this.selectionProps;

    return html`
      ${field
        ? html`
            <input
              type="search"
              class="w-full bg-contrast-10 rounded text-body text-m font-lumo focus-outline-none focus-ring-2 focus-ring-primary-50"
              style="height: var(--lumo-size-m); padding: 0 var(--lumo-space-m)"
              data-testid="search"
              aria-label=${this.t('search')}
              placeholder=${this.t('search')}
              @input=${(evt: Event) => {
                const value = (evt.currentTarget as HTMLInputElement).value;
                clearTimeout(this.__searchTimeout);
                this.__searchTimeout = setTimeout(() => (this.__search = value), 250);
              }}
              @keydown=${(evt: KeyboardEvent) => {
                if (evt.key !== 'Enter') return;
                clearTimeout(this.__searchTimeout);
                this.__search = (evt.currentTarget as HTMLInputElement).value;
              }}
            />
          `
        : ''}

      <foxy-internal-async-list-control
        infer="selection"
        form="foxy-null"
        hide-delete-button
        hide-create-button
        @itemclick=${(evt: CustomEvent<string>) => {
          evt.preventDefault();
          this.edit({ selection: evt.detail });
          this.submit();
        }}
        ...=${spread(selectionProps)}
      >
      </foxy-internal-async-list-control>
    `;
  }
}
