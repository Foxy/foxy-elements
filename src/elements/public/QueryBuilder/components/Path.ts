import { Option, ParsedValue } from '../types';

import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { TemplateResult } from 'lit-html';

export type PathParams = {
  parsedValue: ParsedValue;
  options: Option[];
  option: Option | null;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function Path({ parsedValue, option, options, t, onChange }: PathParams): TemplateResult {
  return Input({
    displayValue: option?.label,
    value: parsedValue.path,
    label: 'field',
    list: options.map(option => ({ ...option, value: option.path })),
    type: 'text',
    id: 'path',
    t: t,
    onChange: newPath => onChange({ operator: null, value: '', path: newPath }),
  });
}
