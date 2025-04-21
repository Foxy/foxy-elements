import type { SimpleRuleComponent } from '../types';

import { SimpleSelect } from './SimpleSelect';

export const SimpleBooleanRule: SimpleRuleComponent = params => {
  const options = [
    { label: 'value_any', value: 'any' },
    { label: `${params.option.label}_true`, value: 'true' },
    { label: `${params.option.label}_false`, value: 'false' },
  ];

  return SimpleSelect({
    ...params,
    onChange: newValue => params.onChange(newValue === 'any' ? null : { value: newValue }),
    current: options.find(o => o.value === params.rule?.value) ?? options[0],
    options,
  });
};
