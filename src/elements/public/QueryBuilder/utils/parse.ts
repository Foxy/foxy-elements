import { Operator, Rule } from '../types';

function parseGroup(key: string, value: string): Rule {
  const operators = Object.values(Operator) as Operator[];
  const operator = operators.find(operator => key.endsWith(`:${operator}`)) ?? null;

  let path = key.substring(0, operator ? key.lastIndexOf(':') : undefined);
  let name: string | undefined = undefined;

  const nameStart = key.lastIndexOf('[');

  if (path.endsWith(']') && nameStart !== -1) {
    name = path.substring(nameStart + 1, path.length - 1);
    path = path.substring(0, nameStart);
    if (path.endsWith(':name')) path = path.substring(0, path.length - 5);
  }

  return { name, path, value, operator };
}

function parse(search: string): (Rule | Rule[])[] {
  const params = new URLSearchParams(search);
  const result: (Rule | Rule[])[] = [];

  for (const [key, value] of params.entries()) {
    if (value.includes('|')) {
      result.push(
        value.split('|').map((part, index) => {
          if (index === 0) return parseGroup(key, part);
          return parseGroup(...(part.split('=') as [string, string]));
        })
      );
    } else {
      result.push(parseGroup(key, value));
    }
  }

  return result;
}

export { parse };
