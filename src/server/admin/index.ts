import { DemoDatabase } from './DemoDatabase';
import { Router } from 'service-worker-router';
import { composeCollection } from './composers/composeCollection';
import { composeCustomer } from './composers/composeCustomer';
import { composeCustomerAddress } from './composers/composeCustomerAddress';
import { composeCustomerAttribute } from './composers/composeCustomerAttribute';
import { composeDefaultPaymentMethod } from './composers/composeDefaultPaymentMethod';
import { composeItem } from './composers/composeItem';
import { composeSubscription } from './composers/composeSubscription';
import { composeTransaction } from './composers/composeTransaction';
import { getPagination } from './getPagination';

const endpoint = 'https://demo.foxycart.com/s/admin';
const router = new Router();
const db = new DemoDatabase();
const whenDbReady = db.open().then(() => DemoDatabase.fill(db.backendDB()));

export { endpoint, router };

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
    query.limit(limit).offset(offset).toArray(),
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

router.get('/s/admin/stores/:id/transactions', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const searchParams = new URL(request.url).searchParams;
  const { limit, offset } = getPagination(url);

  let query = db.transactions.where('store').equals(id);

  const customer = parseInt(searchParams.get('customer_id') ?? '');
  if (!isNaN(customer)) query = db.transactions.where('customer').equals(customer);

  const [count, transactions] = await Promise.all([
    db.customerAttributes.count(),
    query.limit(limit).offset(offset).toArray(),
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
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeItem(await db.items.get(id));

  return new Response(JSON.stringify(body));
});

// subscriptions

router.get('/s/admin/subscriptions/:id', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const doc = await db.subscriptions.get(id);
  const zoom = new URL(request.url).searchParams.get('zoom') ?? '';
  const lastTransaction = zoom.includes('last_transaction')
    ? await db.transactions.get(doc.last_transaction)
    : null;

  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});

router.patch('/s/admin/subscriptions/:id', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  await db.subscriptions.update(id, await request.json());

  const doc = await db.subscriptions.get(id);
  const zoom = new URL(request.url).searchParams.get('zoom') ?? '';
  const lastTransaction = zoom.includes('last_transaction')
    ? await db.transactions.get(doc.last_transaction)
    : null;

  const body = composeSubscription(doc, lastTransaction);
  return new Response(JSON.stringify(body));
});

// customer_attributes

router.get('/s/admin/customers/:id/attributes', async ({ params, request }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const url = request.url;
  const { limit, offset } = getPagination(url);
  const [count, items] = await Promise.all([
    db.customerAttributes.count(),
    db.customerAttributes.where('customer').equals(id).limit(limit).offset(offset).toArray(),
  ]);

  const rel = 'fx:attributes';
  const composeItem = composeCustomerAttribute;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

router.get('/s/admin/customer_attributes/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomerAttribute(await db.customerAttributes.get(id));

  return new Response(JSON.stringify(body));
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
  const { limit, offset } = getPagination(url);
  const [count, items] = await Promise.all([
    db.customerAddresses.count(),
    db.customerAddresses.where('customer').equals(id).limit(limit).offset(offset).toArray(),
  ]);

  const rel = 'fx:customer_addresses';
  const composeItem = composeCustomerAddress;
  const body = composeCollection({ composeItem, rel, url, count, items });

  return new Response(JSON.stringify(body));
});

router.get('/s/admin/customer_addresses/:id', async ({ params }) => {
  await whenDbReady;

  const id = parseInt(params.id);
  const body = composeCustomerAddress(await db.customerAddresses.get(id));

  return new Response(JSON.stringify(body));
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

// special routes

router.get('/s/admin/not-found', async () => new Response(null, { status: 404 }));

router.get('/s/admin/sleep', () => new Promise(() => void 0));

// catch-all

router.all('*', async () => new Response(null, { status: 500 }));
