import type { NucleonElement } from './NucleonElement';

import cloneDeep from 'lodash-es/cloneDeep';
import unset from 'lodash-es/unset';
import pull from 'lodash-es/pull';
import set from 'lodash-es/set';
import get from 'lodash-es/get';

export async function internalServer(req: Request, el: NucleonElement<any>): Promise<Response> {
  if (el.in('busy')) return Promise.resolve(new Response(null, { status: 500 }));

  const path = req.url
    .replace(`foxy://${el.virtualHost}/form/`, '')
    .split('/')
    .map(decodeURIComponent);

  const formAtPath = get(el.form, path);

  let status = 405;
  let json: any;

  if (req.method === 'GET') {
    if (Array.isArray(formAtPath)) {
      const rawOffset = parseInt(new URL(req.url).searchParams.get('offset') ?? '');
      const rawLimit = parseInt(new URL(req.url).searchParams.get('limit') ?? '');

      const intOffset = isNaN(rawOffset) || rawOffset < 0 ? 0 : rawOffset;
      const intLimit = isNaN(rawLimit) || rawLimit < 0 ? 20 : rawLimit;

      const embeds = formAtPath.slice(intOffset, intOffset + intLimit).map((item, index) => {
        const embedPath = ['form', ...path, String(index)];
        const embedHref = `foxy://${el.virtualHost}/${embedPath.map(encodeURIComponent).join('/')}`;
        return { _links: { self: { href: embedHref } }, ...item };
      });

      const firstUrl = new URL(req.url);
      firstUrl.searchParams.set('offset', '0');
      firstUrl.searchParams.set('limit', String(intLimit));

      const prevUrl = new URL(req.url);
      prevUrl.searchParams.set('offset', String(Math.max(0, intOffset - intLimit)));
      prevUrl.searchParams.set('limit', String(intLimit));

      const nextUrl = new URL(req.url);
      nextUrl.searchParams.set('offset', String(Math.min(formAtPath.length, intOffset + intLimit)));
      nextUrl.searchParams.set('limit', String(intLimit));

      const lastUrl = new URL(req.url);
      lastUrl.searchParams.set('offset', String(Math.max(0, formAtPath.length - intLimit)));
      lastUrl.searchParams.set('limit', String(intLimit));

      status = 200;
      json = {
        returned_items: embeds.length,
        total_items: formAtPath.length,
        offset: intOffset,
        limit: intLimit,
        _embedded: { 'fx:slice': embeds },
        _links: {
          first: { href: firstUrl.toString() },
          last: { href: lastUrl.toString() },
          prev: { href: prevUrl.toString() },
          next: { href: nextUrl.toString() },
          self: { href: req.url },
        },
      };
    } else {
      status = 200;
      json = { _links: { self: { href: req.url } }, ...formAtPath };
    }
  }

  if (req.method === 'POST') {
    const newItem = await req.json();
    const newForm = cloneDeep(el.form);
    const collection = get(newForm, path) as unknown[];
    const newIndex = collection.push(newItem) - 1;

    el.edit(newForm);

    const selfHrefPathname = ['form', ...path, String(newIndex)].map(encodeURIComponent).join('/');
    const selfHref = `foxy://${el.virtualHost}/${selfHrefPathname}`;

    status = 200;
    json = { _links: { self: { href: selfHref } }, message: 'Resource created successfully.' };
  }

  if (req.method === 'PATCH') {
    const newForm = cloneDeep(el.form);
    const newItem = { ...get(newForm, path), ...(await req.json()) };

    el.edit(set(newForm, path, newItem));

    status = 200;
    json = { _links: { self: { href: req.url } }, ...newItem };
  }

  if (req.method === 'DELETE') {
    const newForm = cloneDeep(el.form);
    const parent = get(newForm, path.slice(0, -1));

    Array.isArray(parent) ? pull(parent, get(newForm, path)) : unset(newForm, path);
    el.edit(newForm);

    status = 200;
    json = { _links: { self: { href: req.url } }, message: 'Resource deleted successfully.' };
  }

  return Promise.resolve(new Response(JSON.stringify(json), { status }));
}
