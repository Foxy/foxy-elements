export enum Type {
  Attribute = 'attribute',
  Boolean = 'boolean',
  String = 'string',
  Number = 'number',
  Date = 'date',
  Any = 'any',
}

export enum Operator {
  LessThanOrEqual = 'lessthanorequal',
  LessThan = 'lessthan',
  GreaterThanOrEqual = 'greaterthanorequal',
  GreaterThan = 'greaterthan',
  IsDefined = 'isdefined',
  Not = 'not',
  In = 'in',
}

export type Option = {
  list?: { key: string; value: string }[];
  type: Type;
  path: string;
  key: string;
};

export type ParsedValue = {
  name: string | null;
  path: string;
  value: string;
  operator: Operator | null;
};
