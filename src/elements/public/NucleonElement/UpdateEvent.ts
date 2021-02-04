import { HALJSONResource, NucleonState } from './types';

export class UpdateEvent<TData extends HALJSONResource> extends CustomEvent<NucleonState<TData>> {
  constructor(type: 'update', init: CustomEventInit<NucleonState<TData>>) {
    super(type, init);
  }
}
