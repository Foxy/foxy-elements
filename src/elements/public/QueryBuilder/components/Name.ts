import { I18n } from '../../I18n/I18n';
import { Input } from './Input';
import { ParsedValue } from '../types';
import { TemplateResult } from 'lit-html';

export type NameParams = {
  parsedValue: ParsedValue;
  readonly: boolean;
  disabled: boolean;
  t: I18n['t'];
  onChange: (newValue: ParsedValue) => void;
};

export function Name(params: NameParams): TemplateResult {
  return Input({
    disabled: params.disabled,
    readonly: params.readonly,
    value: params.parsedValue.name ?? '',
    label: 'name',
    type: 'text',
    t: params.t,
    onChange: newName => params.onChange({ ...params.parsedValue, name: newName }),
  });
}
