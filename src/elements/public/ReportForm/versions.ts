import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

type Version = {
  property: keyof Resource<Rels.Report>;
  key: string;
  text: string;
};

export const versions: Version[] = [
  {
    property: 'version',
    key: 'complete',
    text: 'Complete',
  },
  {
    property: 'version',
    key: 'customers',
    text: 'Customers',
  },
  {
    property: 'version',
    key: 'customers_ltv',
    text: 'Customers LTV',
  },
];
