import { Option, ParsedValue } from '../types';

import { I18n } from '../../I18n/I18n';
import { Select } from './Select';
import { TemplateResult } from 'lit-html';

export type BooleanValueParams = {
  parsedValue: ParsedValue;
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function BooleanValue(params: BooleanValueParams): TemplateResult {
  const { parsedValue, option, t, onChange } = params;

  const falseLabel = option?.list?.find(v => v.value === 'false')?.label ?? 'false';
  const trueLabel = option?.list?.find(v => v.value === 'true')?.label ?? 'true';
  const list = [
    { label: trueLabel, value: 'true' },
    { label: falseLabel, value: 'false' },
  ];

  return Select({
    value: parsedValue.value,
    label: 'value',
    list,
    t,
    onChange: newValue => onChange({ ...parsedValue, value: newValue }),
  });
}
