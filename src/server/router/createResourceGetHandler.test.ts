import type { HandleResult, Router } from 'service-worker-router';

import { createRouter } from '../hapi/index';
import { expect } from '@open-wc/testing';

type ResponseBody = {
  _embedded?: Record<string, unknown>;
  _links: { self: { href: string } };
};

const base = 'https://demo.api/hapi';

function get(router: Router, url: string): Promise<ResponseBody> {
  const result = router.handleRequest(new Request(url)) as HandleResult;
  return result.handlerPromise.then(response => response.json());
}

describe('createResourceGetHandler', () => {
  it('gives each of two overlapping requests for one resource its own _links', async () => {
    const zoomedURL = `${base}/customers/0?zoom=attributes`;
    const plainURL = `${base}/customers/0`;
    const router = createRouter();

    // Both requests are dispatched before either is awaited, so the second one runs while the
    // first is still resolving its embeds.
    const whenZoomed = get(router, zoomedURL);
    const whenPlain = get(router, plainURL);
    const [zoomed, plain] = await Promise.all([whenZoomed, whenPlain]);

    expect(zoomed._links.self).to.have.property('href', zoomedURL);
    expect(plain._links.self).to.have.property('href', plainURL);
  });

  it('does not leave _embedded from a zoomed request on a later plain request', async () => {
    const router = createRouter();

    const zoomed = await get(router, `${base}/customers/0?zoom=attributes`);
    const plain = await get(router, `${base}/customers/0`);

    expect(zoomed._embedded).to.have.property('fx:attributes');
    expect(plain).to.not.have.property('_embedded');
  });
});
