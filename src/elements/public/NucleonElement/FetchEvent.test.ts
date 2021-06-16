import { API } from '@foxy.io/sdk/core';
import { FetchEvent } from './FetchEvent';
import { expect } from '@open-wc/testing';
import sinon from 'sinon';

describe('NucleonElement', () => {
  describe('FetchEvent', () => {
    it('successfully constructs an instance of FetchEvent extending Event', () => {
      const createEvent = () => {
        return new FetchEvent('fetch', {
          request: new API.WHATWGRequest('./test'),
          resolve: response => void response,
          reject: err => void err,
        });
      };

      expect(createEvent).to.not.throw();
      expect(createEvent()).to.be.instanceOf(Event);
    });

    it('exposes input Request as event.request', () => {
      const request = new API.WHATWGRequest('./test');
      const event = new FetchEvent('fetch', {
        resolve: response => void response,
        reject: err => void err,
        request,
      });

      expect(event).to.have.property('request', request);
    });

    it('provides a way of handling successful requests with event.respondWith()', async () => {
      const response = new Response();
      const request = new API.WHATWGRequest('./test');
      const resolve = sinon.stub();
      const reject = sinon.stub();
      const event = new FetchEvent('fetch', { request, resolve, reject });

      event.respondWith(Promise.resolve(response));
      await new Promise(r => setTimeout(r));

      expect(resolve).to.have.been.calledWith(response);
    });

    it('calls a way of handling failed requests with event.respondWith()', async () => {
      const request = new API.WHATWGRequest('./test');
      const resolve = sinon.stub();
      const reject = sinon.stub();
      const error = new Error();
      const event = new FetchEvent('fetch', { request, resolve, reject });

      event.respondWith(Promise.reject(error));
      await new Promise(r => setTimeout(r));

      expect(reject).to.have.been.calledWith(error);
    });
  });
});
