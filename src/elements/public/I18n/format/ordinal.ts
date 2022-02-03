import { FormatFunction } from 'i18next';

/**
 * i18next formatter that returns ordinal for a number.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const ordinal: FormatFunction = (value, format, lang): string => {
  const rules = new Intl.PluralRules(lang, { type: 'ordinal' });
  return `${value}$t(ordinal_${rules.select(value)})`;
};
