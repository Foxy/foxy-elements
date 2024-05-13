import { FormatFunction } from 'i18next';

/**
 * i18next formatter that returns ordinal for a number.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const ordinal: FormatFunction = (value, format, lang, options): string => {
  const rules = new Intl.PluralRules(lang, { type: 'ordinal' });
  const splitNs = options?.ns?.split(' ') ?? [];
  splitNs?.shift();
  const key = [...splitNs, `ordinal_${rules.select(value)}`].join('.');
  return `${value}$t(${key})`;
};
