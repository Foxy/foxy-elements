import * as icons from './icons/index';

import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  SVGTemplateResult,
  TemplateResult,
  css,
  html,
} from 'lit-element';
import { Operator, Option, ParsedValue, Type } from './types';

import { ResponsiveMixin } from '../../../mixins/responsive';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { renderInput } from './templates/renderInput';
import { renderSelect } from './templates/renderSelect';
import { renderToggle } from './templates/renderToggle';
import { repeat } from 'lit-html/directives/repeat';

class QueryBuilder extends ResponsiveMixin(
  ThemeableMixin(TranslatableMixin(LitElement, 'query-builder'))
) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      value: { type: String },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .gap-1px {
          gap: 1px;
        }

        .grid-vertical {
          grid-template: auto / var(--lumo-size-m) 1fr;
        }

        :host([sm]) .sm-grid-horizontal {
          grid-template: auto / var(--lumo-size-m) 1fr var(--lumo-size-m) 1fr;
        }
      `,
    ];
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

  options: Option[] | null = null;

  value: string | null = '';

  render(): TemplateResult {
    const splitValue = this.value
      ?.split('&')
      .filter(v => !!v)
      .map(entry => {
        const [name, value] = entry.split('=').map(decodeURIComponent);
        if (!value?.includes('|')) return entry;
        return `${encodeURIComponent(name)}=${value}`.split('|');
      });

    return this.__renderGroup(splitValue ?? [], false, newValue => {
      this.value = newValue
        .map(v => {
          if (typeof v === 'string') return v;
          if (v.length < 2) return v.join();
          return `${v[0]}${encodeURIComponent(`|${v.slice(1).join('|')}`)}`;
        })
        .join('&');

      this.dispatchEvent(new CustomEvent('change'));
    });
  }

  private __renderGroup(
    value: (string | string[])[],
    isNested: boolean,
    onChange: (newValue: (string | string[])[]) => void
  ): TemplateResult {
    const orDivider = html`
      <div class="flex">
        <div class="flex items-center flex-1 h-s">
          <foxy-i18n
            class="block w-m text-center leading-none uppercase font-semibold text-xs text-contrast-30"
            lang=${this.lang}
            key="or"
            ns=${this.ns}
          >
          </foxy-i18n>

          <div class="flex-1 border-t border-contrast-20"></div>
        </div>

        <div class="w-m ml-s flex-shrink-0"></div>
        <div class="hidden sm-block w-m flex-shrink-0"></div>
      </div>
    `;

    const spacer = html`<div class="h-xs"></div>`;

    return html`
      ${repeat(
        [...value, null],
        (_, i) => String(i),
        (rule, ruleIndex) => {
          const divider = ruleIndex > 0 ? (isNested ? orDivider : spacer) : '';
          let ruleTemplate: TemplateResult;

          if (typeof rule === 'string') {
            const handleRuleDelete = () => {
              onChange(value.filter((_, i) => i !== ruleIndex));
            };

            const handleRuleChange = (newValue: string) => {
              onChange(value.map((v, i) => (i === ruleIndex ? newValue : v)));
            };

            const handleRuleConvert = () => {
              onChange(
                value.map((v, i) => {
                  if (i !== ruleIndex) return v;
                  return [v as string, `${(v as string).split('=')[0]}=`];
                })
              );
            };

            ruleTemplate = this.__renderRule({
              value: rule,
              isNested,
              onChange: handleRuleChange,
              onDelete: handleRuleDelete,
              onConvert: handleRuleConvert,
            });
          } else if (Array.isArray(rule)) {
            ruleTemplate = html`
              <div class="bg-contrast-10 rounded-t-l rounded-b-l p-s -m-s">
                ${this.__renderGroup(rule, true, newValue => {
                  onChange(value.map((v, i) => (i === ruleIndex ? (newValue as string[]) : v)));
                })}
              </div>
            `;
          } else {
            ruleTemplate = this.__renderRule({
              value: '',
              isNested,
              onChange: newValue => {
                onChange([...value, newValue]);
              },
            });
          }

          return html`${divider}${ruleTemplate}`;
        }
      )}
    `;
  }

  private __renderRule({
    value,
    isNested = false,
    onChange,
    onDelete,
    onConvert,
  }: {
    value: string;
    isNested?: boolean;
    onChange: (newValue: string) => void;
    onDelete?: () => void;
    onConvert?: () => void;
  }) {
    const parsedValue = QueryBuilder.parse(value ?? '');
    const option = this.options?.find(o => o.path === parsedValue.path) ?? null;
    const type = option?.type ?? Type.Any;
    const operator = parsedValue.operator;

    return html`
      <div class="flex items-center space-x-s">
        <div
          class=${classMap({
            'flex-1 bg-base rounded overflow-hidden border': true,
            'border-contrast-10': !isNested,
            'border-contrast-50': isNested,
          })}
        >
          <div class="bg-contrast-10">
            <div class="grid gap-1px grid-vertical sm-grid-horizontal">
              <div class="bg-base">${this.__renderTypeToggle(type, option)}</div>
              <div class="bg-base">
                ${parsedValue.path && (type === Type.Attribute || parsedValue.name)
                  ? html`
                      <div class="bg-contrast-10 grid gap-1px grid-cols-1 sm-grid-cols-2">
                        <div class="bg-base">
                          ${this.__renderPathInput(parsedValue.path, option, onChange)}
                        </div>
                        <div class="bg-base">${this.__renderNameInput(parsedValue, onChange)}</div>
                      </div>
                    `
                  : this.__renderPathInput(parsedValue.path, option, onChange)}
              </div>

              <div class="bg-base">
                ${this.__renderOperatorToggle(parsedValue, option, onChange)}
              </div>

              <div class="bg-base">
                ${operator === Operator.In
                  ? this.__renderInOperatorValueInput(parsedValue, option, onChange)
                  : operator === Operator.IsDefined
                  ? this.__renderIsDefinedValueInput(parsedValue, onChange)
                  : type === Type.Boolean
                  ? this.__renderBooleanValueInput(parsedValue, option, onChange)
                  : operator === null && [Type.Number, Type.Date].includes(type)
                  ? this.__renderRangeValueInput(parsedValue, option, onChange)
                  : this.__renderSingleValueInput(parsedValue, option, onChange)}
              </div>
            </div>
          </div>
        </div>

        <div
          class=${classMap({
            '-mr-s self-start flex-col sm-flex-row flex-shrink-0 items-center': true,
            'border-t border-b border-transparent divide-y divide-transparent': true,
            'hidden': !this.value,
            'flex': !!this.value,
          })}
        >
          <button
            aria-label=${this.t('delete')}
            class=${classMap({
              'box-content flex w-m h-m rounded-full transition-colors': true,
              'text-secondary hover-bg-contrast-5 hover-text-error': true,
              'focus-outline-none focus-ring-2 ring-primary-50': true,
              'opacity-0': !value,
            })}
            ?disabled=${!value}
            @click=${onDelete}
          >
            <iron-icon icon="icons:remove-circle-outline" class="m-auto icon-inline text-xl">
            </iron-icon>
          </button>

          <button
            aria-label=${this.t('add_or_clause')}
            class=${classMap({
              'box-content flex w-m h-m rounded-full transition-colors': true,
              'text-success': true,
              'hover-bg-contrast-5 focus-outline-none focus-ring-2 ring-primary-50': true,
              'opacity-0': !value || isNested,
            })}
            ?disabled=${!value}
            @click=${onConvert}
          >
            <iron-icon icon="icons:add-circle-outline" class="m-auto icon-inline text-xl">
            </iron-icon>
          </button>
        </div>
      </div>
    `;
  }

  private __renderTypeToggle(type: Type, option: Option | null) {
    const typeToIcon = {
      [Type.Attribute]: icons.typeAttribute,
      [Type.Boolean]: icons.typeBoolean,
      [Type.Date]: icons.typeDate,
      [Type.Number]: icons.typeNumber,
      [Type.String]: icons.typeString,
      [Type.Any]: icons.typeAny,
    };

    return html`
      <div class="w-m h-m text-tertiary">${option ? typeToIcon[type] : icons.typeAny}</div>
    `;
  }

  private __renderPathInput(
    path: string,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
    return renderInput({
      id: 'path',
      type: 'text',
      label: this.t('field'),
      value: path,
      list: this.options?.map(o => ({ value: o.path, key: this.t(o.key) })),
      displayValue: option?.key ? this.t(option.key) : undefined,
      onChange: newPath => {
        onChange(
          QueryBuilder.stringify({
            operator: null,
            value: '',
            path: newPath,
            name: null,
          })
        );
      },
    });
  }

  private __renderNameInput(parsedValue: ParsedValue, onChange: (newValue: string) => void) {
    return renderInput({
      type: 'text',
      label: this.t('name'),
      value: parsedValue.name ?? '',
      onChange: newName => {
        onChange(QueryBuilder.stringify({ ...parsedValue, name: newName }));
      },
    });
  }

  private __renderOperatorToggle(
    parsedValue: ParsedValue,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
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

    const operatorsForType = option
      ? operatorsByType[option.type]
      : parsedValue.name
      ? Object.values(Operator)
      : Object.values(Operator).filter(v => v !== Operator.IsDefined);

    return renderToggle({
      disabled: operatorsForType.length === 0 || !parsedValue.path,
      caption: operator ? operatorToIcon[operator] : icons.operatorEqual,
      onClick: () => {
        const newOperatorIndex = operator ? operatorsForType.indexOf(operator) : -1;
        const newOperator = operatorsForType[newOperatorIndex + 1] ?? null;

        onChange(
          QueryBuilder.stringify({
            ...parsedValue,
            operator: newOperator,
            value: newOperator === Operator.IsDefined ? 'true' : parsedValue.value,
          })
        );
      },
    });
  }

  private __renderInOperatorValueInput(
    parsedValue: ParsedValue,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
    const renderer = option?.list ? renderSelect : renderInput;

    return html`
      <div class="bg-contrast-10 grid grid-cols-1 gap-1px">
        ${repeat(
          [...parsedValue.value.split(',').filter(v => !!v), null],
          (_, i) => i,
          (v, i) => html`
            <div class="bg-base">
              ${renderer({
                ...this.__getCommonValueInputProps(v ?? '', option),
                label: v ? String(i + 1) : this.t('add_value'),
                clearable: true,
                onChange: newValue => {
                  const splitValue = parsedValue.value.split(',');

                  if (newValue) {
                    splitValue[i] = newValue;
                  } else {
                    splitValue.splice(i, 1);
                  }

                  onChange(
                    QueryBuilder.stringify({
                      ...parsedValue,
                      value: splitValue.join(','),
                    })
                  );
                },
              })}
            </div>
          `
        )}
      </div>
    `;
  }

  private __getCommonValueInputProps(inputValue: string, option: Option | null) {
    const optionType = option?.type ?? Type.Any;
    const type = optionType === Type.Number ? 'number' : optionType === Type.Date ? 'date' : 'text';
    const listOption = option?.list?.find(v => v.value === inputValue);
    const displayValue = listOption ? this.t(listOption.key) : undefined;
    const list = option?.list?.map(v => ({ key: this.t(v.key), value: v.value }));

    return { type, list, displayValue, value: inputValue };
  }

  private __renderIsDefinedValueInput(
    parsedValue: ParsedValue,
    onChange: (newValue: string) => void
  ) {
    return renderSelect({
      label: this.t('value'),
      value: parsedValue.value,
      list: [
        { key: this.t('is_defined_true'), value: 'true' },
        { key: this.t('is_defined_false'), value: 'false' },
      ],
      onChange: newValue => {
        onChange(QueryBuilder.stringify({ ...parsedValue, value: newValue }));
      },
    });
  }

  private __renderBooleanValueInput(
    parsedValue: ParsedValue,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
    const trueKey = option?.list?.find(v => v.value === 'true')?.key ?? 'true';
    const falseKey = option?.list?.find(v => v.value === 'false')?.key ?? 'false';

    return renderSelect({
      label: this.t('value'),
      value: parsedValue.value,
      list: [
        { key: this.t(trueKey), value: 'true' },
        { key: this.t(falseKey), value: 'false' },
      ],
      onChange: newValue => {
        onChange(QueryBuilder.stringify({ ...parsedValue, value: newValue }));
      },
    });
  }

  private __renderRangeValueInput(
    parsedValue: ParsedValue,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
    const renderer = option?.list ? renderSelect : renderInput;

    return html`
      <div
        class="grid bg-contrast-10 gap-1px grid-cols-1 grid-rows-2 sm-grid-cols-2 sm-grid-rows-1"
      >
        <div class="bg-base">
          ${renderer({
            ...this.__getCommonValueInputProps(parsedValue.value.split('..')[0], option),
            label: this.t('range_from'),
            onChange: newValue => {
              const splitValue = parsedValue.value.split('..');
              splitValue[0] = newValue;

              onChange(
                QueryBuilder.stringify({
                  ...parsedValue,
                  value: splitValue.join('..'),
                })
              );
            },
          })}
        </div>

        <div class="bg-base">
          ${renderer({
            ...this.__getCommonValueInputProps(parsedValue.value.split('..')[1], option),
            label: this.t('range_to'),
            onChange: newValue => {
              const splitValue = parsedValue.value.split('..');
              splitValue[1] = newValue;

              onChange(
                QueryBuilder.stringify({
                  ...parsedValue,
                  value: splitValue.join('..'),
                })
              );
            },
          })}
        </div>
      </div>
    `;
  }

  private __renderSingleValueInput(
    parsedValue: ParsedValue,
    option: Option | null,
    onChange: (newValue: string) => void
  ) {
    const renderer = option?.list ? renderSelect : renderInput;

    return renderer({
      ...this.__getCommonValueInputProps(parsedValue.value ?? '', option),
      disabled: !parsedValue.path,
      label: this.t('value'),
      onChange: newValue => {
        onChange(QueryBuilder.stringify({ ...parsedValue, value: newValue }));
      },
    });
  }
}

export { QueryBuilder };
