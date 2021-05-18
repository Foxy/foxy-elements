import { FormatFunction } from 'i18next';

/**
 * i18next formatter that localizes ISO date.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const time: FormatFunction = (value, format, lang): string => {
  const valueAsDate = new Date(value);
  return valueAsDate.toLocaleTimeString(lang, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    }
  );
};
