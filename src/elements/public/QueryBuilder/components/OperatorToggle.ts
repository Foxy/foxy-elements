import * as icons from '../icons/index';

import { Operator, Option, ParsedValue, Type } from '../types';
import { SVGTemplateResult, TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { classMap } from '../../../../utils/class-map';

export type OperatorToggleParams = {
  parsedValue: ParsedValue;
  operators: Operator[];
  readonly: boolean;
  disabled: boolean;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function OperatorToggle(params: OperatorToggleParams): TemplateResult {
  const operator = params.parsedValue.operator;

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
    [Type.Attribute]: [Operator.In, Operator.Not, Operator.IsDefined],
    [Type.Boolean]: [],
    [Type.String]: [Operator.In, Operator.Not],
    [Type.Number]: [
      Operator.In,
      Operator.Not,
      Operator.GreaterThan,
      Operator.LessThan,
      Operator.GreaterThanOrEqual,
      Operator.LessThanOrEqual,
    ],
    [Type.Date]: [Operator.In, Operator.Not],
    [Type.Any]: Object.values(Operator),
  };

  const operatorsForType = (
    params.option
      ? operatorsByType[params.option.type]
      : params.parsedValue.name
      ? Object.values(Operator)
      : Object.values(Operator).filter(v => v !== Operator.IsDefined)
  ).filter(v => params.operators.includes(v));

  const isDisabled =
    params.disabled || params.readonly || operatorsForType.length === 0 || !params.parsedValue.path;

  return html`
    <button
      title=${params.t(`operator_${operator ?? 'equal'}`)}
      class=${classMap({
        'flex items-center justify-center w-m h-m transition-colors': true,
        'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
        'text-body hover-bg-contrast-5': !isDisabled && operatorsForType.length > 1,
        'cursor-default text-tertiary': !isDisabled && operatorsForType.length <= 1,
        'text-disabled cursor-default': isDisabled,
      })}
      ?disabled=${isDisabled || operatorsForType.length <= 1}
      @click=${() => {
        const newOperatorIndex = operator ? operatorsForType.indexOf(operator) : -1;
        const newOperator = operatorsForType[newOperatorIndex + 1] ?? null;

        params.onChange({
          ...params.parsedValue,
          operator: newOperator,
          value: params.parsedValue.value,
        });
      }}
    >
      <div aria-hidden="true">${operator ? operatorToIcon[operator] : icons.operatorEqual}</div>
    </button>
  `;
}
