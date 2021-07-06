import { DemoDatabase, db, whenDbReady } from '../DemoDatabase';

import { router } from './router';

const endpoint = 'https://demo.foxycart.com/s/customer';

export { endpoint, router, db, whenDbReady, DemoDatabase };
