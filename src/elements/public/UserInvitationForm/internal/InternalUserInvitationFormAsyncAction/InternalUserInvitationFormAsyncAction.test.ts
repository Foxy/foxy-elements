import type { FetchEvent } from '../../../NucleonElement/FetchEvent';

import '../../../NucleonElement/index';
import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalUserInvitationFormAsyncAction as Control } from './InternalUserInvitationFormAsyncAction';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { createRouter } from '../../../../../server/index';
import { getTestData } from '../../../../../testgen/getTestData';
import { createAccessDeniedResponse } from '../../../../../utils/test-utils';
import { spy } from 'sinon';

describe('UserInvitationForm', () => {
  describe('InternalUserInvitationFormAsyncAction', () => {
    const invitationHref = 'https://demo.api/hapi/user_invitations/0';
    const collectionHref = 'https://demo.api/hapi/user_invitations?status=sent';
    const actionHref = 'https://demo.api/virtual/empty?status=200';

    async function setup(actionStatus = 200, actionResponse?: () => Response) {
      const router = createRouter();
      const data = await getTestData<any>('./hapi/user_invitations/0');
      const requests: string[] = [];
      let isActionDone = false;

      const handleFetch = (evt: FetchEvent) => {
        const { method, url } = evt.request;
        requests.push(`${method} ${url}`);

        if (method === 'POST' && url === actionHref) {
          isActionDone = actionStatus === 200;
          const response = actionResponse?.() ?? new Response(null, { status: actionStatus });
          evt.respondWith(Promise.resolve(response));
        } else if (method === 'GET' && url === invitationHref && isActionDone) {
          const body = JSON.stringify({ ...data, status: 'revoked' });
          evt.respondWith(Promise.resolve(new Response(body)));
        } else {
          router.handleEvent(evt);
        }
      };

      const root = await fixture<HTMLDivElement>(html`
        <div @fetch=${handleFetch}>
          <foxy-nucleon group="fx-456" href=${collectionHref}></foxy-nucleon>
          <foxy-nucleon group="fx-456" parent=${collectionHref} href=${invitationHref}>
            <foxy-internal-user-invitation-form-async-action href=${actionHref}>
            </foxy-internal-user-invitation-form-async-action>
          </foxy-nucleon>
        </div>
      `);

      const [collection, invitation] = root.querySelectorAll<NucleonElement<any>>('foxy-nucleon');
      const control = root.querySelector<Control>(
        'foxy-internal-user-invitation-form-async-action'
      )!;

      control.nucleon = invitation;
      await waitUntil(() => collection.in('idle') && invitation.in('idle'), '', { timeout: 5000 });
      requests.length = 0;

      const button = control.renderRoot.querySelector('vaadin-button') as HTMLElement;
      return { requests, collection, invitation, control, button };
    }

    it('re-fetches the resource past the cache and shares it so that the parent reloads', async () => {
      const { requests, collection, invitation, control, button } = await setup();
      button.click();

      await waitUntil(
        () => invitation.data?.status === 'revoked' && requests.includes(`GET ${collectionHref}`),
        '',
        { timeout: 5000 }
      );

      await waitUntil(() => collection.in('idle'), '', { timeout: 5000 });
      expect(requests).to.include(`POST ${actionHref}`);
      expect(requests).to.include(`GET ${invitationHref}`);
      expect(control).to.have.nested.property('__state', 'idle');
    });

    it('enters fail state and shares nothing when the action fails', async () => {
      const { requests, invitation, control, button } = await setup(500);
      const shareSpy = spy(NucleonElement.Rumour('fx-456'), 'share');
      button.click();

      await waitUntil(() => (control as any).__state === 'fail', '', { timeout: 5000 });
      expect(requests).to.deep.equal([`POST ${actionHref}`]);
      expect(shareSpy).to.not.have.been.called;
      expect(invitation.data?.status).to.not.equal('revoked');
      shareSpy.restore();
    });

    it('enters access_denied state when the action is denied', async () => {
      const { control, button } = await setup(401, () =>
        createAccessDeniedResponse('write', 'user_invitation')
      );

      button.click();
      await waitUntil(() => (control as any).__state === 'access_denied', '', { timeout: 5000 });
      await control.requestUpdate();

      const label = control.renderRoot.querySelector('vaadin-button foxy-i18n');
      expect(label).to.have.property('key', 'access_denied');
      expect(control.renderRoot.querySelector('vaadin-button')).to.have.attribute('theme', 'error');
    });
  });
});
