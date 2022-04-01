import { FormatFunction } from 'i18next';

/**
 * i18next formatter that localizes ISO date.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const date: FormatFunction = (value, _, lang): string => {
  if (!value) return '$t(unknown)';

  const valueAsDate = new Date(value);
  const month = 'long';
  const year = new Date().getFullYear() === valueAsDate.getFullYear() ? undefined : 'numeric';
  const day = 'numeric';

  return valueAsDate.toLocaleDateString(lang, { month, year, day });
};
