import type { QueryBuilder } from '../../public/QueryBuilder/QueryBuilder';

import './index';

import { InternalAsyncListControlFilterOverlay as Overlay } from './InternalAsyncListControlFilterOverlay';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay';
import { getByKey } from '../../../testgen/getByKey';
import { Type } from '../../public/QueryBuilder/types';

describe('InternalAsyncListControl', () => {
  describe('InternalAsyncListControlFilterOverlay', () => {
    it('extends OverlayElement', () => {
      expect(new Overlay()).to.be.instanceOf(OverlayElement);
    });

    it('has a name of foxy-internal-async-list-control-filter-overlay', () => {
      expect(Overlay).to.have.property('is', 'foxy-internal-async-list-control-filter-overlay');
    });

    it('renders query builder', async () => {
      const root = await fixture<HTMLDivElement>(html`<div></div>`);
      const overlay = new Overlay();

      overlay.renderer(root, null, { options: [], value: '', lang: '', ns: '' });
      const queryBuilder = root.querySelector('foxy-query-builder');

      expect(queryBuilder).to.exist;
      expect(queryBuilder).to.have.attribute('lang', '');
      expect(queryBuilder).to.have.attribute('ns', 'query-builder');
      expect(queryBuilder).to.have.property('value', '');
      expect(queryBuilder).to.have.deep.property('options', []);

      overlay.renderer(root, null, {
        options: [{ label: 'filter_1', type: Type.Boolean, path: 'test' }],
        value: 'foo=bar',
        lang: 'es',
        ns: 'test',
      });

      expect(queryBuilder).to.have.attribute('lang', 'es');
      expect(queryBuilder).to.have.attribute('ns', 'test query-builder');
      expect(queryBuilder).to.have.property('value', 'foo=bar');
      expect(queryBuilder).to.have.deep.property('options', [
        { label: 'filter_1', type: Type.Boolean, path: 'test' },
      ]);
    });

    it('renders search button', async () => {
      const root = await fixture<HTMLDivElement>(html`<div></div>`);
      const overlay = new Overlay();

      overlay.renderer(root, null, { options: [], value: '', lang: '', ns: '' });
      const queryBuilder = root.querySelector('foxy-query-builder') as QueryBuilder;
      const searchLabel = await getByKey(root, 'search');

      expect(searchLabel).to.exist;
      expect(searchLabel).to.have.property('lang', '');
      expect(searchLabel).to.have.property('ns', '');

      overlay.renderer(root, null, { options: [], value: '', lang: 'es', ns: 'test' });
      expect(searchLabel).to.have.property('lang', 'es');
      expect(searchLabel).to.have.property('ns', 'test');

      const searchButton = searchLabel?.closest('vaadin-button');
      expect(searchButton).to.exist;

      const whenGotEmptySearchEvent = oneEvent(overlay, 'search');
      searchButton?.click();
      const emptySearchEvent = await whenGotEmptySearchEvent;
      expect(emptySearchEvent).to.have.property('detail', '');

      queryBuilder.value = 'foo=bar';
      const whenGotSearchEvent = oneEvent(overlay, 'search');
      searchButton?.click();
      const searchEvent = await whenGotSearchEvent;
      expect(searchEvent).to.have.property('detail', 'foo=bar');
    });

    it('renders clear button', async () => {
      const root = await fixture<HTMLDivElement>(html`<div></div>`);
      const overlay = new Overlay();

      overlay.renderer(root, null, { options: [], value: '', lang: '', ns: '' });
      const clearLabel = await getByKey(root, 'clear');

      expect(clearLabel).to.exist;
      expect(clearLabel).to.have.property('lang', '');
      expect(clearLabel).to.have.property('ns', '');

      overlay.renderer(root, null, { options: [], value: '', lang: 'es', ns: 'test' });
      expect(clearLabel).to.have.property('lang', 'es');
      expect(clearLabel).to.have.property('ns', 'test');

      const clearButton = clearLabel?.closest('vaadin-button');
      expect(clearButton).to.exist;

      const whenGotClearEvent = oneEvent(overlay, 'search');
      clearButton?.click();
      const clearEvent = await whenGotClearEvent;
      expect(clearEvent).to.have.property('detail', null);
    });
  });
});
