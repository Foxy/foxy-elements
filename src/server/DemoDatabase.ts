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

  customerPortalSettings: Dexie.Table<any, number>;

  customerAttributes: Dexie.Table<any, number>;

  customerAddresses: Dexie.Table<any, number>;

  paymentMethods: Dexie.Table<any, number>;

  subscriptions: Dexie.Table<any, number>;

  transactions: Dexie.Table<any, number>;

  errorEntries: Dexie.Table<any, number>;

  customers: Dexie.Table<any, number>;

  stores: Dexie.Table<any, number>;

  items: Dexie.Table<any, number>;

  carts: Dexie.Table<any, number>;

  users: Dexie.Table<any, number>;

  constructor() {
    super('foxy_demo_db');

    this.version(5).stores({
      customer_portal_settings: 'store',
      customer_attributes: '++id,customer',
      customer_addresses: '++id,customer',
      payment_methods: '++id,customer',
      subscriptions: '++id,store,customer',
      transactions: '++id,store,customer,subscription',
      error_entries: '++id',
      customers: '++id,store,email',
      stores: '++id',
      items: '++id,cart,transaction',
      carts: '++id',
      users: '++id,store',
    });

    this.customerPortalSettings = this.table('customer_portal_settings');
    this.customerAttributes = this.table('customer_attributes');
    this.customerAddresses = this.table('customer_addresses');
    this.paymentMethods = this.table('payment_methods');
    this.subscriptions = this.table('subscriptions');
    this.transactions = this.table('transactions');
    this.errorEntries = this.table('error_entries');
    this.customers = this.table('customers');
    this.stores = this.table('stores');
    this.items = this.table('items');
    this.carts = this.table('carts');
    this.users = this.table('users');
  }
}

const db = new DemoDatabase();
const whenDbReady = db.open().then(() => DemoDatabase.fill(db.backendDB()));

export { db, whenDbReady, DemoDatabase };
