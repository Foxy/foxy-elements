import halson from 'halson';
import { router } from '../router';

router.get('/s/virtual/session', async ({ request }) => {
  const body = halson({
    type: 'password',
    credential: { email: 'sally.sims@example.com', password: '3i74uylOIUB&*21?' },
  });

  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.post('/s/virtual/session', async ({ request }) => {
  const body = halson(await request.json());
  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.patch('/s/virtual/session', async ({ request }) => {
  const json = await request.json();
  const body = halson({
    type: 'password',
    credential: {
      email: json.detail?.email ?? 'sally.sims@example.com',
      password: json.detail?.password ?? '',
    },
  });

  body.addLink('self', request.url);
  return new Response(JSON.stringify(body));
});

router.delete('/s/virtual/session', async () => new Response());
