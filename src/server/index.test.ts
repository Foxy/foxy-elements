import type { HandleResult } from 'service-worker-router';

import { createRouter } from './index';
import { expect } from '@open-wc/testing';
import { isAccessDenied } from '../utils/is-access-denied';

function send(url: string, init?: RequestInit): Promise<Response> {
  const result = createRouter().handleRequest(new Request(url, init)) as HandleResult;
  return result.handlerPromise;
}

describe('server', () => {
  it('answers /virtual/denied with a scope denial', async () => {
    const response = await send('https://demo.api/virtual/denied?type=write&rel=coupon');

    expect(response.status).to.equal(401);
    expect(await isAccessDenied(response)).to.be.true;
  });

  it('serves reads through /read-only from the path after the prefix', async () => {
    const response = await send('https://demo.api/read-only/hapi/customers/0');
    const body = await response.json();

    expect(response.status).to.equal(200);
    expect(body).to.have.property('email');
  });

  it('denies every write through /read-only', async () => {
    for (const method of ['POST', 'PATCH', 'PUT', 'DELETE']) {
      const response = await send('https://demo.api/read-only/hapi/customers/0', {
        method,
        body: method === 'DELETE' ? undefined : '{}',
      });

      expect(response.status, method).to.equal(401);
      expect(await isAccessDenied(response), method).to.be.true;
    }
  });
});
