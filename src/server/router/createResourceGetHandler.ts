import { Dataset, Document, Links } from './types';
import { HandleResult, HandlerContext, Router } from 'service-worker-router';

import merge from 'lodash-es/merge';

async function addEmbeds(router: Router, result: Document, zoom: string[][]) {
  await Promise.all(
    zoom.map(async rels => {
      const topRel = rels[0];
      if (!topRel) return;

      const curieForTopRel = `fx:${topRel}`;
      const links = result._links as Record<string, { href: string }>;
      if (!links[curieForTopRel]?.href) return;
      if (!result._embedded) result._embedded = {};

      const request = new Request(links[curieForTopRel].href);
      const handleResult = router.handleRequest(request) as HandleResult;
      const response = await handleResult.handlerPromise.then(response => response.json());
      const embeds = result._embedded as Record<string, unknown>;
      const isCollection = response._links.first;

      if (isCollection) {
        await Promise.all(
          response._embedded[curieForTopRel]?.map((nestedResult: Document) => {
            return addEmbeds(router, nestedResult, [rels.slice(1)]);
          }) ?? []
        );

        embeds[curieForTopRel] = merge(
          embeds[curieForTopRel] ?? [],
          response._embedded[curieForTopRel] ?? []
        );
      } else {
        await addEmbeds(router, response, [rels.slice(1)]);
        embeds[curieForTopRel] = response;
      }

      result._embedded = embeds;
    })
  );
}

export function createResourceGetHandler(router: Router, dataset: Dataset, links: Links) {
  return async ({ params, url }: HandlerContext): Promise<Response> => {
    const { collection, prefix, id } = params;
    const document = dataset[collection]?.find(v => v.id == id);
    if (!document) return new Response('Not found', { status: 404 });

    const resourceLinks = links[collection]?.(document) ?? {};
    resourceLinks.self = { href: url.toString() };

    const base = `${url.origin}/${prefix}/`;
    for (const curie in resourceLinks) {
      const link = resourceLinks[curie];
      link.href = new URL(link.href, base).toString();
    }

    document._links = resourceLinks;

    const zoom = url.searchParams.get('zoom');
    const parsedZoom = zoom?.split(',').map(v => v.split(':')) ?? [];

    await addEmbeds(router, document, parsedZoom);

    return new Response(JSON.stringify(document));
  };
}
