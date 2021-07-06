import halson from 'halson';
import { router } from '../router';

router.get('/s/virtual/recovery', async ({ request }) => {
  const body = halson({ type: 'email', detail: { email: 'sally.sims@example.com' } });
  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.post('/s/virtual/recovery', async ({ request }) => {
  const body = halson(await request.json());
  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.patch('/s/virtual/recovery', async ({ request }) => {
  const json = await request.json();
  const body = halson({
    type: 'email',
    detail: { email: json.detail?.email ?? 'sally.sims@example.com' },
  });

  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.delete('/s/virtual/recovery', async () => new Response());
