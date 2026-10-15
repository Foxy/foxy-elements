import { expect } from '@open-wc/testing';

import { isAccessDenied } from './is-access-denied';

const vndError = (...messages: string[]) =>
  JSON.stringify({
    total: messages.length,
    _embedded: { 'fx:errors': messages.map((message, i) => ({ logref: `id-${i}`, message })) },
  });

const READ =
  'The current authenticated user does not appear to have read permission for customer resource.';
const WRITE =
  'The current authenticated user does not appear to have write permission for transaction resource.';
const RESEND =
  'The current authenticated user does not appear to have resend permission for email resource.';
const ZOOMED =
  'The current authenticated user does not appear to have read permission for zoomed customer resource.';
const SNAKE =
  'The current authenticated user does not appear to have read permission for customer_address resource.';

// Near-miss messages from other AccessDeniedException call sites. These are 401 +
// fx:errors too, so only the message keeps them out.
const STORE_ACCESS =
  'The current authenticated user does not appear to have access to this resource.';
const REVOKED = 'The current authenticated user no longer has access to this store.';
const WRONG_STORE = 'The current token does not have access to this resource.';
const NO_USER =
  'You must first create a user and be authenticated as that user before you can create a store.';

describe('isAccessDenied', () => {
  it('detects a read permission denial', async () => {
    expect(await isAccessDenied(new Response(vndError(READ), { status: 401 }))).to.be.true;
  });

  it('detects write and resend permission denials', async () => {
    expect(await isAccessDenied(new Response(vndError(WRITE), { status: 401 }))).to.be.true;
    expect(await isAccessDenied(new Response(vndError(RESEND), { status: 401 }))).to.be.true;
  });

  it('detects a denial on a zoomed resource', async () => {
    expect(await isAccessDenied(new Response(vndError(ZOOMED), { status: 401 }))).to.be.true;
  });

  it('detects a denial for a snake_case resource name', async () => {
    expect(await isAccessDenied(new Response(vndError(SNAKE), { status: 401 }))).to.be.true;
  });

  it('detects a denial reported as 403', async () => {
    expect(await isAccessDenied(new Response(vndError(READ), { status: 403 }))).to.be.true;
  });

  it('detects a denial listed after an unrelated error', async () => {
    expect(await isAccessDenied(new Response(vndError(WRONG_STORE, READ), { status: 401 }))).to.be
      .true;
  });

  it('rejects other authorization failures that share the response shape', async () => {
    for (const message of [STORE_ACCESS, REVOKED, WRONG_STORE, NO_USER]) {
      const response = new Response(vndError(message), { status: 401 });
      expect(await isAccessDenied(response), message).to.be.false;
    }
  });

  it('rejects an expired or missing token', async () => {
    const body = JSON.stringify({ error: 'invalid_token', error_description: 'expired' });
    expect(await isAccessDenied(new Response(body, { status: 401 }))).to.be.false;
  });

  it('rejects statuses that are not 401 or 403', async () => {
    expect(await isAccessDenied(new Response(vndError(READ), { status: 500 }))).to.be.false;
    expect(await isAccessDenied(new Response(vndError(READ), { status: 404 }))).to.be.false;
  });

  it('rejects unparseable and empty bodies', async () => {
    expect(await isAccessDenied(new Response('not json', { status: 401 }))).to.be.false;
    expect(await isAccessDenied(new Response(null, { status: 401 }))).to.be.false;
    expect(await isAccessDenied(new Response('null', { status: 401 }))).to.be.false;
  });

  it('leaves the response body readable by the caller', async () => {
    const response = new Response(vndError(READ), { status: 401 });

    expect(await isAccessDenied(response)).to.be.true;
    expect(response.bodyUsed).to.be.false;

    const body = await response.json();
    expect(body._embedded['fx:errors'][0].message).to.equal(READ);
  });
});
