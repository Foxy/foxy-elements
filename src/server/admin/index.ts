import { Collection, Table } from 'dexie';
import { DemoDatabase } from './DemoDatabase';
import { HALJSONResource } from '../../elements/public/NucleonElement/types';
import { Router } from 'service-worker-router';
import { composeCollection } from './composers/composeCollection';
import { composeCustomer } from './composers/composeCustomer';
import { composeCustomerAddress } from './composers/composeCustomerAddress';
import { composeCustomerAttribute } from './composers/composeCustomerAttribute';
import { composeDefaultPaymentMethod } from './composers/composeDefaultPaymentMethod';
import { composeErrorEntry } from './composers/composeErrorEntry';
import { composeItem } from './composers/composeItem';
import { composeSubscription } from './composers/composeSubscription';
import { composeTax } from './composers/composeTax';
import { composeTransaction } from './composers/composeTransaction';
import { composeUser } from './composers/composeUser';
import { getPagination } from './getPagination';

const endpoint = 'https://demo.foxycart.com/s/admin';
const router = new Router();
const db = new DemoDatabase();
const whenDbReady = db.open().then(() => DemoDatabase.fill(db.backendDB()));

export { endpoint, router, db, whenDbReady, DemoDatabase };

// subscriptions

router.get('/s/admin/stores/:id/subscriptions', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const searchParams = new URL(request.url).searchParams;
  const { limit, offset } = getPagination(url);

  let query = db.subscriptions.where('store').equals(id);

  const customer = parseInt(searchParams.get('customer_id') ?? '');
  if (!isNaN(customer)) query = db.subscriptions.where('customer').equals(customer);

  const [count, subscriptions] = await Promise.all([
    db.customerAttributes.count(),
    query.offset(offset).limit(limit).toArray(),
  ]);

  const embeddedLastTransactionBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('last_transaction')) {
        return db.transactions.where('subscription').equals(subscription.id).first();
      } else {
        return null;
      }
    })
  );

  const embeddedTransactionTemplateBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('transaction_template')) {
        return db.carts.get(subscription.transaction_template);
      } else {
        return null;
      }
    })
  );

  const embeddedItemsBySubscription = await Promise.all(
    subscriptions.map(async subscription => {
      if (searchParams.get('zoom')?.includes('items')) {
        return db.items.where('cart').equals(subscription.transaction_template).limit(20).toArray();
      } else {
        return [];
      }
    })
  );

  const items = subscriptions.map((subscription, index) => ({
    transactionTemplate: embeddedTransactionTemplateBySubscription[index],
    lastTransaction: embeddedLastTransactionBySubscription[index],
    items: embeddedItemsBySubscription[index],
    subscription,
  }));

  const composeItem = ({ subscription, items, lastTransaction, transactionTemplate }: any) => {
    return composeSubscription(subscription, lastTransaction, transactionTemplate, items);
  };

  const rel = 'fx:subscriptions';
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

// transactions
router.get('/s/admin/transactions/:id', async ({ params }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  const doc = await db.transactions.get(id);
  const body = composeTransaction(doc);
  return new Response(JSON.stringify(body));
});

router.get('/s/admin/stores/:id/transactions', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const searchParams = new URL(request.url).searchParams;
  let query = db.transactions.where('store').equals(id);

  const customer = parseInt(searchParams.get('customer_id') ?? '');
  if (!isNaN(customer)) query = db.transactions.where('customer').equals(customer);

  const [count, transactions] = await Promise.all([
    db.customerAttributes.count(),
    paginateQuery(query, getPagination(url)),
  ]);

  const embeddedItemsByTransaction = await Promise.all(
    transactions.map(async transaction => {
      if (searchParams.get('zoom')?.includes('items')) {
        return db.items.where('transaction').equals(transaction.id).limit(20).toArray();
      } else {
        return [];
      }
    })
  );

  const items = transactions.map((transaction, index) => ({
    transaction,
    items: embeddedItemsByTransaction[index],
  }));

  const composeItem = ({ transaction, items }: any) => {
    return composeTransaction(transaction, items);
  };

  const rel = 'fx:transactions';
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

// default_payment_method

router.get('/s/admin/customers/:id/default_payment_method', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const doc = await db.paymentMethods.where('customer').equals(id).first();
  const body = composeDefaultPaymentMethod(doc);

  return new Response(JSON.stringify(body));
});

router.delete('/s/admin/customers/:id/default_payment_method', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const doc = await db.paymentMethods.where('customer').equals(id).first();
  await db.paymentMethods.delete(doc.id);
  const body = composeDefaultPaymentMethod(doc);

  return new Response(JSON.stringify(body));
});

// items

router.get('/s/admin/items/:id', async ({ params }) => {
  return respondItemById(db.items, parseInt(params.id), composeItem);
});

// subscriptions

