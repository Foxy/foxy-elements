import { Resource } from '@foxy.io/sdk/core';

type Rel = {
  links: { self: Rel };
  props: {
    type: 'email';
    detail: { email: string };
  };
};

export type Data = Resource<Rel>;
