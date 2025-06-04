import { HandleResult, HandlerContext, Router } from 'service-worker-router';
import { Dataset } from './types';

import get from 'lodash-es/get';

export function createCollectionGetHandler(router: Router, dataset: Dataset) {
  return async ({ params, url }: HandlerContext): Promise<Response> => {
    const limit = parseInt(url.searchParams.get('limit') ?? '20');
    const offset = parseInt(url.searchParams.get('offset') ?? '0');
    const filters = new URLSearchParams(url.searchParams);

    filters.delete('zoom');
    filters.delete('order');
    filters.delete('limit');
    filters.delete('offset');

    const filtersAsArray = Array.from(filters.entries());
    const allDocuments = dataset[params.collection] ?? [];
    const matchingDocuments = (
      await Promise.all(
        allDocuments.map(async doc => {
          const selfURL = new URL(`${url.origin}${url.pathname}/${doc.id}${url.hash}`);
          const zoom = url.searchParams.get('zoom');
          if (zoom) selfURL.searchParams.set('zoom', zoom);

          const result = router.handleRequest(new Request(selfURL.toString())) as HandleResult;
          return (await result.handlerPromise).json();
        })
      )
    ).filter(doc => {
      return filtersAsArray.every(([field, value]) => {
        const path = field
          .split(':')
          .map((v, i, a) => (i === a.length - 1 ? v : `_embedded['fx:${v}']`))
          .join('.');

        return get(doc, path) == value;
      });
    });

    const first = new URL('', url);
    first.searchParams.set('offset', '0');

    const prev = new URL('', url);
    prev.searchParams.set('offset', Math.max(offset - limit, 0).toString());

    const next = new URL('', url);
    next.searchParams.set('offset', Math.min(matchingDocuments.length, offset + limit).toString());

    const last = new URL('', url);
    last.searchParams.set('offset', Math.max(matchingDocuments.length - limit, 0).toString());

    const rel = params.collection.endsWith('_attributes') ? 'attributes' : params.collection;
    const itemsToReturn = matchingDocuments.slice(offset, offset + limit);
    const responseBody = {
      _embedded: { [`fx:${rel}`]: itemsToReturn },
      _links: {
        first: { href: first.toString() },
        self: { href: url.toString() },
        prev: { href: prev.toString() },
        next: { href: next.toString() },
        last: { href: last.toString() },
      },
      total_items: matchingDocuments.length,
      returned_items: itemsToReturn.length,
      offset,
      limit,
    };

    return new Response(JSON.stringify(responseBody));
  };
}
