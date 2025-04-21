import type { Rule } from '../types';

function stringifyGroup(parsedValue: Rule): string {
  let result = parsedValue.path;
  if (parsedValue.name) result += `:name[${parsedValue.name}]`;
  if (parsedValue.operator) result += `:${parsedValue.operator}`;
  result = `${encodeURIComponent(result)}=${encodeURIComponent(parsedValue.value)}`;
  return result === '=' ? '' : result;
}

function stringify(newValue: (Rule | Rule[])[], disableZoom = false): string {
  const toQuery = (rules: string[], rule: Rule | Rule[]) => {
    if (Array.isArray(rule)) {
      let key = rule[0].path;
      if (rule[0].name) key += `:name[${rule[0].name}]`;
      if (rule[0].operator) key += `:${rule[0].operator}`;

      const alternatives = [
        rule[0].value,
        ...rule.slice(1).map(or => decodeURIComponent(stringifyGroup(or))),
      ];

      rules.push(`${encodeURIComponent(key)}=${encodeURIComponent(alternatives.join('|'))}`);
    } else if (rule.path !== 'zoom') {
      rules.push(stringifyGroup(rule));
    }

    return rules;
  };

  const query = newValue.reduce(toQuery, [] as string[]);

  if (!disableZoom) {
    const zoom = getZoomedRels(newValue).join(',');
    if (zoom) query.push(`zoom=${encodeURIComponent(zoom)}`);
  }

  return query.join('&');
}

function getZoomedRels(value: (Rule | Rule[])[]): string[] {
  return value
    .map(rule => {
      if (Array.isArray(rule)) return getZoomedRels(rule);
      if (rule.name) return [rule.path];

      const pathMembers = rule.path.split(':');
      return pathMembers.slice(0, pathMembers.length - 1);
    })
    .flat()
    .sort((rel1, rel2) => rel2.length - rel1.length)
    .filter((rel, index, rels) => {
      return rels.every((_rel, _index) => {
        return (_index >= index || _rel !== rel) && !_rel.startsWith(`${rel}:`);
      });
    });
}

export { stringify };
