import type { Dataset } from './types';

export const increment = (() => {
  const maxPerCollection = new Map<string, number>();

  return (collection: string, dataset: Dataset): number => {
    if (!maxPerCollection.has(collection)) {
      const docs = dataset[collection] ?? [];
      const currentMax = Math.max(...docs.map(v => v.id), -1);
      maxPerCollection.set(collection, currentMax);
    }

    const currentMax = maxPerCollection.get(collection) as number;
    const newMax = currentMax + 1;

    maxPerCollection.set(collection, newMax);
    return newMax;
  };
})();