router.get('/s/admin/subscriptions/:id', async ({ params, request }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  const doc = await db.subscriptions.get(id);
  const lastTransaction = await getLastTransaction(request.url, id);
  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});

router.patch('/s/admin/subscriptions/:id', async ({ params, request }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  await db.subscriptions.update(id, await request.json());
  const doc = await db.subscriptions.get(id);
  const lastTransaction = await getLastTransaction(request.url, id);
  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});

// error_entries

router.get('/s/admin/stores/:id/error_entries', async ({ params, request }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  const url = request.url;
  const { limit, offset } = getPagination(url);
  const getErrorParam = new URL(request.url).searchParams.get('hide_error');
  const hideError: boolean | undefined =
    getErrorParam === null ? undefined : JSON.parse(getErrorParam);
  let count;
  let items;
  try {
    count = await db.errorEntries.count();
    if (hideError === undefined) {
      items = await db.errorEntries.where('store').equals(id).offset(offset).limit(limit).toArray();
    } else {
      items = await db.errorEntries
        .where('store')
        .equals(id)
        .and(r => r.hide_error === hideError)
        .offset(offset)
        .limit(limit)
        .toArray();
    }
    const rel = 'fx:error_entries';
    const composeItem = composeErrorEntry;
    const body = composeCollection({ composeItem, rel, url, count, items });
    return new Response(JSON.stringify(body));
  } catch (e) {
    console.log('There was an error', e);
  }
});

router.get('/s/admin/error_entries/:id', async ({ params }) => {
  await whenDbReady;
  const errorEntry = await db.errorEntries.get(parseInt(params.id));
  const body = composeErrorEntry(errorEntry);
  return new Response(JSON.stringify(body));
});

router.patch('/s/admin/error_entries/:id', async ({ params, request }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  await db.errorEntries.update(id, await request.json());
  const body = composeErrorEntry(await db.errorEntries.get(id));
  return new Response(JSON.stringify(body));
});

/**
 * @param url
 * @param id
 */
async function getLastTransaction(url: string, id: number) {
  const zoom = new URL(url).searchParams.get('zoom') ?? '';
  return zoom.includes('last_transaction')
    ? await db.transactions.where('subscription').equals(id).last()
    : null;
}

// customer_attributes

router.get('/s/admin/customers/:id/attributes', async ({ params, request }) => {
  await whenDbReady;
  const id = parseInt(params.id);
  const url = request.url;
  const [count, items] = await Promise.all([
    db.customerAttributes.count(),
    paginateQuery(db.customerAttributes.where('customer').equals(id), getPagination(url)),
  ]);
  const rel = 'fx:attributes';
  const composeItem = composeCustomerAttribute;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

router.get('/s/admin/customer_attributes/:id', async ({ params }) => {
  return respondItemById(db.customerAttributes, parseInt(params.id), composeCustomerAttribute);
});

router.post('/s/admin/customers/:id/attributes', async ({ params, request }) => {
  await whenDbReady;

  const requestBody = await request.json();
  const newID = await db.customerAttributes.add({
    name: requestBody.name ?? '',
    value: requestBody.value ?? '',
    customer: parseInt(params.id),
    visibility: requestBody.visibility ?? 'private',
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  });

  const newDoc = await db.customerAttributes.get(newID);
  const responseBody = composeCustomerAttribute(newDoc);

  return new Response(JSON.stringify(responseBody));
});

router.patch('/s/admin/customer_attributes/:id', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  await db.customerAttributes.update(id, await request.json());
  const body = composeCustomerAttribute(await db.customerAttributes.get(id));

  return new Response(JSON.stringify(body));
});

router.delete('/s/admin/customer_attributes/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomerAttribute(await db.customerAttributes.get(id));
  await db.customerAttributes.delete(id);

  return new Response(JSON.stringify(body));
});

// customer_addresses

router.get('/s/admin/customers/:id/addresses', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const [count, items] = await queryCountAndWhere(
    db.customerAddresses,
    'customer',
    id,
    getPagination(url)
  );

  const rel = 'fx:customer_addresses';
  const composeItem = composeCustomerAddress;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

router.post('/s/admin/customers/:id/addresses', async ({ params, request }) => {
  await whenDbReady;

  const customer = await db.customers.get(parseInt(params.id));
  const requestBody = await request.json();
  const newID = await db.customerAddresses.add({
    address1: requestBody.address1,
    address2: requestBody.address2 ?? '',
    address_name: requestBody.address_name ?? '',
    city: requestBody.city ?? '',
    company: requestBody.company ?? '',
    country: requestBody.country ?? '',
    customer: customer.id,
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
    first_name: requestBody.first_name ?? '',
    ignore_address_restrictions: requestBody.ignore_address_restrictions ?? false,
    is_default_billing: requestBody.is_default_billing ?? false,
    is_default_shipping: requestBody.is_default_shipping ?? false,
    last_name: requestBody.last_name ?? '',
    phone: requestBody.phone ?? '',
    postal_code: requestBody.postal_code ?? '',
    region: requestBody.region ?? '',
    store: customer.store,
  });

  const newDoc = await db.customerAddresses.get(newID);
  const responseBody = composeCustomerAddress(newDoc);

  return new Response(JSON.stringify(responseBody));
});

router.get('/s/admin/customer_addresses/:id', async ({ params }) => {
  return respondItemById(db.customerAddresses, parseInt(params.id), composeCustomerAddress);
});

router.patch('/s/admin/customer_addresses/:id', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  await db.customerAddresses.update(id, await request.json());
  const body = composeCustomerAddress(await db.customerAddresses.get(id));

  return new Response(JSON.stringify(body));
});

