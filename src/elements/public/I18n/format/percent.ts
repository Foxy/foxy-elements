import { FormatFunction } from 'i18next';

/**
 * i18next formatter that presents a fraction as percentage.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const percent: FormatFunction = (value, format, lang): string => {
  let result: string | null = null;

  try {
    if (typeof value === 'number') result = value.toLocaleString(lang, { style: 'percent' });
  } catch (err) {
    console.warn(`i18next formatter error: ${err.message}`);
  }

  return result || String(value);
};
