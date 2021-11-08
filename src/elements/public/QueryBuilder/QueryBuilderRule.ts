import * as icons from './icons/index';

import {
  LitElement,
  PropertyDeclarations,
  SVGTemplateResult,
  TemplateResult,
  html,
} from 'lit-element';
import { Operator, Option, ParsedValue, Type } from './types';

import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { renderInput } from './templates/renderInput';
import { renderToggle } from './templates/renderToggle';
import { repeat } from 'lit-html/directives/repeat';

class QueryBuilderRule extends ThemeableMixin(TranslatableMixin(LitElement, 'query-builder-rule')) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __option: { attribute: false },
      __type: { attribute: false },
      options: { type: Array, noAccessor: true },
      value: { type: String, noAccessor: true },
    };
  }

  static parse(search: string): ParsedValue {
    const [fullPath, value] = search.split('=').map(decodeURIComponent);

    const operators = Object.values(Operator) as Operator[];
    const operator = operators.find(operator => fullPath.endsWith(`:${operator}`)) ?? null;

    let path = fullPath.substring(0, operator ? fullPath.lastIndexOf(':') : undefined);
    let name: string | null = null;

    const nameStart = fullPath.lastIndexOf('[');

    if (path.endsWith(']') && nameStart !== -1) {
      name = path.substring(nameStart + 1, path.length - 1);
      path = path.substring(0, nameStart);
    }

    return { name, path, value, operator };
  }

  static stringify(parsedValue: ParsedValue): string {
    let result = parsedValue.path;
    if (parsedValue.name) result += `[${parsedValue.name}]`;
    if (parsedValue.operator) result += `:${parsedValue.operator}`;
    result = `${encodeURIComponent(result)}=${encodeURIComponent(parsedValue.value)}`;
    return result === '=' ? '' : result;
  }

  private __options: Option[] | null = null;

  private __option: Option | null = null;

  private __value: string | null = null;

  private __type = Type.String;

  get value(): string | null {
    return this.__value;
  }

  set value(newValue: string | null) {
    const { path } = QueryBuilderRule.parse(newValue ?? '');
    const newOption = this.options?.find(o => o.path === path);
    const oldValue = this.__value;

    this.__option = newOption ?? null;
    this.__value = newValue;

    this.requestUpdate('value', oldValue);
  }

  get options(): Option[] | null {
    return this.__options;
  }

  set options(newOptions: Option[] | null) {
    const path = QueryBuilderRule.parse(this.value ?? '').path;

    this.__option = newOptions?.find(o => o.path === path) ?? this.__option;
    this.requestUpdate('options', this.__options);

    this.__options = newOptions;
  }

  render(): TemplateResult {
    const parsedValue = QueryBuilderRule.parse(this.value ?? '');
    const type = this.__option?.type ?? this.__type;
    const operator = parsedValue.operator;

    return html`
      <div class="overflow-hidden divide-y divide-contrast-10">
        <div class="flex divide-x divide-contrast-10">
          <div class="flex-shrink-0">${this.__renderTypeToggle(type)}</div>
          <div class="flex-1">${this.__renderPathInput(parsedValue.path)}</div>
        </div>

        ${parsedValue.path
          ? html`
              ${type === Type.Attribute
                ? html`
                    <div class="flex divide-x divide-contrast-10">
                      <div class="flex-shrink-0"><div class="w-m h-m"></div></div>
                      <div class="flex-1">${this.__renderNameInput(parsedValue)}</div>
                    </div>
                  `
                : ''}

              <div class="flex divide-x divide-contrast-10 items-start">
                <div class="flex-shrink-0 border-b border-contrast-10" style="margin-bottom: -1px">
                  ${this.__renderOperatorToggle(parsedValue)}
                </div>
                <div class="flex-1">
                  ${operator === Operator.In
                    ? this.__renderInOperatorValueInput(parsedValue)
                    : operator === null && [Type.Number, Type.Date].includes(type)
                    ? this.__renderRangeValueInput(parsedValue)
                    : this.__renderSingleValueInput(parsedValue)}
                </div>
              </div>
            `
          : ''}
      </div>
    `;
  }

  private __renderTypeToggle(type: Type) {
    const typeToIcon = {
      [Type.Attribute]: icons.attribute,
      [Type.Date]: icons.date,
      [Type.Number]: icons.number,
      [Type.String]: icons.string,
    };

    return renderToggle({
      disabled: !!this.__option,
      caption: typeToIcon[type],
      onClick: () => {
        const types = Object.values(Type);
        this.__type = types[types.indexOf(type) + 1] ?? types[0];
      },
    });
  }

  private __renderPathInput(path: string) {
    return renderInput({
      id: 'path',
      type: 'text',
      label: this.t('field'),
      value: path,
      datalist: this.options?.map(o => ({ value: o.path, key: this.t(o.key) })),
      displayValue: this.__option?.key ? this.t(this.__option.key) : undefined,
      onChange: newPath => {
        this.value = QueryBuilderRule.stringify({
          operator: null,
          value: '',
          path: newPath,
          name: null,
        });

        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderNameInput(parsedValue: ParsedValue) {
    return renderInput({
      type: 'text',
      label: this.t('name'),
      value: parsedValue.name ?? '',
      onChange: newName => {
        this.value = QueryBuilderRule.stringify({ ...parsedValue, name: newName });
        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderOperatorToggle(parsedValue: ParsedValue) {
    const operator = parsedValue.operator;
    const operatorToIcon: Record<string, SVGTemplateResult> = {
      [Operator.GreaterThan]: icons.greaterThanOperator,
      [Operator.GreaterThanOrEqual]: icons.greaterThanOrEqualOperator,
      [Operator.In]: icons.inOperator,
      [Operator.IsDefined]: icons.booleanOperator,
      [Operator.LessThan]: icons.lessThanOperator,
      [Operator.LessThanOrEqual]: icons.lessThanOrEqualOperator,
      [Operator.Not]: icons.notOperator,
    };

    return renderToggle({
      disabled: false,
      caption: operator ? operatorToIcon[operator] : icons.equalOperator,
      onClick: () => {
        const operatorsByType = {
          [Type.Attribute]: [Operator.In, Operator.IsDefined, Operator.Not],
          [Type.String]: [Operator.In, Operator.Not],
          [Type.Date]: [Operator.In, Operator.Not],
          [Type.Number]: [
            Operator.GreaterThan,
            Operator.GreaterThanOrEqual,
            Operator.In,
            Operator.LessThan,
            Operator.LessThanOrEqual,
            Operator.Not,
          ],
        };

        const type = this.__option?.type ?? this.__type;
        const operatorsForType = operatorsByType[type];
        const newOperatorIndex = operator ? operatorsForType.indexOf(operator) : -1;

        this.value = QueryBuilderRule.stringify({
          ...parsedValue,
          operator: operatorsForType[newOperatorIndex + 1] ?? null,
        });

        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderInOperatorValueInput(parsedValue: ParsedValue) {
    return html`
      <div class="divide-y divide-contrast-10">
        ${repeat(
          [...parsedValue.value.split(',').filter(v => !!v), null],
          (_, i) => i,
          (v, i) => html`
            <div>
              ${renderInput({
                ...this.__getCommonValueInputProps(v ?? ''),
                label: v ? String(i + 1) : this.t('add_value'),
                onChange: newValue => {
                  const splitValue = parsedValue.value.split(',');

                  if (newValue) {
                    splitValue[i] = newValue;
                  } else {
                    splitValue.splice(i, 1);
                  }

                  this.value = QueryBuilderRule.stringify({
                    ...parsedValue,
                    value: splitValue.join(','),
                  });

                  this.dispatchEvent(new CustomEvent('change'));
                },
              })}
            </div>
          `
        )}
      </div>
    `;
  }

  private __renderRangeValueInput(parsedValue: ParsedValue) {
    return html`
      <div class="divide-y divide-contrast-10">
        ${renderInput({
          ...this.__getCommonValueInputProps(parsedValue.value.split('..')[0]),
          label: this.t('range_from'),
          onChange: newValue => {
            const splitValue = parsedValue.value.split('..');
            splitValue[0] = newValue;

            this.value = QueryBuilderRule.stringify({
              ...parsedValue,
              value: splitValue.join('..'),
            });

            this.dispatchEvent(new CustomEvent('change'));
          },
        })}
        ${renderInput({
          ...this.__getCommonValueInputProps(parsedValue.value.split('..')[1]),
          label: this.t('range_to'),
          onChange: newValue => {
            const splitValue = parsedValue.value.split('..');
            splitValue[1] = newValue;

            this.value = QueryBuilderRule.stringify({
              ...parsedValue,
              value: splitValue.join('..'),
            });

            this.dispatchEvent(new CustomEvent('change'));
          },
        })}
      </div>
    `;
  }

  private __renderSingleValueInput(parsedValue: ParsedValue) {
    return renderInput({
      ...this.__getCommonValueInputProps(parsedValue.value),
      label: this.t('value'),
      onChange: newValue => {
        this.value = QueryBuilderRule.stringify({ ...parsedValue, value: newValue });
        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __getCommonValueInputProps(inputValue: string) {
    const optionType = this.__option?.type ?? this.__type;
    const type = optionType === Type.Number ? 'number' : optionType === Type.Date ? 'date' : 'text';
    const listOption = this.__option?.list?.find(v => v.value === inputValue);
    const displayValue = listOption ? this.t(listOption.key) : undefined;
    const datalist = this.__option?.list?.map(v => ({ key: this.t(v.key), value: v.value }));

    return { type, datalist, displayValue, value: inputValue };
  }
}

export { QueryBuilderRule };
