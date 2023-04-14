import { Option, ParsedValue, Type } from '../types';
import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { Select } from './Select';

export type RangeValueParams = {
  parsedValue: ParsedValue;
  readonly: boolean;
  disabled: boolean;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function RangeValue(params: RangeValueParams): TemplateResult {
  const { t, parsedValue, option, readonly, disabled, onChange } = params;
  const splitValue = parsedValue.value.split('..');
  const from = splitValue.length >= 1 ? splitValue[0] : '';
  const to = splitValue.length >= 2 ? splitValue[1] : '';

  const Field = option?.list ? Select : Input;
  const optionType = option?.type ?? Type.Any;
  const type = optionType === Type.Number ? 'number' : optionType === Type.Date ? 'date' : 'text';
  const list = option?.list;

  return html`
    <div class="grid bg-contrast-10 gap-1px grid-cols-1 grid-rows-2 sm-grid-cols-2 sm-grid-rows-1">
      <div class="bg-base">
        ${Field({
          displayValue: list?.find(v => v.value === from)?.label,
          readonly,
          disabled,
          value: from,
          label: 'range_from',
          type: type,
          list: list,
          t: t,
          onChange: newValue => onChange({ ...parsedValue, value: `${newValue}..${to}` }),
        })}
      </div>

      <div class="bg-base">
        ${Field({
          displayValue: list?.find(v => v.value === to)?.label,
          readonly,
          disabled,
          label: 'range_to',
          value: to,
          type: type,
          list: list,
          t: t,
          onChange: newValue => onChange({ ...parsedValue, value: `${from}..${newValue}` }),
        })}
      </div>
    </div>
  `;
}
