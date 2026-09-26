import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import { groups } from './web-test-runner.groups.js';

import webServerConfig from './web-dev-server.config.js';

export default Object.assign({}, webServerConfig, {
  browserLogs: false,

  browsers: [
    puppeteerLauncher({
      // Test pages run as concurrent tabs, and a browser produces no frames for a tab that is not
      // the visible one. Anything waiting on a frame - `nextFrame()`, `elementUpdated()` on a
      // non-Lit element, Vaadin's own internals - then never settles and the test times out.
      // Focus emulation makes every page behave as the focused one, so frames keep coming.
      createPage: async ({ context }) => {
        const page = await context.newPage();

        try {
          const session = await page.target().createCDPSession();
          await session.send('Emulation.setFocusEmulationEnabled', { enabled: true });
        } catch {
          // Older or non-Chromium browsers may not support it. Frame-dependent tests can time out
          // when that happens, but the run still starts, which beats failing every file.
        }

        return page;
      },

      launchOptions: {
        executablePath: process.env.CHROME_PATH || '/usr/bin/chromium',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    }),
  ],

  groups,

  testsFinishTimeout: 600000, // 10 minutes

  testFramework: {
    config: {
      timeout: '20000',
    },
  },

  // `ResponsiveMixin` sets breakpoint attributes on the element it observes, so the resize it
  // reacts to can produce another one in the same delivery cycle. The browser then reports
  // "ResizeObserver loop completed with undelivered notifications" - a notice, not an application
  // error, since the pending notification is delivered on the next frame. It arrives at
  // `window.onerror`, where the test framework counts it against whichever test is running, so
  // drop it before that handler sees it. This classic script runs before the module below.
  //
  // Match the full message, not the "ResizeObserver loop" prefix: "ResizeObserver loop limit
  // exceeded" starts the same way but means the browser gave up on a runaway loop, which is a
  // real bug and must still fail the test.
  testRunnerHtml: testFramework => `
    <!DOCTYPE html>
    <html>
      <head>
        <script>
          window.addEventListener(
            'error',
            event => {
              var benign = 'ResizeObserver loop completed with undelivered notifications';
              if (event.message && event.message.indexOf(benign) === 0) {
                event.stopImmediatePropagation();
                event.preventDefault();
              }
            },
            true
          );
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,

  middleware: [
    (context, next) => {
      const url = context.url;
      const prefix = '/src/mocks';
      if (url.startsWith('/translations')) context.url = `${prefix}${url}`;
      return next();
    },
  ],
});
