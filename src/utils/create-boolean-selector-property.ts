import { BooleanSelector } from '@foxy.io/sdk/core';
import { PropertyDeclarations } from 'lit-element';

export function createBooleanSelectorProperty(name: string): PropertyDeclarations {
  return {
    [name]: {
      reflect: true,
      converter: {
        fromAttribute: value => BooleanSelector.fromAttribute(value, name),
        toAttribute: value => (value as BooleanSelector).toAttribute(),
      },
    },
  };
}
