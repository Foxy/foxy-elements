import { Option, ParsedValue, Type } from '../types';
import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { Select } from './Select';

export type RangeValueParams = {
  parsedValue: ParsedValue;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function RangeValue(params: RangeValueParams): TemplateResult {
  const { t, parsedValue, option, onChange } = params;
  const [from, to] = parsedValue.value.split('..');

  const Field = option?.list ? Select : Input;
  const optionType = option?.type ?? Type.Any;
  const type = optionType === Type.Number ? 'number' : optionType === Type.Date ? 'date' : 'text';
  const list = option?.list;

  return html`
    <div class="grid bg-contrast-10 gap-1px grid-cols-1 grid-rows-2 sm-grid-cols-2 sm-grid-rows-1">
      <div class="bg-base">
        ${Field({
          displayValue: list?.find(v => v.value === from)?.label,
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
