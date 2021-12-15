import traverse from 'traverse';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function serveFromCache(requestUrl: string, data: any): Response {
  let body: string | null = null;

  traverse(data).forEach(function () {
    // looking for a standalone resource in the data first
    if (this.node?._links?.self?.href) {
      const fullHref = this.node?._links?.self?.href;
      const noZoomURL = new URL(this.node?._links?.self?.href);
      noZoomURL.searchParams.delete('zoom');

      if (requestUrl === fullHref || requestUrl === noZoomURL.toString()) {
        body = JSON.stringify(this.node);
        this.stop();
        return;
      }
    }

    // alternatively, looking for an embedded collection in the data
    Object.entries(this.node?._links ?? {}).some(([curie, link]) => {
      if ((link as any).href !== requestUrl) return false;

      // one of the related collection's href matches requested url, let's see if it's embedded...
      const embed = this.node?._embedded?.[curie];
      if (!embed || !Array.isArray(embed)) return false;

      // we found an embed, now let's build a response body
      // assuming that there's more than 20 items in the collection if 20 was returned

      const totalItems = embed.length < 20 ? embed.length : 21;
      const next = new URL(requestUrl);
      const last = new URL(requestUrl);

      next.searchParams.set('offset', embed.length.toString());
      last.searchParams.set('offset', totalItems.toString());

      body = JSON.stringify({
        returned_items: embed.length,
        total_items: totalItems,
        offset: 0,
        limit: 20,
        _embedded: { [curie]: embed },
        _links: {
          curies: this.node._links.curies,
          first: { href: requestUrl },
          last: { href: last.toString() },
          prev: { href: requestUrl },
          next: { href: next.toString() },
          self: { href: requestUrl },
        },
      });

      this.stop();
      return true;
    });
  });

  return new Response(body, { status: body ? 200 : 404 });
}
