import { Option, ParsedValue, Type } from '../types';
import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { Select } from './Select';
import { repeat } from 'lit-html/directives/repeat';

export type ListValueParams = {
  parsedValue: ParsedValue;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function ListValue(params: ListValueParams): TemplateResult {
  const Field = params.option?.list ? Select : Input;
  const splitValue = params.parsedValue.value.split(',');
  const optionType = params.option?.type ?? Type.Any;
  const type = optionType === Type.Number ? 'number' : optionType === Type.Date ? 'date' : 'text';
  const list = params.option?.list;

  return html`
    <div class="bg-contrast-10 grid grid-cols-1 gap-1px">
      ${repeat(
        [...splitValue.filter(value => !!value), null],
        (value, index) => index,
        (value, index) => html`
          <div class="bg-base">
            ${Field({
              type: type,
              list: list,
              t: params.t,
              value: value ?? '',
              label: value ? String(index + 1) : 'add_value',
              clearable: true,
              displayValue: list?.find(item => item.value === value)?.label,
              onChange: newValue => {
                if (newValue) {
                  splitValue[index] = newValue;
                } else {
                  splitValue.splice(index, 1);
                }

                params.onChange({ ...params.parsedValue, value: splitValue.join(',') });
              },
            })}
          </div>
        `
      )}
    </div>
  `;
}
