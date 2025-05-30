import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { getResourceId } from '@foxy.io/sdk/core';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html, svg } from 'lit-html';
import { classMap } from '../../../utils/class-map';

const NS = 'store-transaction-folder-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element representing a `fx:store_transaction_folder` resource.
 *
 * @element foxy-store-transaction-folder-card
 * @since 1.46.0
 */
export class StoreTransactionFolderCard extends Base<Data> {
  static readonly countRefreshInterval: number = 600000;

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getCountLoaderURL: { attribute: false },
    };
  }

  getCountLoaderURL: ((defaultValue: URL) => URL) | null = null;

  private readonly __countLoaderId = 'countLoader';

  private readonly __storeLoaderId = 'storeLoader';

  private __refreshTimeout: NodeJS.Timeout | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (typeof this.__refreshTimeout === 'number') clearTimeout(this.__refreshTimeout);
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (typeof this.__refreshTimeout !== 'number') {
      const constructor = this.constructor as typeof StoreTransactionFolderCard;
      const interval = constructor.countRefreshInterval;
      this.__refreshTimeout = setTimeout(() => this.__getCountLoader()?.refresh(), interval);
    }
  }

  render(): TemplateResult {
    const count = this.__getCountLoader()?.data?.total_items;
    const store = this.__getStoreLoader()?.data;
    let countUrl: URL | undefined;

    try {
      if (this.data && store) {
        countUrl = new URL(store._links['fx:transactions'].href);
        countUrl.searchParams.set('folder_id', String(getResourceId(this.data._links.self.href)));
        countUrl.searchParams.set('limit', '1');
        countUrl = this.getCountLoaderURL?.(countUrl) ?? countUrl;
      }
    } catch {
      countUrl = undefined;
    }

    const colors: Record<string, string> = {
      'red': 'text-folder-red',
      'red_pale': 'text-folder-red-pale',
      'green': 'text-folder-green',
      'green_pale': 'text-folder-green-pale',
      'blue': 'text-folder-blue',
      'blue_pale': 'text-folder-blue-pale',
      'orange': 'text-folder-orange',
      'orange_pale': 'text-folder-orange-pale',
      'violet': 'text-folder-violet',
      'violet_pale': 'text-folder-violet-pale',
      '': 'text-body',
    };

    const currentColor = this.form.color && this.form.color in colors ? this.form.color : '';

    return html`
      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

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
        <span
          class=${classMap({
            'transition-opacity': true,
            'opacity-0': !this.data,
            [colors[currentColor]]: true,
          })}
        >
          ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="width: 1em; height: 1em;"><path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l1.122 1.12A1.5 1.5 0 0 0 9.62 4H12.5A1.5 1.5 0 0 1 14 5.5v1.401a2.986 2.986 0 0 0-1.5-.401h-9c-.546 0-1.059.146-1.5.401V3.5ZM2 9.5v3A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-3A1.5 1.5 0 0 0 12.5 8h-9A1.5 1.5 0 0 0 2 9.5Z" /></svg>`}
        </span>

        <span
          class=${classMap({
            'transition-opacity truncate min-w-0': true,
            'opacity-0': !this.data,
          })}
        >
          ${this.data?.name || html`<foxy-i18n infer="" key="no_name"></foxy-i18n>`}
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

  private __getStoreLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }
}
