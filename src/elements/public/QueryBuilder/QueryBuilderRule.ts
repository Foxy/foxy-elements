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
import { renderSelect } from './templates/renderSelect';
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
              ${type === Type.Attribute || parsedValue.name
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
                    : operator === Operator.IsDefined
                    ? this.__renderIsDefinedValueInput(parsedValue)
                    : type === Type.Boolean
                    ? this.__renderBooleanValueInput(parsedValue)
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
      [Type.Attribute]: icons.typeAttribute,
      [Type.Boolean]: icons.typeBoolean,
      [Type.Date]: icons.typeDate,
      [Type.Number]: icons.typeNumber,
      [Type.String]: icons.typeString,
      [Type.Any]: icons.typeAny,
    };

    return html`
      <div class="w-m h-m text-tertiary">${this.__option ? typeToIcon[type] : icons.typeAny}</div>
    `;
  }

  private __renderPathInput(path: string) {
    return renderInput({
      id: 'path',
      type: 'text',
      label: this.t('field'),
      value: path,
      list: this.options?.map(o => ({ value: o.path, key: this.t(o.key) })),
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
      [Operator.GreaterThan]: icons.operatorGreaterThan,
      [Operator.GreaterThanOrEqual]: icons.operatorGreaterThanOrEqual,
      [Operator.In]: icons.operatorIn,
      [Operator.IsDefined]: icons.operatorIsDefined,
      [Operator.LessThan]: icons.operatorLessThan,
      [Operator.LessThanOrEqual]: icons.operatorLessThanOrEqual,
      [Operator.Not]: icons.operatorNot,
    };

    const operatorsByType = {
      [Type.Attribute]: [Operator.In, Operator.IsDefined, Operator.Not],
      [Type.Boolean]: [],
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
      [Type.Any]: [
        Operator.IsDefined,
        Operator.GreaterThan,
        Operator.GreaterThanOrEqual,
        Operator.In,
        Operator.LessThan,
        Operator.LessThanOrEqual,
        Operator.Not,
      ],
    };

    const operatorsForType = this.__option
      ? operatorsByType[this.__option.type]
      : parsedValue.name
      ? Object.values(Operator)
      : Object.values(Operator).filter(v => v !== Operator.IsDefined);

    return renderToggle({
      disabled: operatorsForType.length === 0,
      caption: operator ? operatorToIcon[operator] : icons.operatorEqual,
      onClick: () => {
        const newOperatorIndex = operator ? operatorsForType.indexOf(operator) : -1;
        const newOperator = operatorsForType[newOperatorIndex + 1] ?? null;

        this.value = QueryBuilderRule.stringify({
          ...parsedValue,
          operator: newOperator,
          value: newOperator === Operator.IsDefined ? 'true' : parsedValue.value,
        });

        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderInOperatorValueInput(parsedValue: ParsedValue) {
    const renderer = this.__option?.list ? renderSelect : renderInput;

    return html`
      <div class="divide-y divide-contrast-10">
        ${repeat(
          [...parsedValue.value.split(',').filter(v => !!v), null],
          (_, i) => i,
          (v, i) => html`
            <div>
              ${renderer({
                ...this.__getCommonValueInputProps(v ?? ''),
                label: v ? String(i + 1) : this.t('add_value'),
                clearable: true,
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
    const renderer = this.__option?.list ? renderSelect : renderInput;

    return html`
      <div class="divide-y divide-contrast-10">
        ${renderer({
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
        ${renderer({
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
    const renderer = this.__option?.list ? renderSelect : renderInput;

    return renderer({
      ...this.__getCommonValueInputProps(parsedValue.value),
      label: this.t('value'),
      onChange: newValue => {
        this.value = QueryBuilderRule.stringify({ ...parsedValue, value: newValue });
        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderBooleanValueInput(parsedValue: ParsedValue) {
    const trueKey = this.__option?.list?.find(v => v.value === 'true')?.key ?? 'true';
    const falseKey = this.__option?.list?.find(v => v.value === 'false')?.key ?? 'false';

    return renderSelect({
      label: this.t('value'),
      value: parsedValue.value,
      list: [
        { key: this.t(trueKey), value: 'true' },
        { key: this.t(falseKey), value: 'false' },
      ],
      onChange: newValue => {
        this.value = QueryBuilderRule.stringify({ ...parsedValue, value: newValue });
        this.dispatchEvent(new CustomEvent('change'));
      },
    });
  }

  private __renderIsDefinedValueInput(parsedValue: ParsedValue) {
    return renderSelect({
      label: this.t('value'),
      value: parsedValue.value,
      list: [
        { key: this.t('is_defined_true'), value: 'true' },
        { key: this.t('is_defined_false'), value: 'false' },
      ],
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
    const list = this.__option?.list?.map(v => ({ key: this.t(v.key), value: v.value }));

    return { type, list, displayValue, value: inputValue };
  }
}

export { QueryBuilderRule };
