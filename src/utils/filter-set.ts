import { DBC } from './parse-dbc';

export function filterSet<T extends string>(fullSet: T[], filter: boolean | DBC): T[] {
  if (typeof filter === 'object') {
    if ('only' in filter) return fullSet.filter(v => !!filter.only?.[v]);
    if ('not' in filter) return fullSet.filter(v => !filter.not?.includes(v));
  }

  return filter ? fullSet : [];
}

export function getDBCValue(dbc: boolean | DBC, field: string): boolean | DBC {
  if (typeof dbc === 'boolean') return dbc;
  if (dbc.only) return dbc.only[field] ?? false;
  return !dbc.not?.includes(field);
}
