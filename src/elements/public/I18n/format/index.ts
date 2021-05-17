import { FormatFunction } from 'i18next';
import { date } from './date';
import { time } from './time';
import { price } from './price';

/**
 * Chooses the right i18next formatter for the given template.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const format: FormatFunction = (...args): string => {
  const value = args[0];
  const formats = args[1]?.split(' ') ?? [];
  const language = args[2] ?? 'en';

  return formats.reduce((result, format) => {
    if (format === 'price') return price(result, format, language);
    if (format === 'date') return date(result, format, language);
    if (format === 'time') return time(result, format, language);
    return result;
  }, value);
};
