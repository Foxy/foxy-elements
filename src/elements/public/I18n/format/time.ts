import { FormatFunction } from 'i18next';

/**
 * i18next formatter that localizes ISO date.
 *
 * @param value
 * @param format
 * @param lang
 * @see https://www.i18next.com/translation-function/formatting
 */
export const time: FormatFunction = (value, format, lang): string => {
  return new Date(value).toLocaleTimeString(lang, {
    hour: 'numeric',
    minute: 'numeric',
  });
};
