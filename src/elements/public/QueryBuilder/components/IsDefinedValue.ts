import { I18n } from '../../I18n/I18n';
import { ParsedValue } from '../types';
import { Select } from './Select';
import { TemplateResult } from 'lit-html';

export type IsDefinedValueParams = {
  parsedValue: ParsedValue;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function IsDefinedValue(params: IsDefinedValueParams): TemplateResult {
  return Select({
    value: params.parsedValue.value,
    label: 'value',
    list: [
      { label: 'is_defined_true', value: 'true' },
      { label: 'is_defined_false', value: 'false' },
    ],
    t: params.t,
    onChange: newValue => params.onChange({ ...params.parsedValue, value: newValue }),
  });
}
