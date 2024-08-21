import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { SpinnerState } from '../../public/Spinner/Spinner';

export type SwipeAction<TData = HALJSONResource> = {
  theme: string;
  state: 'idle' | SpinnerState;
  text: string;
  onClick: (data: TData) => unknown;
};

export type BulkAction<TItemData = HALJSONResource> = {
  name: string;
  onClick: (selection: TItemData[]) => Promise<unknown>;
};
