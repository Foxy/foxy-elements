import type { HALJSONResource } from '../../../NucleonElement/types';

export type Data = HALJSONResource & { selection: string; query: string };
