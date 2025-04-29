import type { SimpleRuleComponent } from '../types';

import { SimpleSelect } from './SimpleSelect';
import { SimpleInput } from './SimpleInput';
import { Operator } from '../types';
import { html } from 'lit-html';

export const SimpleStringRule: SimpleRuleComponent = params => {
  const { disabled, readonly, option, rule, t, onChange } = params;
  const { operator } = rule ?? {};
  const { label } = option;

  return html`
    ${SimpleSelect({
      disabled,
      readonly,
      current: {
        label: operator === void 0 ? 'value_any' : `operator_${operator ?? 'equal'}`,
        value: operator === void 0 ? 'any' : operator ?? 'equal',
      },
      options: [
        { label: 'value_any', value: 'any' },
        { label: 'operator_equal', value: 'equal' },
        { label: 'operator_not', value: Operator.Not },
      ],
      t,
      onChange: newValue => {
        if (newValue === 'any') return onChange(null);
        return onChange({
          operator: newValue === 'equal' ? null : (newValue as Operator),
          value: rule?.value ?? '',
        });
      },
    })}
    ${rule?.value === undefined
      ? ''
      : SimpleInput({
          disabled,
          readonly,
          layout: 'auto-grow',
          label: label,
          value: rule?.value || '',
          t,
          onChange: newValue => onChange({ value: newValue }),
        })}
  `;
};
