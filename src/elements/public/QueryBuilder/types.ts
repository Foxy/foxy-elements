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
  label: string;
  list?: { label: string; value: string }[];
  path: string;
  type: Type;
};

export type ParsedValue = {
  name?: string;
  path: string;
  value: string;
  operator: Operator | null;
};
