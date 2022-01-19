# Demo Server

This is an experimental technology that we use to test our elements and demo them in Storybook. Every time an element makes a request, it sends out a DOM event of type `fetch`. Our demo server listens to those events, cancels the network calls and responds to them locally. This concept is also explained in the [NucleonElement docs](https://elements.foxy.dev/?path=/story/other-nucleon--page) under Request Interception.

Since demo server is more of an internal tool than a product we'd offer to our customers, we can't spend too much time on making it perfect. We don't write docs or tests for it, we don't care if it doesn't behave exactly like hAPI in every scenario, and we don't enforce type safety or style guidelines in its code. The following endpoints are available so far:

## `https://demo.api/hapi`

Demo hAPI is a lot like [hAPI](https://api.foxy.io), but with half (third? quarter?) of the functionality and no authentication. We use it to demo and test individual elements like cards and forms. Resource links are largely the same, but the URLs are different, and the properties might include identifiers that aren't present in the real API.

Collections are available at `https://demo.api/hapi/:collection` (GET, POST), individual resources at `https://demo.api/hapi/:collection/:id` (GET, PATCH, DELETE). Equality filters, `limit`, `offset` and `zoom` query parameters are also supported. Examples:

```text
GET  https://demo.api/hapi/customers - lists all customers
GET  https://demo.api/hapi/customers?zoom=default_payment_method - same as above, but with an embedded payment method

GET  https://demo.api/hapi/customers?store_id=0 - lists all customers in a store with id 0
GET  https://demo.api/hapi/customers?store_id=0&limit=5 - same as above, but limited to 5 results per page

GET  https://demo.api/hapi/customers/0 - returns a single customer with id 0
GET  https://demo.api/hapi/customers/0?zoom=default_payment_method - same as above, but with an embedded payment method

POST https://demo.api/hapi/customers?store_id=0 - creates a customer within the store 0
```

To see what collections and resources are available, take a look at [`createDataset.ts`](../src/server/hapi/createDataset.ts). Resource links are stored in [`links.ts`](../src/server/hapi/links.ts). Functions in that record are called with the document properties as their one and only parameter and return the contents of `_links`. Resource templates are in [`defaults.ts`](../src/server/hapi/defaults.ts), where functions accept the search query from the POST URL. This way we can link resources between each other on creation in a uniform way. To add support for a new collection to the demo server, you'll need to edit these 3 files.

## `https://demo.api/portal`

Demo Portal API is built on top of the Demo hAPI and works a lot like [the real one](https://wiki.foxycart.com/v/2.0/customer_portal) with `FOXY-API-VERSION` header set to `1`. Auth is included, but not always enforced. The URL format is similar to the real API, but doesn't match it exactly. Responses may include extra properties (type definitions will help you avoid them). We use this API to demo and test our latest Customer Portal.

You can access every resource from Demo hAPI + a number of special routes listed below:

```text
POST   https://demo.api/portal/authenticate - logs customer in
DELETE https://demo.api/portal/authenticate - logs customer out

POST   https://demo.api/portal/forgot_password - requests a temporary password

GET    https://demo.api/portal - returns current customer
PATCH  https://demo.api/portal - updates current customer
```

Links for Demo Portal API are stored in [`links.ts`](../src/server/portal/links.ts), everything else is borrowed from the Demo hAPI. You shouldn't need to change these files unless you're fixing a bug.

## `https://demo.api/virtual`

Demo-only API endpoints that don't have a real counterpart. We use them to fail or stall requests on purpose as well as to demo and test elements that implement a universal authentication protocol (e.g. `foxy-sign-in-form`):

```text
POST   https://demo.api/virtual/recovery - UAP endpoint for password reset

POST   https://demo.api/virtual/session - UAP endpoint for logging in, always succeeds
POST   https://demo.api/virtual/session?code=unknown_error - same as above but errors with the requested code
DELETE https://demo.api/virtual/session - UAP endpoint for logging out

GET    https://demo.api/hapi/stall - never responds
GET    https://demo.api/hapi/empty?status=200 - sends back an empty response with the requested status code
```

## Using Demo Server in Tests

To use demo server in your tests, route all requests through it like in the example below:

```ts
import './index';

import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { getTestData } from '../../../utils/getTestData';
import { createRouter } from '../../../server/index';
import { CustomFieldForm } from './CustomFieldForm';

it('loads data from the URL', async () => {
  const router = createRouter();
  const url = 'https://demo.api/hapi/custom_fields/0';
  const serve = (evt: FetchEvent) => router.handleEvent(evt);
  const layout = html`<foxy-custom-field-form @fetch=${serve}></foxy-custom-field-form>`;
  const element = await fixture<CustomFieldForm>(layout);

  element.href = url;
  await waitUntil(() => !!element.data);

  expect(element.data).to.deep.equal(await getTestData(url));
});
```
