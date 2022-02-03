import { FormatFunction } from 'i18next';
import { date } from './date';
import { ordinal } from './ordinal';
import { percent } from './percent';
import { price } from './price';
import { time } from './time';

const formatters: Record<string, FormatFunction> = {
  percent,
  ordinal,
  price,
  date,
  time,
};

/**
 * Chooses the right i18next formatter for the given template.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const format: FormatFunction = (value, names = '', lang = 'en', opts = {}): string => {
  const parsedNames = names.split(' ').filter(v => !!v.trim());
  const applyFormat = (result: string, name: string) => {
    return formatters[name]?.(result, name, lang, opts) ?? result;
  };

  return parsedNames.reduce(applyFormat, value);
};
