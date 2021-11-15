import { ParsedValue } from '../types';

function stringifyGroup(parsedValue: ParsedValue): string {
  let result = parsedValue.path;
  if (parsedValue.name) result += `[${parsedValue.name}]`;
  if (parsedValue.operator) result += `:${parsedValue.operator}`;
  result = `${encodeURIComponent(result)}=${encodeURIComponent(parsedValue.value)}`;
  return result === '=' ? '' : result;
}

function stringify(newValue: (ParsedValue | ParsedValue[])[]): string {
  return newValue
    .map(newRule => {
      if (Array.isArray(newRule)) {
        const alternatives = [newRule[0].value, newRule.slice(1).map(or => stringifyGroup(or))];
        const orValue = alternatives.join('|');

        return `${newRule[0].path}=${encodeURIComponent(orValue)}`;
      } else {
        return stringifyGroup(newRule);
      }
    })
    .join('&');
}

export { stringify };
