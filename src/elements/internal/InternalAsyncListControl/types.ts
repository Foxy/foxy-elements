import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { SpinnerState } from '../../public/Spinner/Spinner';

export type Action<TData = HALJSONResource> = {
  theme: string;
  state: 'idle' | SpinnerState;
  text: string;
  onClick: (data: TData) => unknown;
};
