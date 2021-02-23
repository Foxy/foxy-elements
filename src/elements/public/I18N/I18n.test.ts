import './index';

import { expect, fixture, html, oneEvent } from '@open-wc/testing';

import { FetchEvent } from '../NucleonElement/FetchEvent';
import { I18nElement } from './I18nElement';
import sinon from 'sinon';

describe('I18n', () => {
  it('exposes initial fallbackLng value as static property', () => {
    expect(I18nElement).to.have.property('fallbackLng', 'en');
  });

  it('exposes shared i18next instance as static property', () => {
    expect(I18nElement).to.have.property('i18next');
  });

  it('exposes onTranslationChange helper as static property', () => {
    const handler = sinon.fake();
    const events = ['initialized', 'removed', 'loaded', 'added'];
    const off = I18nElement.onTranslationChange(handler);

    events.forEach(event => {
      I18nElement.i18next.emit(event);
      expect(handler).to.have.been.called;
      handler.resetHistory();
    });

    off();
  });

  it('renders empty by default', async () => {
    const template = html`<foxy-i18n></foxy-i18n>`;
    const element = await fixture<I18nElement>(template);

    expect(element).to.have.deep.property('opts', {});
    expect(element).to.have.property('lang', '');
    expect(element).to.have.property('key', '');
    expect(element).to.have.property('ns', '');
    expect(element).shadowDom.to.equal('');
  });

  it('renders key when provided with no translations', async () => {
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18nElement>(template);

    expect(element).shadowDom.to.equal('foo');
  });

  it('loads and uses namespace when assigned', async () => {
    const resource = { foo: 'bar' };
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18nElement>(template);

    expect(element).shadowDom.to.equal('foo');

    element.ns = 'foo';
    const event = ((await oneEvent(window, 'fetch')) as unknown) as FetchEvent;

    expect(event.request).to.have.property('url', 'foxy://i18n/foo/en');

    event.preventDefault();
    event.respondWith(Promise.resolve(new Response(JSON.stringify(resource))));
    await new Promise(resolve => setTimeout(resolve));
    await element.updateComplete;

    expect(element).shadowDom.to.equal('bar');
  });

  it('loads and uses language when assigned', async () => {
    const resource = { foo: 'bar' };
    const template = html`<foxy-i18n key="foo"></foxy-i18n>`;
    const element = await fixture<I18nElement>(template);

    expect(element).shadowDom.to.equal('foo');

    element.lang = 'es';
    const event = ((await oneEvent(window, 'fetch')) as unknown) as FetchEvent;

    expect(event.request).to.have.property('url', 'foxy://i18n/global/es');

    event.preventDefault();
    event.respondWith(Promise.resolve(new Response(JSON.stringify(resource))));
    await new Promise(resolve => setTimeout(resolve));
    await element.updateComplete;

    expect(element).shadowDom.to.equal('bar');
  });

  it('applies options when provided', async () => {
    I18nElement.i18next.addResource('en', 'global', 'foo', 'bar {{baz}}');

    const template = html`<foxy-i18n key="foo" .opts=${{ baz: 'qux' }}></foxy-i18n>`;
    const element = await fixture<I18nElement>(template);

    expect(element).shadowDom.to.equal('bar qux');
  });
});
