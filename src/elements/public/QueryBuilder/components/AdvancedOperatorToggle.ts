import type { SVGTemplateResult, TemplateResult } from 'lit-html';
import type { Rule } from '../types';
import type { I18n } from '../../I18n/I18n';

import * as icons from '../icons/index';

import { classMap } from '../../../../utils/class-map';
import { Operator } from '../types';
import { html } from 'lit-html';

type Params = {
  operators: Operator[];
  readonly: boolean;
  disabled: boolean;
  rule: Rule;
  t: I18n['t'];
  onChange: (newValue: Rule) => void;
};

export function AdvancedOperatorToggle(params: Params): TemplateResult {
  const { rule, operators, disabled, readonly, t, onChange } = params;
  const { operator, value, path, name } = rule;

  const operatorToIcon: Record<string, SVGTemplateResult> = {
    [Operator.GreaterThan]: icons.operatorGreaterThan,
    [Operator.GreaterThanOrEqual]: icons.operatorGreaterThanOrEqual,
    [Operator.In]: icons.operatorIn,
    [Operator.IsDefined]: icons.operatorIsDefined,
    [Operator.LessThan]: icons.operatorLessThan,
    [Operator.LessThanOrEqual]: icons.operatorLessThanOrEqual,
    [Operator.Not]: icons.operatorNot,
  };

  const availableOperators = Object.values(Operator).filter(
    v => operators.includes(v) && (name ? true : v !== Operator.IsDefined)
  );

  const isDisabled = disabled || readonly || !availableOperators.length || !path;

  return html`
    <button
      title=${t(`operator_${operator ?? 'equal'}`)}
      class=${classMap({
        'flex items-center justify-center w-m h-m transition-colors': true,
        'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
        'text-body hover-bg-contrast-5': !isDisabled && availableOperators.length > 1,
        'cursor-default text-tertiary': !isDisabled && availableOperators.length <= 1,
        'text-disabled cursor-default': isDisabled,
      })}
      ?disabled=${isDisabled || availableOperators.length <= 1}
      @click=${() => {
        const newOperatorIndex = operator ? availableOperators.indexOf(operator) : -1;
        const newOperator = availableOperators[newOperatorIndex + 1] ?? null;
        onChange({ ...rule, operator: newOperator, value: value });
      }}
    >
      <div aria-hidden="true">${operator ? operatorToIcon[operator] : icons.operatorEqual}</div>
    </button>
  `;
}
