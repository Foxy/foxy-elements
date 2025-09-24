import type { SimpleRuleComponent } from '../types';

import { serializeDate } from '../../../../utils/serialize-date';
import { SimpleSelect } from './SimpleSelect';
import { SimpleInput } from './SimpleInput';
import { parseDate } from '../../../../utils/parse-date';
import { Operator } from '../types';
import { html } from 'lit-html';

export const SimpleDateRule: SimpleRuleComponent = params => {
  const { operator, value } = params.rule ?? {};
  const { min, label } = params.option;
  const { disabled, readonly, t, onChange } = params;

  const isRange = value?.includes('..');
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
      t,
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
      onChange: newSelection => {
        if (newSelection === 'any') return onChange(null);

        if (newSelection === 'range') {
          const fromDate = new Date(value ?? new Date().toISOString());
          const toDate = new Date(fromDate);

          fromDate.setMonth(fromDate.getMonth() - 1);
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);

          const from = fromDate.toISOString();
          const to = toDate.toISOString();

          return onChange({ operator: null, value: `${from}..${to}` });
        }

        const newValue = value ?? new Date().toISOString();
        const removeRange = newValue.includes('..') && newSelection !== 'range';

        return onChange({
          operator: newSelection === 'equal' ? null : (newSelection as Operator),
          value: removeRange ? newValue.split('..')[0] : newValue,
        });
      },
    })}
    ${value === undefined
      ? ''
      : isRange
      ? html`
          ${SimpleInput({
            disabled,
            readonly,
            layout: 'fixed',
            label: 'range_from',
            value: serializeDate(new Date(value.split('..')[0])),
            type: 'date',
            min,
            t,
            onChange: newValue => {
              const fromDate = parseDate(newValue) ?? new Date();
              const toDate = new Date(value.split('..')[1] ?? Date.now());

              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);

              onChange({ value: `${fromDate.toISOString()}..${toDate.toISOString()}` });
            },
          })}
          ${SimpleInput({
            disabled,
            readonly,
            layout: 'fixed',
            label: 'range_to',
            value: serializeDate(new Date(value.split('..')[1])),
            type: 'date',
            min,
            t,
            onChange: newValue => {
              const fromDate = new Date(value.split('..')[0] ?? Date.now());
              const toDate = parseDate(newValue) ?? new Date();

              fromDate.setHours(0, 0, 0, 0);
              toDate.setHours(23, 59, 59, 999);

              onChange({ value: `${fromDate.toISOString()}..${toDate.toISOString()}` });
            },
          })}
        `
      : SimpleInput({
          disabled,
          readonly,
          label,
          value: serializeDate(new Date(value ?? Date.now())),
          type: 'date',
          min,
          t,
          onChange: newValue => {
            onChange({ value: (parseDate(newValue) ?? new Date()).toISOString() });
          },
        })}
  `;
};
