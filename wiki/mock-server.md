# Mock Server

This is an experimental technology that we use to test our elements and demo them in Storybook. In essence, every time an element makes a request, it sends out a DOM event of type `fetch`. Our mock server listens to those events, cancels the network calls and responds to them with the data from IndexedDB. Refreshing the page resets the database. This concept is also explained in the [NucleonElement docs](https://elements.foxy.dev/?path=/story/other-nucleon--page) under Request Interception.

Since mock server is more of an internal tool than a product we'd offer to our customers, we can't spend too much time on making it perfect. We don't write docs or tests for it, we don't care if it doesn't behave exactly like hAPI in every scenario, and we don't enforce type safety or style guidelines in its code. The following endpoints are available so far:

## Customer API

Mock Customer API works a lot like [the real one](https://wiki.foxycart.com/v/2.0/customer_portal) with `FOXY-API-VERSION` header set to `1`. It has the authentication and the URL format is exactly the same. We use it to demo and test our latest Customer Portal:

```text
https://demo.foxycart.com/s/customer/authenticate POST, DELETE
https://demo.foxycart.com/s/customer/addresses/0 GET, PATCH, DELETE
https://demo.foxycart.com/s/customer/addresses GET
https://demo.foxycart.com/s/customer/customer_portal_settings GET
https://demo.foxycart.com/s/customer/default_payment_method GET
https://demo.foxycart.com/s/customer/forgot_password POST
https://demo.foxycart.com/s/customer GET, PATCH
https://demo.foxycart.com/s/customer/subscriptions/0 GET, PATCH
https://demo.foxycart.com/s/customer/subscriptions GET
https://demo.foxycart.com/s/customer/transactions GET
```

## Backend API

Mock Backend API is like [hAPI](https://api.foxycart.com), but with half (third? quarter?) of the functionality and no authentication. We use it to demo and test individual elements like cards and forms:

```text
https://demo.foxycart.com/s/admin/customers/0/default_payment_method GET, DELETE
https://demo.foxycart.com/s/admin/customers/0/attributes GET, POST
https://demo.foxycart.com/s/admin/customers/0/addresses GET, POST

https://demo.foxycart.com/s/admin/stores/0/subscriptions GET
https://demo.foxycart.com/s/admin/stores/0/error_entries GET
https://demo.foxycart.com/s/admin/stores/0/transactions GET
https://demo.foxycart.com/s/admin/stores/0/customers GET, PATCH, DELETE
https://demo.foxycart.com/s/admin/stores/0/users GET, POST

https://demo.foxycart.com/s/admin/transactions/0 GET
https://demo.foxycart.com/s/admin/transactions/0/custom_fields GET, POST

https://demo.foxycart.com/s/admin/customer_attributes/0 GET, PATCH, DELETE
https://demo.foxycart.com/s/admin/customer_addresses/0 GET, PATCH, DELETE
https://demo.foxycart.com/s/admin/subscriptions/0 GET, PATCH
https://demo.foxycart.com/s/admin/error_entries/0 GET, PATCH
https://demo.foxycart.com/s/admin/custom_fields/0 GET, PATCH, DELETE
https://demo.foxycart.com/s/admin/items/0 GET
https://demo.foxycart.com/s/admin/users/0 GET, PATCH, DELETE
```

## Other

Demo-only API endpoints that don't have a real counterpart. We use them to fail or stall requests on purpose as well as to demo and test elements that implement a universal authentication protocol (e.g. `foxy-sign-in-form`):

```text
https://demo.foxycart.com/s/customer/not-found GET
https://demo.foxycart.com/s/customer/sleep GET

https://demo.foxycart.com/s/virtual/recovery GET, POST, PATCH, DELETE
https://demo.foxycart.com/s/virtual/session GET, POST, DELETE

https://demo.foxycart.com/s/admin/not-found GET
https://demo.foxycart.com/s/admin/sleep GET
```

If you need to add a new endpoint for a hAPI resource, ask @pheekus for help or try to replicate the approach in `src/server`. A few pointers to get you started: we use [Dexie](https://dexie.org) to query IndexedDB in [DemoDatabase.ts](../src/server/DemoDatabase.ts), the dataset is in [dump.json](../src/server/dump.json), and the routing is handled with [service-worker-router](https://github.com/berstend/service-worker-router).

## Using Mock Server in Tests

To use mock server in your tests, route all requests through it like in the example below:

```ts
import './index';

import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { getTestData } from '../../../utils/getTestData';
import { router } from '../../../server';
import { CustomFieldForm } from './CustomFieldForm';

it('loads data from the URL', async () => {
  const url = 'https://demo.foxycart.test/s/admin/custom_fields/0';
  const serve = (evt: FetchEvent) => router.handleEvent(evt);
  const layout = html`<foxy-custom-field-form @fetch=${serve}></foxy-custom-field-form>`;
  const element = await fixture<CustomFieldForm>(layout);

  element.href = url;
  await waitUntil(() => !!element.data);

  expect(element.data).to.deep.equal(await getTestData(url));
});
```
