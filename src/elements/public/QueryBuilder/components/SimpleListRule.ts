import { SimpleRuleComponent, Operator } from '../types';
import { SimpleSelect } from './SimpleSelect';
import { html } from 'lit-html';

export const SimpleListRule: SimpleRuleComponent = params => {
  const { disabled, readonly, option, rule, t, onChange } = params;
  const { list } = option;

  const currentOption = list?.find(v => v.value === rule?.value);
  const operator = rule?.operator;

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
          value: rule?.value ?? list?.[0]?.value ?? '',
        });
      },
    })}
    ${rule?.value === undefined
      ? ''
      : SimpleSelect({
          disabled,
          readonly,
          current: currentOption ?? { label: 'value_any', value: '' },
          options: list ?? [],
          t,
          onChange: newValue => onChange({ value: newValue }),
        })}
  `;
};
