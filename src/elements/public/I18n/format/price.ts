import { FormatFunction } from 'i18next';

/**
 * i18next formatter that formats given value as price + currency code (e.g. 9.99 USD) for current locale (e.g. $9,99).
 * @see https://www.i18next.com/translation-function/formatting
 */
export const price: FormatFunction = (value, format, lang): string => {
  const [amount, currency] = value.split(' ');
  return parseFloat(amount).toLocaleString(lang, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
    currency,
  });
};
