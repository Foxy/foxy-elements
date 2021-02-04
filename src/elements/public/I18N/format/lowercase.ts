import { FormatFunction } from 'i18next';

/**
 * i18next formatter that converts given value to lowecase.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const lowercase: FormatFunction = (value): string => {
  return value.toLowerCase();
};
