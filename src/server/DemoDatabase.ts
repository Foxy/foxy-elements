import Dexie from 'dexie';
import IDBExportImport from 'indexeddb-export-import';
import dump from './dump.json';

class DemoDatabase extends Dexie {
  static async fill(db: IDBDatabase): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      IDBExportImport.clearDatabase(db, (err: unknown) => {
        if (err) return reject(err);
        IDBExportImport.importFromJsonString(db, JSON.stringify(dump), (err: unknown) => {
          return err ? reject(err) : resolve();
        });
      });
    });
  }

  carts: Dexie.Table<any, number>;

  cartTemplates: Dexie.Table<any, number>;

  cartIncludeTemplates: Dexie.Table<any, number>;

  checkoutTemplates: Dexie.Table<any, number>;

  customerAddresses: Dexie.Table<any, number>;

  customerAttributes: Dexie.Table<any, number>;

  customerPortalSettings: Dexie.Table<any, number>;

  customers: Dexie.Table<any, number>;

  emailTemplates: Dexie.Table<any, number>;

  errorEntries: Dexie.Table<any, number>;

  items: Dexie.Table<any, number>;

  paymentMethods: Dexie.Table<any, number>;

  receiptTemplates: Dexie.Table<any, number>;

  stores: Dexie.Table<any, number>;

  subscriptions: Dexie.Table<any, number>;

  transactions: Dexie.Table<any, number>;

  users: Dexie.Table<any, number>;

  constructor() {
    super('foxy_demo_db');

    this.version(5).stores({
      cart_include_templates: '++id,store',
      cart_templates: '++id,store',
      carts: '++id',
      checkout_templates: '++id,store',
      customer_addresses: '++id,customer',
      customer_attributes: '++id,customer',
      customer_portal_settings: 'store',
      customers: '++id,store',
      email_templates: '++id,store',
      error_entries: '++id',
      items: '++id,cart,transaction',
      payment_methods: '++id,customer',
      receipt_templates: '++id,store',
      stores: '++id',
      subscriptions: '++id,store,customer',
      transactions: '++id,store,customer,subscription',
      users: '++id,store',
    });

    this.cartIncludeTemplates = this.table('cart_include_templates');
    this.cartTemplates = this.table('cart_templates');
    this.carts = this.table('carts');
    this.checkoutTemplates = this.table('checkout_templates');
    this.customerAddresses = this.table('customer_addresses');
    this.customerAttributes = this.table('customer_attributes');
    this.customerPortalSettings = this.table('customer_portal_settings');
    this.customers = this.table('customers');
    this.emailTemplates = this.table('email_templates');
    this.errorEntries = this.table('error_entries');
    this.items = this.table('items');
    this.paymentMethods = this.table('payment_methods');
    this.receiptTemplates = this.table('receipt_templates');
    this.stores = this.table('stores');
    this.subscriptions = this.table('subscriptions');
    this.transactions = this.table('transactions');
    this.users = this.table('users');
  }
}

const db = new DemoDatabase();
const whenDbReady = db.open().then(() => DemoDatabase.fill(db.backendDB()));

export { db, whenDbReady, DemoDatabase };
