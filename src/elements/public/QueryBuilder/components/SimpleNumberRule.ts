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
      onChange: newSelection => {
        if (newSelection === 'any') return onChange(null);

        if (newSelection === 'range') {
          const parsedFrom = parseFloat(rule?.value ?? '');
          if (isNaN(parsedFrom)) return onChange({ operator: null, value: '..', invalid: true });
          return onChange({ operator: null, value: `${parsedFrom}..${parsedFrom + 10}` });
        }

        const newValue = rule?.value ?? option.min?.toString() ?? '';
        const removeRange = newValue.includes('..') && newSelection !== 'range';

        return onChange({
          operator: newSelection === 'equal' ? null : (newSelection as Operator),
          invalid: !newValue,
          value: removeRange ? newValue.split('..')[0] : newValue,
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
              const to = rule?.value.split('..')[1] ?? '';
              onChange({ value: `${newValue}..${to}`, invalid: !newValue || !to });
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
              onChange({ value: `${from}..${newValue}`, invalid: !from || !newValue });
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
          onChange: newValue => onChange({ value: newValue, invalid: !newValue }),
        })}
  `;
};
