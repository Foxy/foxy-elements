import { FormatFunction } from 'i18next';
import { list } from './list';
import { lowercase } from './lowercase';

/**
 * Chooses the right i18next formatter for the given template.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const format: FormatFunction = (...args): string => {
  const value = args[0];
  const formats = args[1]?.split(' ') ?? [];

  return formats.reduce((result, format) => {
    switch (format) {
      case 'lowercase':
        return lowercase(result);
      case 'list':
        return list(result);
      default:
        return result;
    }
  }, value);
};
