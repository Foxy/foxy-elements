import { CSSResultArray, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ParsedValue, Operator, Option, Type } from './types';

import { Group } from './components/Group';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { parse } from './utils/parse';
import { stringify } from './utils/stringify';
import { styles } from './styles';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ConfigurableMixin } from '../../../mixins/configurable';

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
class QueryBuilder extends Base {
  /** QueryBuilder dispatches this event on itself when value changes. */
  static readonly ChangeEvent = class extends CustomEvent<void> {};

  /** Operator dictionary for use in autocomplete options. */
  static readonly Operator = Operator;

  /** Field type dictionary for use in autocomplete options. */
  static readonly Type = Type;

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disableZoom: { type: Boolean, attribute: 'disable-zoom' },
      disableOr: { type: Boolean, attribute: 'disable-or' },
      operators: { type: Array },
      options: { type: Array },
      value: { type: String },
    };
  }

  static get styles(): CSSResultArray {
    return [super.styles, styles];
  }

  /** If true, doesn't add `zoom` query parameter for complex paths. */
  disableZoom = false;

  /** If true, hides the UI for the "OR" operator in queries. */
  disableOr = false;

  /** List of operators available in the builder UI. */
  operators: Operator[] = Object.values(Operator);

  /** Autocomplete suggestions. */
  options: Option[] | null = null;

  /** Current value as hAPI filter string. */
  value: string | null = null;

  render(): TemplateResult {
    const reservedPaths = new Set(['zoom', 'limit', 'offset', 'order', 'fields']);
    const hiddenValues: (ParsedValue | ParsedValue[])[] = [];
    const visibleValues: (ParsedValue | ParsedValue[])[] = [];

    parse(this.value ?? '').forEach(value => {
      const isVisible = Array.isArray(value) || !reservedPaths.has(value.path);
      isVisible ? visibleValues.push(value) : hiddenValues.push(value);
    });

    return Group({
      parsedValues: visibleValues,
      disableOr: this.disableOr,
      operators: this.operators ?? [],
      disabled: this.disabled,
      readonly: this.readonly,
      options: this.options ?? [],
      t: this.t.bind(this),
      onChange: newValue => {
        this.value = stringify([...newValue, ...hiddenValues], this.disableZoom);
        this.dispatchEvent(new QueryBuilder.ChangeEvent('change'));
      },
    });
  }
}

export { QueryBuilder };
