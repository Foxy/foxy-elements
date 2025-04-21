import type { TemplateResult } from 'lit-html';
import type { I18n } from '../I18n/I18n';

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
  group?: { name: string; layout?: string };
  label: string;
  list?: ({ value: string } & ({ label: string } | { rawLabel: string }))[];
  path: string;
  type: Type;
  min?: number | string;
};

export type Rule = {
  operator: Operator | null;
  value: string;
  name?: string;
  path: string;
};

export type SimpleRuleComponent = (params: {
  disabled: boolean;
  readonly: boolean;
  option: Option;
  rule: Rule | undefined;
  t: I18n['t'];
  onChange: (newValue: Partial<Omit<Rule, 'path'>> | null) => void;
}) => TemplateResult;
