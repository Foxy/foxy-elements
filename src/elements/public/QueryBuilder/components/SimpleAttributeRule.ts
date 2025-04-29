import type { SimpleRuleComponent } from '../types';

import { SimpleSelect } from './SimpleSelect';
import { SimpleInput } from './SimpleInput';
import { Operator } from '../types';
import { classMap } from '../../../../utils/class-map';
import { html } from 'lit-html';

export const SimpleAttributeRule: SimpleRuleComponent = params => {
  const { operator, value, name } = params.rule ?? {};
  const { disabled, readonly, t } = params;

  const not = Operator.Not;
  const labelClass = classMap({ 'text-disabled': disabled, 'text-contrast-80': readonly });
  const displayedOperator = operator === null ? 'equal' : operator === not ? not : null;

  return html`
    <foxy-i18n class=${labelClass} infer="" key="name"></foxy-i18n>

    ${SimpleInput({
      layout: 'auto-grow',
      value: name || '',
      label: 'name',
      type: 'text',
      disabled,
      readonly,
      t,
      onChange: newValue => {
        if (!newValue) return params.onChange(null);
        if (value) {
          params.onChange({ name: newValue });
        } else {
          params.onChange({ name: newValue, operator: Operator.IsDefined, value: 'true' });
        }
      },
    })}

    <foxy-i18n class=${labelClass} infer="" key="value"></foxy-i18n>

    ${SimpleSelect({
      current: {
        label: displayedOperator ? `operator_${displayedOperator}` : 'value_any',
        value: displayedOperator ?? 'any',
      },
      options: [
        { label: 'value_any', value: 'any' },
        { label: 'operator_equal', value: 'equal' },
        { label: 'operator_not', value: not },
      ],
      disabled,
      readonly,
      t,
      onChange: newValue => {
        if (newValue === 'any') {
          params.onChange(name ? { operator: Operator.IsDefined, value: 'true' } : null);
        } else {
          return params.onChange({
            operator: newValue === 'equal' ? null : (newValue as Operator),
            value: operator === Operator.IsDefined ? '' : value ?? '',
            name: name ?? '',
          });
        }
      },
    })}
    ${value === undefined || operator === Operator.IsDefined
      ? ''
      : SimpleInput({
          layout: 'auto-grow',
          label: 'value',
          value: value || '',
          type: 'text',
          disabled,
          readonly,
          t,
          onChange: newValue => params.onChange({ value: newValue }),
        })}
  `;
};
