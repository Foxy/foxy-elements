import { FormatFunction } from 'i18next';
import { currency } from './currency';
import { date } from './date';
import { list } from './list';
import { lowercase } from './lowercase';

/**
 * Chooses the right i18next formatter for the given template.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const format: FormatFunction = (...args): string => {
  const value = args[0];
  const formats = args[1]?.split(' ') ?? [];
  const language = args[2] ?? 'en';

  return formats.reduce((result, format) => {
    if (format === 'lowercase') return lowercase(result, format, language);
    if (format === 'currency') return currency(result, format, language);
    if (format === 'list') return list(result, format, language);
    if (format === 'date') return date(result, format, language);

    return result;
  }, value);
};
