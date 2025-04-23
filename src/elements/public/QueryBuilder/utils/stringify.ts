import type { Rule } from '../types';

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
    const zooms = new Set<string>();
    const maybeAdd = (rule: Rule) => {
      let rel: string;

      if (typeof rule.name === 'string') {
        rel = rule.path;
      } else {
        const separatorIndex = rule.path.lastIndexOf(':');
        if (separatorIndex === -1) return;
        rel = rule.path.substring(0, separatorIndex);
      }

      if (rel.length > 0) zooms.add(rel);
    };

    for (const ruleOrGroup of newValue) {
      if (Array.isArray(ruleOrGroup)) {
        for (const rule of ruleOrGroup) maybeAdd(rule);
      } else {
        maybeAdd(ruleOrGroup);
      }
    }

    if (zooms.size > 0) {
      query.set('zoom', Array.from(zooms).join());
    } else {
      query.delete('zoom');
    }
  }

  return query.toString();
}

export { stringify };
