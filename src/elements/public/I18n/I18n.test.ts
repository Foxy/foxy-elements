import './index';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { I18n } from './I18n';
import { fake } from 'sinon';

describe('I18n', () => {
  it('exposes shared i18next instance as static property', () => {
    expect(I18n).to.have.property('i18next');
  });

  it('exposes onTranslationChange helper as static property', () => {
    const handler = fake();
    const events = ['initialized', 'loaded'];
    const off = I18n.onTranslationChange(handler);

    events.forEach(event => {
      I18n.i18next.emit(event);
      expect(handler).to.have.been.called;
      handler.resetHistory();
    });

    I18n.i18next.addResourceBundle('en', 'foo', { foo: 'bar' });
    expect(handler).to.have.been.called;
    handler.resetHistory();

    I18n.i18next.removeResourceBundle('en', 'foo');
    expect(handler).to.have.been.called;
    handler.resetHistory();

    off();
  });

  it('renders empty by default', async () => {
    const template = html`<foxy-i18n></foxy-i18n>`;
    const element = await fixture<I18n>(template);

    expect(element).to.have.deep.property('options', {});
    expect(element).to.have.property('lang', '');
    expect(element).to.have.property('key', '');
    expect(element).to.have.property('ns', '');
    expect(element).shadowDom.to.equal('<span></span>');
  });

  it('renders key when provided with no translations', async () => {
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18n>(template);

    expect(element).shadowDom.to.equal('<span>foo</span>');
  });

  it('loads and uses namespace when assigned', async () => {
    const resource = { foo: 'bar' };
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18n>(template);

    expect(element).shadowDom.to.equal('<span>foo</span>');

    const whenGotEvent = oneEvent(window, 'fetch');
    element.ns = 'baz';
    element.requestUpdate('ns');
    const event = (await whenGotEvent) as unknown as FetchEvent;

    expect(event.request).to.have.property('url', 'foxy://i18n/baz/en');

    event.preventDefault();
    event.respondWith(Promise.resolve(new Response(JSON.stringify(resource))));
    await new Promise(resolve => setTimeout(resolve));
    await element.requestUpdate();

    expect(element).shadowDom.to.equal('<span>bar</span>');
  });

  it('loads and uses language when assigned', async () => {
    const resource = { foo: 'bar' };
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18n>(template);

    expect(element).shadowDom.to.equal('<span>foo</span>');

    const whenGotEvent = oneEvent(window, 'fetch');
    element.lang = 'es';
    element.requestUpdate('lang');
    const event = (await whenGotEvent) as unknown as FetchEvent;

    expect(event.request).to.have.property('url', 'foxy://i18n/shared/es');

    event.preventDefault();
    event.respondWith(Promise.resolve(new Response(JSON.stringify(resource))));
    await new Promise(resolve => setTimeout(resolve));
    await element.requestUpdate();

    expect(element).shadowDom.to.equal('<span>bar</span>');
  });

  it('applies options when provided', async () => {
    I18n.i18next.addResource('en', 'shared', 'foo', 'bar {{baz}}');

    const template = html`<foxy-i18n key="foo" .options=${{ baz: 'qux' }}></foxy-i18n>`;
    const element = await fixture<I18n>(template);

    expect(element).shadowDom.to.equal('<span>bar qux</span>');
  });
});
