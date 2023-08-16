import { ParsedValue } from '../types';

function stringifyGroup(parsedValue: ParsedValue): string {
  let result = parsedValue.path;
  if (parsedValue.name) result += `:name[${parsedValue.name}]`;
  if (parsedValue.operator) result += `:${parsedValue.operator}`;
  result = `${encodeURIComponent(result)}=${encodeURIComponent(parsedValue.value)}`;
  return result === '=' ? '' : result;
}

function stringify(newValue: (ParsedValue | ParsedValue[])[]): string {
  const toQuery = (rules: string[], rule: ParsedValue | ParsedValue[]) => {
    if (Array.isArray(rule)) {
      const alternatives = [rule[0].value, rule.slice(1).map(or => stringifyGroup(or))];
      const orValue = alternatives.join('|');

      rules.push(`${rule[0].path}=${encodeURIComponent(orValue)}`);
    } else if (rule.path !== 'zoom') {
      rules.push(stringifyGroup(rule));
    }

    return rules;
  };

  const query = newValue.reduce(toQuery, [] as string[]);
  const zoom = getZoomedRels(newValue).join(',');

  if (zoom) query.push(`zoom=${encodeURIComponent(zoom)}`);
  return query.join('&');
}

function getZoomedRels(value: (ParsedValue | ParsedValue[])[]): string[] {
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
