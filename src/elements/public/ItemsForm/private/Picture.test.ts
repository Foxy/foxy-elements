import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

import { Picture } from './Picture';

customElements.define('x-picture', Picture);

describe('Preview', () => {
  describe('Picture', () => {
    it('has 0 for default quantity', () => {
      const picture = new Picture();
      expect(picture).to.have.property('quantity', 0);
    });

    it('has empty path for default image', () => {
      const picture = new Picture();
      expect(picture).to.have.property('image', '');
    });

    [0, 1, 99, 999].map(quantity => {
      it(`renders at least one visible image of a product for quantity of ${quantity}`, async () => {
        const image = 'https://picsum.photos/320';
        const template = html`<x-picture .image=${image} .quantity=${quantity}></x-picture>`;
        const picture = await fixture<Picture>(template);
        const images = [...picture.shadowRoot!.querySelectorAll('img')];

        const checks = images.map(el => {
          try {
            expect(el).to.have.property('src', image);
            expect(el).to.be.visible;
            return true;
          } catch (err) {
            return err;
          }
        });

        if (checks.every(v => v !== true)) throw checks[0];
      });
    });

    it('handles changes in quantity without errors', async () => {
      const image = 'https://picsum.photos/320';
      const template = html`<x-picture .image=${image}></x-picture>`;
      const picture = await fixture<Picture>(template);

      for (const quantity of [0, 1, 10, 99, 10, 1, 0]) {
        picture.quantity = quantity;
        await elementUpdated(picture);

        const images = [...picture.shadowRoot!.querySelectorAll('img')];
        const checks = images.map(el => {
          try {
            expect(el).to.have.property('src', image);
            expect(el).to.be.visible;
            return true;
          } catch (err) {
            return err;
          }
        });

        if (checks.every(v => v !== true)) throw checks[0];
      }
    });

    it('renders only one image when .empty is set to true', async () => {
      const image = 'https://picsum.photos/320';
      const template = html`<x-picture .quantity=${2} .empty=${true} .image=${image}></x-picture>`;
      const picture = await fixture<Picture>(template);
      const images = [...picture.shadowRoot!.querySelectorAll('img')];

      expect(images).to.have.length(1);
    });

    it('renders 2 images when .empty is changed to false with quantity > 1', async () => {
      const image = 'https://picsum.photos/320';
      const template = html`<x-picture .quantity=${2} .empty=${true} .image=${image}></x-picture>`;
      const picture = await fixture<Picture>(template);

      picture.empty = false;
      await elementUpdated(picture);

      const images = [...picture.shadowRoot!.querySelectorAll('img')];
      expect(images).to.have.length(2);
    });

    it('sets quantity and image via data shorthand', () => {
      const image = 'https://picsum.photos/320';
      const quantity = 5;

      const picture = new Picture();
      picture.data = { quantity, image };

      expect(picture).to.have.property('quantity', quantity);
      expect(picture).to.have.property('image', image);
    });

    it('renders a placeholder if image fails to load', async () => {
      const image = 'https://i.dont.exist.local/example.jpg';
      const template = html`<x-picture .quantity=${2} .image=${image}></x-picture>`;
      const picture = await fixture<Picture>(template);
      const images = picture.shadowRoot!.querySelectorAll('img');

      images.forEach(image => image.dispatchEvent(new Event('error')));
      await picture.updateComplete;
      images.forEach(image => expect(image).to.have.property('src', Picture.placeholder));
    });
  });
});
