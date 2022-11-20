import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data, Overrides } from './types';
import type { TabsElement } from '@vaadin/vaadin-tabs';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { repeat } from 'lit-html/directives/repeat';
import { html } from 'lit-html';

const NS = 'i18n-editor';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS);

export class I18nEditor extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      languageOverrides: { attribute: 'language-overrides' },
      selectedLanguage: { attribute: 'selected-language' },
      __selectedTabIndex: { attribute: false },
    };
  }

  languageOverrides: string | null = 'https://demo.api/hapi/language_overrides';

  selectedLanguage: string | null = 'english';

  private __selectedTabIndex = 0;

  render(): TemplateResult {
    const tabs = this.__tabs;
    const prefix = tabs[this.__selectedTabIndex] as string | undefined;
    const valuesForLang = this.data?.values[this.selectedLanguage ?? ''] ?? {};
    const filteredValues: Record<string, string> = {};
    const isSpinnerVisible = !this.in({ idle: 'snapshot' });

    if (prefix) {
      if (prefix.includes('_')) {
        const group = prefix.substring(0, prefix.indexOf('_'));
        const subGroup = prefix.substring(prefix.indexOf('_') + 1);
        const values = (valuesForLang[group] as Record<string, Record<string, string>>)[subGroup];

        for (const key in values) {
          filteredValues[`${group}_${subGroup}_${key}`] = values[key];
        }
      } else {
        for (const key in valuesForLang) {
          if (key.startsWith(prefix)) filteredValues[key] = valuesForLang[key] as string;
        }
      }
    }

    const overridesLoader = this.__renderOverridesLoader();
    const overrides = overridesLoader.overrides;

    return html`
      ${overridesLoader.template}

      <div aria-busy=${this.in('busy')} aria-live="polite" class="relative">
        <div
          class=${classMap({
            'transition-opacity grid grid-cols-1 gap-s': true,
            'opacity-0 pointer-events-none': isSpinnerVisible,
          })}
        >
          <vaadin-tabs
            selected=${this.__selectedTabIndex}
            class="-mx-l"
            theme="minimal"
            @selected-changed=${(evt: CustomEvent) => {
              const tabsElement = evt.currentTarget as TabsElement;
              this.__selectedTabIndex = tabsElement.selected ?? 0;
            }}
          >
            ${tabs.map(name => {
              const shortName = name.substring(name.indexOf('_') + 1).replace(/_/g, ' ');
              const label = html`<span class="capitalize">${shortName}</span>`;
              return html`<vaadin-tab>${label}</vaadin-tab>`;
            })}
          </vaadin-tabs>

          ${repeat(
            Object.entries(filteredValues),
            ([keyOrGroup]) => keyOrGroup,
            ([keyOrGroup, translationOrDictionary]) => {
              let code: string;
              let gateway: string | undefined;
              let override: Overrides['_embedded']['fx:language_overrides'][number] | undefined;

              if (keyOrGroup.startsWith('gateways_')) {
                code = keyOrGroup.substring(prefix!.length + 1);
                gateway = prefix!.substring(9);
                override = overrides.find(o => o.code === code && o.gateway === gateway);
              } else {
                code = keyOrGroup;
                gateway = undefined;
                override = overrides.find(o => o.code === code);
              }

              return html`
                <foxy-internal-i18n-editor-entry
                  default-value=${translationOrDictionary}
                  gateway=${ifDefined(gateway)}
                  parent=${ifDefined(this.languageOverrides ?? void 0)}
                  code=${code}
                  infer=""
                  .data=${override ?? null}
                >
                </foxy-internal-i18n-editor-entry>
              `;
            }
          )}
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'transition-opacity absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isSpinnerVisible,
          })}
        >
          <foxy-spinner
            layout=${this.in('busy') ? 'no-label' : 'horizontal'}
            class="m-auto"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            infer="spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private get __tabs() {
    const values = this.selectedLanguage ? this.data?.values[this.selectedLanguage] : undefined;

    const tabs = Object.entries(values ?? {}).reduce((allKeys, [key, value]) => {
      if (typeof value === 'string') {
        const prefix = key.substring(0, key.indexOf('_'));
        allKeys.add(prefix || key);
      } else {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (Object.keys(subValue).length === 0) return;
          allKeys.add(`${key}_${subKey}`);
        });
      }

      return allKeys;
    }, new Set<string>());

    return Array.from(tabs);
  }

  private __renderOverridesLoader() {
    type Loader = NucleonElement<Overrides>;

    const loaders = Array.from(this.renderRoot.querySelectorAll<Loader>('foxy-nucleon'));
    const overrides = loaders.reduce(
      (result, loader) => [...result, ...(loader.data?._embedded['fx:language_overrides'] ?? [])],
      [] as Resource<Rels.LanguageOverride>[]
    );

    const firstLoader = loaders[0] as Loader | undefined;

    const loaderTemplates = new Array(Math.ceil((firstLoader?.data?.total_items || 300) / 300))
      .fill(0)
      .map((_, index) => {
        try {
          const url = new URL(this.languageOverrides ?? '');

          url.searchParams.set('offset', String(index * 300));
          url.searchParams.set('limit', '300');

          return html`
            <foxy-nucleon infer="" href=${url.toString()} @update=${() => this.requestUpdate()}>
            </foxy-nucleon>
          `;
        } catch {
          return undefined;
        }
      });

    return {
      template: html`<div class="hidden">${loaderTemplates}</div>`,
      overrides,
      loaders,
    };
  }
}
