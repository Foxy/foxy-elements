import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Rule, Option } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { html, LitElement } from 'lit-element';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { Operator, Type } from './types';
import { AdvancedGroup } from './components/AdvancedGroup';
import { SimpleGroup } from './components/SimpleGroup';
import { stringify } from './utils/stringify';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { styles } from './styles';
import { parse } from './utils/parse';
import { zoom } from './utils/zoom';

const NS = 'query-builder';
const Base = ConfigurableMixin(
  ResponsiveMixin(ThemeableMixin(TranslatableMixin(InferrableMixin(LitElement), NS)))
);

/**
 * UI component for creating Foxy hAPI filters visually. Compatible with
 * Backend API, Customer API or any other API using the same format as described
 * in our [docs](https://api.foxy.io/docs/cheat-sheet).
 *
 * @element foxy-query-builder
 * @since 1.12.0
 */
export class QueryBuilder extends Base {
  /** QueryBuilder dispatches this event on itself when value changes. */
  static readonly ChangeEvent = class extends CustomEvent<void> {};

  /** Operator dictionary for use in autocomplete options. */
  static readonly Operator = Operator;

  /** Field type dictionary for use in autocomplete options. */
  static readonly Type = Type;

  /** Returns zoom value for a filter query. */
  static zoom(value: string): string {
    return zoom(parse(value));
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      reservedPaths: { type: Array, attribute: 'reserved-paths' },
      disableZoom: { type: Boolean, attribute: 'disable-zoom' },
      disableOr: { type: Boolean, attribute: 'disable-or' },
      operators: { type: Array },
      docsHref: { attribute: 'docs-href' },
      options: { type: Array },
      value: {},
      __isAdvancedMode: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [super.styles, styles];
  }

  /** Simple Mode will not show controls for these paths unless explicitly specified in options. */
  reservedPaths: string[] = ['zoom', 'limit', 'offset', 'order', 'fields'];

  /** If true, doesn't add `zoom` query parameter for complex paths. */
  disableZoom = false;

  /** If true, hides the UI for the "OR" operator in queries in the Advanced Mode. */
  disableOr = false;

  /** List of operators available in the builder UI. */
  operators: Operator[] = Object.values(Operator);

  /** When provided, will display a documentation link in the Advanced Mode. */
  docsHref: string | null = null;

  /** Filter options in Simple Mode and autocomplete suggestions in Advanced Mode. */
  options: Option[] | null = null;

  /** Current value as hAPI filter string. */
  value: string | null = null;

  private __isAdvancedMode = false;

  render(): TemplateResult {
    const isSimpleModeSupported = this.__isSimpleModeSupported;
    const parsedValue = parse(this.value ?? '');
    const operators = this.operators ?? [];
    const options = this.options ?? [];
    const t = this.t.bind(this);

    const onChange = (newParsedValue: (Rule | Rule[])[]) => {
      this.value = stringify(newParsedValue, this.disableZoom);
      this.dispatchEvent(new QueryBuilder.ChangeEvent('change'));
    };

    // This will trigger a re-render but is necessary to stay in the advanced mode once the support
    // for simple mode is available again.
    if (!isSimpleModeSupported && !this.__isAdvancedMode) this.__isAdvancedMode = true;

    return html`
      <div class="space-y-m">
        <div
          class="grid grid-cols-2 gap-xs p-xs bg-contrast-5 rounded"
          ?hidden=${!this.options?.length}
        >
          <label
            class=${classMap({
              'p-xs rounded-s text-center font-medium transition-colors': true,
              'bg-base ring-1 ring-contrast-5': !this.__isAdvancedMode && isSimpleModeSupported,
              'hover-bg-contrast-5': this.__isAdvancedMode && isSimpleModeSupported,
              'focus-within-ring-2 focus-within-ring-inset focus-within-ring-primary-50': true,
              'cursor-pointer': isSimpleModeSupported,
              'text-disabled': !isSimpleModeSupported,
            })}
          >
            <foxy-i18n infer="" key="mode_simple${isSimpleModeSupported ? '' : '_unsupported'}">
            </foxy-i18n>
            <input
              class="sr-only"
              type="radio"
              name="mode"
              ?disabled=${!isSimpleModeSupported}
              ?checked=${!this.__isAdvancedMode}
              @change=${() => (this.__isAdvancedMode = false)}
            />
          </label>

          <label
            class=${classMap({
              'p-xs rounded-s text-center font-medium cursor-pointer transition-colors': true,
              'bg-base ring-1 ring-contrast-5': this.__isAdvancedMode,
              'hover-bg-contrast-5': !this.__isAdvancedMode,
              'focus-within-ring-2 focus-within-ring-inset focus-within-ring-primary-50': true,
            })}
          >
            <foxy-i18n infer="" key="mode_advanced"></foxy-i18n>
            <input
              class="sr-only"
              type="radio"
              name="mode"
              ?checked=${this.__isAdvancedMode}
              @change=${() => (this.__isAdvancedMode = true)}
            />
          </label>
        </div>

        ${this.__isAdvancedMode || !isSimpleModeSupported
          ? html`
              <p class="leading-s text-tertiary" ?hidden=${this.docsHref === null}>
                <foxy-i18n infer="" key="advanced_mode_notice"></foxy-i18n>
                <a
                  target="_blank"
                  class="cursor-pointer rounded-s text-secondary font-medium hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
                  href=${ifDefined(this.docsHref ?? void 0)}
                  rel="nofollow noreferrer noopener"
                >
                  <foxy-i18n infer="" key="api_reference_link"></foxy-i18n>
                </a>
              </p>

              ${AdvancedGroup({
                disableOr: this.disableOr,
                disabled: this.disabled,
                readonly: this.readonly,
                rules: parsedValue,
                operators,
                onChange,
                options,
                t,
              })}
            `
          : this.__simpleModeOptions?.map(group => {
              return SimpleGroup({
                ...group,
                disabled: this.disabled,
                readonly: this.readonly,
                rules: parsedValue as Rule[],
                onChange,
                t,
              });
            })}
      </div>
    `;
  }

  private get __isSimpleModeSupported() {
    if (this.options === null) return false;
    if (this.options.length === 0) return false;

    const parsedValue = parse(this.value ?? '');
    if (parsedValue.length === 0) return true;

    return parsedValue.every(entry => {
      if (Array.isArray(entry)) return false;
      if (entry.operator === Operator.In) return false;
      if (entry.operator === Operator.IsDefined && entry.value !== 'true') return false;
      return !!(
        this.reservedPaths.includes(entry.path) ||
        this.options?.find(option => option.path === entry.path)
      );
    });
  }

  private get __simpleModeOptions() {
    return this.options?.reduce((result, option) => {
      const group = result.find(group => group.name === option.group?.name);

      if (group) {
        group.options.push(option);
      } else {
        result.push({ ...option.group, options: [option] });
      }

      return result;
    }, [] as { name?: string; layout?: string; options: Option[] }[]);
  }
}
