import { FormatFunction } from 'i18next';
import { parseDuration } from '../../../../utils/parse-duration';

/**
 * i18next formatter that presents duration as relative time.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const relative: FormatFunction = (value, format, lang): string => {
  const rtf = new Intl.RelativeTimeFormat(lang);
  let { count, units } = parseDuration(value, true);

  if (count === 0.5 && units === 'month') {
    count = 2;
    units = 'week';
  }

  return rtf.format(count, units as Intl.RelativeTimeFormatUnit);
};
