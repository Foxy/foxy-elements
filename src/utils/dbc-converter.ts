import { ComplexAttributeConverter } from 'lit-element';
import { parseDBC } from './parse-dbc';

export const createDBCConverter = (name: string): ComplexAttributeConverter => ({
  fromAttribute: value => value === name || (!!value && parseDBC(value)),
  toAttribute: value => (value ? undefined : null),
});
