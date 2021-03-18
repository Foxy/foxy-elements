import halson from 'halson';

type Params = {
  url: string;
  rel: string;
  count: number;
  items: any[];
  composeItem: (item: any) => any;
};

export function composeCollection({ url, rel, count, items, composeItem }: Params) {
  const limitInQuery = parseInt(new URL(url).searchParams.get('limit') ?? '20');
  const limit = isNaN(limitInQuery) || limitInQuery > 300 || limitInQuery < 0 ? 20 : limitInQuery;

  const offsetInQuery = parseInt(new URL(url).searchParams.get('offset') ?? '0');
  const offset = isNaN(offsetInQuery) || offsetInQuery < 0 ? 0 : offsetInQuery;

  const partialPageUrl = new URL(url);
  partialPageUrl.searchParams.set('limit', limit.toString());

  const first = new URL('', partialPageUrl);
  first.searchParams.set('offset', '0');

  const prev = new URL('', partialPageUrl);
  prev.searchParams.set('offset', Math.max(offset - limit, 0).toString());

  const next = new URL('', partialPageUrl);
  next.searchParams.set('offset', Math.min(count, offset + limit).toString());

  const last = new URL('', partialPageUrl);
  last.searchParams.set('offset', Math.max(count - limit, 0).toString());

  return halson({
    total_items: count,
    returned_items: items.length,
    offset,
    limit,
  })
    .addLink('first', first.toString())
    .addLink('self', url)
    .addLink('prev', prev.toString())
    .addLink('next', next.toString())
    .addLink('last', next.toString())
    .addEmbed(rel, items.map(composeItem));
}