router.delete('/s/admin/customer_addresses/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomerAddress(await db.customerAddresses.get(id));
  await db.customerAddresses.delete(id);

  return new Response(JSON.stringify(body));
});

// customers

router.get('/s/admin/stores/:id/customers', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const [count, items] = await queryCountAndWhere(db.customers, 'store', id, getPagination(url));
  const rel = 'fx:customers';
  const composeItem = composeCustomer;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

// customer

router.get('/s/admin/customers/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomer(
    await db.customers.get(id),
    await db.customerAttributes.where('customer').equals(id).limit(20).toArray()
  );

  return new Response(JSON.stringify(body));
});

router.patch('/s/admin/customers/:id', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  await db.customers.update(id, await request.json());
  const body = composeCustomer(await db.customers.get(id));

  return new Response(JSON.stringify(body));
});

router.delete('/s/admin/customers/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomer(await db.customers.get(id));
  await db.customers.delete(id);

  return new Response(JSON.stringify(body));
});

// users
router.get('/s/admin/stores/:id/users', async ({ params, request }) => {
  const id = parseInt(params.id);
  const url = request.url;
  const { limit, offset } = getPagination(url);
  const [count, items] = await Promise.all([
    db.users.count(),
    db.users.where('store').equals(id).offset(offset).limit(limit).toArray(),
  ]);
  await whenDbReady;
  const rel = 'fx:users';
  const body = composeCollection({ composeItem: composeUser, rel, url, count, items });
  return new Response(JSON.stringify(body));
});

router.get('/s/admin/users/:id', async ({ params }) => {
  await whenDbReady;
  const user = await db.users.get(parseInt(params.id));
  const body = composeUser(user);
  return new Response(JSON.stringify(body));
});

// taxes

router.get('/s/admin/stores/:storeId/taxes/:id', async ({ params }) => {
  return respondItemById(db.taxes, parseInt(params.id), composeTax);
});

router.get('/s/admin/stores/:id/taxes', async ({ request }) => {
  return respondItems(db.taxes, composeTax, request.url, 'fx:taxes');
});

/**
 * Returns a response object with the composed entry for the given id in the given table.
 *
 * @param table the Dixie table storing the data
 * @param id the id number to be fetched
 * @param composer the function to be used to compose the response into a HAL Resource
 * @returns response promise
 */
async function respondItemById(
  table: Table,
  id: number,
  composer: (d: any) => HALJSONResource
): Promise<Response> {
  await whenDbReady;
  const body = composer(await table.get(id));
  return new Response(JSON.stringify(body));
}

/**
 * Creates a response with the composed entries for the given
 * table.
 *
 * @param table the Dixie table storing the data
 * @param composer the function to be used to compose the response into a HAL Resource
 * @param url the requested url
 * @param rel the rel string
 * @param parent the field to use to filter the items by parentID
 * @param parentId the id number to be fetched
 * @returns response promise
 */
async function respondItems(
  table: Table,
  composer: (d: any) => HALJSONResource,
  url: string,
  rel: string,
  parent = 'store',
  parentId = '0'
) {
  const [count, items] = await queryCountAndWhere(table, parent, parentId, getPagination(url));
  const body = composeCollection({ composeItem: composer, rel, url, count, items });
  return new Response(JSON.stringify(body));
}

/**
 * @param table
 * @param field
 * @param value
 * @param pagination
 */
function queryCountAndWhere(
  table: Table,
  field: string,
  value: string | number,
  pagination = { limit: 10, offset: 0 }
) {
  return Promise.all([table.count(), paginateQuery(table.where(field).equals(value), pagination)]);
}

/**
 * @param query
 * @param pagination
 */
function paginateQuery(query: Collection<any, any>, pagination = { limit: 20, offset: 0 }) {
  return query.offset(pagination.offset).limit(pagination.limit).toArray();
}

// special routes

router.get('/s/admin/not-found', async () => new Response(null, { status: 404 }));

router.get('/s/admin/sleep', () => new Promise(() => void 0));

// catch-all

router.all('*', async () => new Response(null, { status: 500 }));
