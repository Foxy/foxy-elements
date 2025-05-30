import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';
import { decode } from 'html-entities';

const NS = 'filter-attribute-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element displaying a saved filter in Admin. Saved filters
 * are powered by the Bookmark attribute format that allows adding custom sidebar items
 * to Admin. Bookmark attributes are named `foxy-admin-bookmark` and contain a
 * relative URL of the bookmarked Admin page in the value.
 *
 * @element foxy-filter-attribute-card
 * @since 1.24.0
 */
export class FilterAttributeCard extends Base<Data> {
  static readonly countRefreshInterval: number = 600000;

  static readonly filterQueryKey: string = 'filter_query';

  static readonly filterNameKey: string = 'filter_name';

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      countRefreshInterval: { attribute: 'count-refresh-interval', type: Number },
      getCountLoaderHref: { attribute: false },
    };
  }

  getCountLoaderHref: ((value: string) => string) | null = null;

  private readonly __countLoaderId = 'countLoader';

  private __refreshTimeout: NodeJS.Timeout | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (typeof this.__refreshTimeout === 'number') clearTimeout(this.__refreshTimeout);
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (typeof this.__refreshTimeout !== 'number') {
      const constructor = this.constructor as typeof FilterAttributeCard;
      const interval = constructor.countRefreshInterval;
      this.__refreshTimeout = setTimeout(() => this.__getCountLoader()?.refresh(), interval);
    }
  }

  render(): TemplateResult {
    const constructor = this.constructor as typeof FilterAttributeCard;
    const count = this.__getCountLoader()?.data?.total_items;
    let countUrl: URL | undefined;

    try {
      if (this.data && this.getCountLoaderHref) {
        countUrl = new URL(this.getCountLoaderHref(decode(this.data.value)));
        countUrl.searchParams.set('limit', '1');
      }
    } catch {
      countUrl = undefined;
    }

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(countUrl?.toString())}
        id=${this.__countLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div
        class=${classMap({
          'transition-colors flex items-center gap-s font-medium text-m leading-s rounded-s': true,
          'bg-contrast-5': !this.in('fail') && !this.data,
          'bg-error-10': this.in('fail'),
        })}
      >
        <span class=${classMap({ 'transition-opacity': true, 'opacity-0': !this.data })}>
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1em; height: 1em;"><path d="M14 2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2.172a2 2 0 0 0 .586 1.414l2.828 2.828A2 2 0 0 1 6 9.828v4.363a.5.5 0 0 0 .724.447l2.17-1.085A2 2 0 0 0 10 11.763V9.829a2 2 0 0 1 .586-1.414l2.828-2.828A2 2 0 0 0 14 4.172V2Z" /></svg>`}
        </span>

        <span
          class=${classMap({
            'transition-opacity truncate min-w-0': true,
            'opacity-0': !this.data,
          })}
        >
          ${this.__getValueParam(constructor.filterNameKey) ||
          html`<foxy-i18n infer="" key="no_name"></foxy-i18n>`}
        </span>

        <span
          class=${classMap({
            'transition-opacity bg-contrast-5 px-xs rounded text-xs': true,
            'opacity-0': !this.data || typeof count !== 'number',
          })}
        >
          ${count ?? 0}
        </span>
      </div>
    `;
  }

  private __getCountLoader() {
    type AnyCollection = NucleonElement<Resource<Rels.Attributes>>;
    type Loader = Omit<AnyCollection, '_embedded'> & { _embedded: unknown };
    return this.renderRoot.querySelector<Loader>(`#${this.__countLoaderId}`);
  }

  private __getValueParam(key: string) {
    try {
      const url = new URL(decode(this.data?.value ?? ''), 'https://example.com');
      return url.searchParams.get(key) ?? '';
    } catch {
      return '';
    }
  }
}
