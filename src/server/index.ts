import './customer/index';
import './virtual/index';
import './admin/index';

import { router } from './router';

// if there's no handler, make a real request
router.all('*', ({ request }) => fetch(request));

export { DemoDatabase, db, whenDbReady } from './DemoDatabase';
export { router };
