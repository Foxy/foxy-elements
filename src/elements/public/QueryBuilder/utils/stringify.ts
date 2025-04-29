import type { Rule } from '../types';
import { zoom } from './zoom';

function stringifyRule(parsedValue: Rule): [string, string] {
  let key = parsedValue.path;
  if (parsedValue.name) key += `:name[${parsedValue.name}]`;
  if (parsedValue.operator) key += `:${parsedValue.operator}`;
  return [key, parsedValue.value];
}

function stringify(newValue: (Rule | Rule[])[], disableZoom = false): string {
  const query = new URLSearchParams();

  for (const ruleOrGroup of newValue) {
    if (Array.isArray(ruleOrGroup)) {
      const [firstRule, ...otherRules] = ruleOrGroup.map(stringifyRule);
      if (firstRule && firstRule[0]) {
        const value = [firstRule[1], ...otherRules.map(rule => rule.join('='))];
        query.append(firstRule[0], value.join('|'));
      }
    } else {
      const [key, value] = stringifyRule(ruleOrGroup);
      if (key) query.append(key, value);
    }
  }

  if (!disableZoom) {
    const zoomValue = zoom(newValue);
    zoomValue ? query.set('zoom', zoomValue) : query.delete('zoom');
  }

  return query.toString();
}

export { stringify };
