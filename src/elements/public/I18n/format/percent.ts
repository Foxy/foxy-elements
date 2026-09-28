import { FormatFunction } from 'i18next';

/**
 * i18next formatter that presents a fraction as percentage.
 * Keeps up to 4 decimal places (e.g. 0.08875 -> 8.875%) unless overridden in options.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const percent: FormatFunction = (value, format, lang, options): string => {
  let result: string | null = null;

  try {
    if (typeof value === 'number') {
      result = value.toLocaleString(lang, {
        maximumFractionDigits: 4,
        ...options,
        style: 'percent',
      });
    }
  } catch (err) {
    console.warn(`i18next formatter error: ${err.message}`);
  }

  return result || String(value);
};
