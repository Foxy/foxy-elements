import { SimpleRuleComponent, Operator } from '../types';
import { SimpleSelect } from './SimpleSelect';
import { SimpleInput } from './SimpleInput';
import { html } from 'lit-html';

export const SimpleNumberRule: SimpleRuleComponent = params => {
  const { disabled, readonly, option, rule, t, onChange } = params;
  const { min, label } = option;

  const operator = rule?.operator;
  const isRange = rule?.value.includes('..');
  const nullOperator = isRange ? 'range' : 'equal';
  const resolvedOperator = operator ?? nullOperator;
  const currentLabel =
    operator === void 0
      ? 'value_any'
      : resolvedOperator === 'range'
      ? 'range'
      : `operator_${resolvedOperator}`;

  return html`
    ${SimpleSelect({
      disabled,
      readonly,
      current: { label: currentLabel, value: operator === void 0 ? 'any' : resolvedOperator },
      options: [
        { label: 'value_any', value: 'any' },
        { label: 'operator_equal', value: 'equal' },
        { label: 'operator_not', value: Operator.Not },
        { label: 'operator_lessthanorequal', value: Operator.LessThanOrEqual },
        { label: 'operator_lessthan', value: Operator.LessThan },
        { label: 'operator_greaterthanorequal', value: Operator.GreaterThanOrEqual },
        { label: 'operator_greaterthan', value: Operator.GreaterThan },
        { label: 'range', value: 'range' },
      ],
      t,
      onChange: newValue => {
        if (newValue === 'any') return onChange(null);

        if (newValue === 'range') {
          let parsedFrom = parseFloat(rule?.value ?? '');
          if (isNaN(parsedFrom)) parsedFrom = 0;
          return onChange({ operator: null, value: `${parsedFrom}..${parsedFrom + 10}` });
        }

        return onChange({
          operator: newValue === 'equal' ? null : (newValue as Operator),
          value: rule?.value ?? option.min?.toString() ?? '0',
        });
      },
    })}
    ${rule?.value === undefined
      ? ''
      : isRange
      ? html`
          <foxy-i18n infer="" key="range_from"></foxy-i18n>

          ${SimpleInput({
            disabled,
            readonly,
            layout: 'auto-grow',
            label: 'range_from',
            value: rule?.value.split('..')[0],
            type: 'number',
            min,
            t,
            onChange: newValue => {
              const to = rule?.value.split('..')[1];
              onChange({ value: `${newValue || '0'}..${to}` });
            },
          })}

          <foxy-i18n infer="" key="range_to"></foxy-i18n>

          ${SimpleInput({
            disabled,
            readonly,
            layout: 'auto-grow',
            label: 'range_to',
            value: rule?.value.split('..')[1],
            type: 'number',
            min,
            t,
            onChange: newValue => {
              const from = rule?.value.split('..')[0];
              onChange({ value: `${from}..${newValue || '0'}` });
            },
          })}
        `
      : SimpleInput({
          disabled,
          readonly,
          layout: 'auto-grow',
          label: label,
          value: rule?.value || '',
          type: 'number',
          min,
          t,
          onChange: newValue => onChange({ value: newValue }),
        })}
  `;
};
