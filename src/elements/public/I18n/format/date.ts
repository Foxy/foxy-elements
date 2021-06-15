import { FormatFunction } from 'i18next';

/**
 * i18next formatter that localizes ISO date.
 *
 * @param value
 * @param format
 * @param lang
 * @see https://www.i18next.com/translation-function/formatting
 */
export const date: FormatFunction = (value, format, lang): string => {
  const valueAsDate = new Date(value);
  return valueAsDate.toLocaleDateString(lang, {
    month: 'long',
    year: new Date().getFullYear() === valueAsDate.getFullYear() ? undefined : 'numeric',
    day: 'numeric',
  });
};
