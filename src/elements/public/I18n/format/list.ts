import { FormatFunction } from 'i18next';

/**
 * i18next formatter that presents an array of serializable items
 * as `[0], [1], [...] and [length - 1]`. For example, given an array like
 * the following: `['a', 'b', 'c']`, it will output `'a, b and c'`.
 * @see https://www.i18next.com/translation-function/formatting
 */
export const list: FormatFunction = (value): string => {
  return (value as string[])
    .map((v, i, a) => {
      if (i === 0) return v;
      const part = i === a.length - 1 ? ` $t(and) ` : ',';
      return `${part} ${v}`;
    })
    .join('');
};
