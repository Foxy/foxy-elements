import { Option, ParsedValue, Type } from '../types';

import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { Select } from './Select';
import { TemplateResult } from 'lit-html';

export type SingleValueParams = {
  parsedValue: ParsedValue;
  readonly: boolean;
  disabled: boolean;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function SingleValue(params: SingleValueParams): TemplateResult {
  const { t, option, parsedValue, readonly, disabled, onChange } = params;
  const Field = option?.list ? Select : Input;
  const type = option?.type ?? Type.Any;

  return Field({
    displayValue: option?.list?.find(v => v.value === parsedValue.value)?.label,
    readonly,
    disabled: disabled || !parsedValue.path,
    value: parsedValue.value ?? '',
    label: 'value',
    type: type === Type.Number ? 'number' : type === Type.Date ? 'date' : 'text',
    list: option?.list,
    t: t,
    onChange: newValue => onChange({ ...parsedValue, value: newValue }),
  });
}
